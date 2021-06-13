import { isValidKey } from '../utils/index';
import { ServeDTO } from '../interface';

let XMLHttpRequest: any;

try {
  window && (XMLHttpRequest = window.XMLHttpRequest);
} catch (error) {}

try {
  // @ts-ignore
  global && (XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest);
} catch (error) {}

function transform(data: any) {
  let str = '';
  for (let k in data) {
    str += `${k}=${data[k]}`;
  }
  return str;
}

class Serve {
  baseURL: string;
  headers: object;
  constructor(config: ServeDTO) {
    this['baseURL'] = config.baseURL;
    this['headers'] = config.headers;
  }
  request(route: string, method = 'GET', param?: any) {
    return new Promise((resolve, reject) => {
      const site = this['baseURL'] + route;
      const headers = this['headers'];
      const ajax = new XMLHttpRequest();
      ajax.open(method, site, true);
      Object.keys(headers).forEach((key) => {
        if (isValidKey(key, headers)) {
          const value = headers[key];
          ajax.setRequestHeader(key, value + '');
        }
      });
      ajax.send(JSON.stringify(param));
      ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
          resolve(JSON.parse(ajax.responseText));
        }
        if (ajax.status >= 500) {
          reject(ajax.responseText);
        }
      };
    });
  }
  get(route: string, param: object) {
    const params = transform(param);
    return this.request('GET', route + params);
  }
  post(route: string, param: object) {
    return this.request('GET', route, param);
  }
}

export default Serve;
