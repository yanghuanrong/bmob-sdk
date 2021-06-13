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

class Serve {
  baseURL: string;
  headers: object;
  constructor(config: ServeDTO) {
    this['baseURL'] = config.baseURL;
    this['headers'] = config.headers;
  }
  request(method: string, route: string, data?: any) {
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
      ajax.send(data);
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
}

export default Serve;
