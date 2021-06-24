import core from './core';
import md5 from '../utils/md5';
import { randomString } from '../utils/index';
import Web from '../adapter/xhr';
import { baseURL } from './api';

function setHeader(route: string, method: string, parma: object) {
  const secretKey = core.secretKey;
  const securityCode = core.securityCode;
  const v = 10;
  const t = Math.round(new Date().getTime() / 1000);
  const body =
    method === 'GET' || method === 'DELETE' ? '' : JSON.stringify(parma);

  const random = randomString();
  const sign = md5.utf8MD5(route + t + securityCode + random + body + v);

  const header = {
    'Content-Type': 'application/json',
    'X-Bmob-SDK-Type': 'wechatApp',
    'X-Bmob-Safe-Sign': sign,
    'X-Bmob-Safe-Timestamp': t,
    'X-Bmob-Noncestr-Key': random,
    'X-Bmob-Secret-Key': secretKey,
    'X-Bmob-SDK-Version': v,
  };
  return header;
}

function request(route: string, mehods: string, value?: any) {
  const Serve = new Web({
    baseURL,
    headers: setHeader(route, mehods, value),
  });
  const data: any = {
    route,
    mehods,
  };
  if (mehods === 'GET') {
    data.param = value;
  } else {
    data.data = value;
  }
  return Serve.request(data);
}

export default request;
