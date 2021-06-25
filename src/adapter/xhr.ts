import { isValidKey } from '../utils/index';
import { ServeDTO, reqDTO } from '../interface';

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
    str += `${k}=${JSON.stringify(data[k])}&`;
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
  request({ route, method = 'GET', param, data }: reqDTO) {
    return new Promise((resolve, reject) => {
      let site = this['baseURL'] + route;

      if (method === 'GET') {
        site += `?${transform(param)}`;
      }

      const headers = this['headers'];
      const ajax = new XMLHttpRequest();
      ajax.open(method, site, true);
      Object.keys(headers).forEach((key) => {
        if (isValidKey(key, headers)) {
          const value = headers[key];
          ajax.setRequestHeader(key, value + '');
        }
      });
      ajax.send(JSON.stringify(data));
      ajax.onreadystatechange = function () {
        if (ajax.readyState === 4) {
          resolve(JSON.parse(ajax.responseText));
        }
        if (ajax.status >= 500) {
          reject(ajax.responseText);
        }
      };
    });
  }
}

export default Serve;
