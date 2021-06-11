import core from './core';
// import md5 from '../utils/md5';
// import { randomString } from '../utils/index';
// import Web from '../adapter/web';

console.log(core, '此处是初始值', 'request文件');

// const secretKey = core.secretKey;
// const securityCode = core.securityCode;

// function setHeader(route: string, method: string, parma: object) {
//   console.log(secretKey, '000');
//   const t = Math.round(new Date().getTime() / 1000);
//   const body =
//     method === 'GET' || method === 'DELETE' ? '' : JSON.stringify(parma);
//   const random = randomString();
//   const sign = md5.utf8MD5(route + t + securityCode + random + body);
//   const header = {
//     'content-type': 'application/json',
//     'X-Bmob-SDK-Type': 'wechatApp',
//     'X-Bmob-Safe-Sign': sign,
//     'X-Bmob-Safe-Timestamp': t,
//     'X-Bmob-Noncestr-Key': random,
//     'X-Bmob-Secret-Key': secretKey,
//   };
//   return header;
// }

// const route = `/1/classes/_User`;
// const mehods = 'GET';
// const Serve = new Web({
//   baseURL: 'https://api2.bmob.cn',
//   headers: setHeader(route, mehods, {}),
// });

// Serve.request(mehods, route);

// console.log(core, '此处可以得到修改后的值');

export default core;
