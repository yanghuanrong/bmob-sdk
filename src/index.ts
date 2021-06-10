import md5 from './utils/md5.js';
import { randomString } from './utils/index';

const id = '39ee83f92ff3a195130596a4eaec5ddf';
const key = 'a1223fca87f5d229953817f5c2493446';

interface headerDTO {
  readonly 'content-type': string;
  readonly 'X-Bmob-SDK-Type': string;
  readonly 'X-Bmob-Safe-Sign': string;
  readonly 'X-Bmob-Safe-Timestamp': number;
  readonly 'X-Bmob-Noncestr-Key': string;
  readonly 'X-Bmob-Secret-Key': string;
}

function setHeader(route: string, method: string, parma: object): headerDTO {
  const t = Math.round(new Date().getTime() / 1000);
  const body =
    method === 'get' || method === 'delete' ? '' : JSON.stringify(parma);
  const random = randomString();
  const sign = md5.utf8MD5(route + t + key + random + body);
  const header: headerDTO = {
    'content-type': 'application/json',
    'X-Bmob-SDK-Type': 'wechatApp',
    'X-Bmob-Safe-Sign': sign,
    'X-Bmob-Safe-Timestamp': t,
    'X-Bmob-Noncestr-Key': random,
    'X-Bmob-Secret-Key': id,
  };
  return header;
}

const route = `/1/classes/diary/fdffb09659`;
const ajax = new XMLHttpRequest();
ajax.open('GET', 'https://api2.bmob.cn/1/classes/diary/fdffb09659', true);

const header = setHeader(route, 'GET', {});
console.log(header);
Object.keys(header).forEach((key) => {
  const value = header[key];
  ajax.setRequestHeader(key, value + '');
});
ajax.send();
ajax.onreadystatechange = function () {
  if (ajax.readyState == 4 && ajax.status == 200) {
    console.log(ajax.responseText);
  }
};

console.log(setHeader);
