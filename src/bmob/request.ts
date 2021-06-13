import core from './core';
import md5 from '../utils/md5';
import { randomString } from '../utils/index';
import Web from '../adapter/web';
import { baseURL } from './api';

function setHeader(route: string, method: string, parma: object) {
  const secretKey = core.secretKey;
  const securityCode = core.securityCode;
  const t = Math.round(new Date().getTime() / 1000);
  const body =
    method === 'GET' || method === 'DELETE' ? '' : JSON.stringify(parma);
  const random = randomString();
  const sign = md5.utf8MD5(route + t + securityCode + random + body);
  const header = {
    'content-type': 'application/json',
    'X-Bmob-SDK-Type': 'wechatApp',
    'X-Bmob-Safe-Sign': sign,
    'X-Bmob-Safe-Timestamp': t,
    'X-Bmob-Noncestr-Key': random,
    'X-Bmob-Secret-Key': secretKey,
  };
  return header;
}

function request(route: string, mehods: string, data?: any) {
  const Serve = new Web({
    baseURL,
    headers: setHeader(route, mehods, data),
  });
  return Serve.request(mehods, route, data);
}

export default request;
