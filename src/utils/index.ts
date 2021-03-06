import { pointDTO } from '../interface';
/**
 * 类型判断
 * @param targe
 * @returns
 */
export const isObject = (targe: any): boolean =>
  toString.call(targe) === '[object Object]';
export const isNumber = (targe: any): boolean =>
  toString.call(targe) === '[object Number]';
export const isString = (targe: any): boolean =>
  toString.call(targe) === '[object String]';
export const isUndefined = (targe: any): boolean =>
  toString.call(targe) === '[object Undefined]';
export const isBoolean = (targe: any): boolean =>
  toString.call(targe) === '[object Boolean]';
export const isArray = (targe: any): boolean =>
  toString.call(targe) === '[object Array]';
export const isFunction = (targe: any): boolean =>
  toString.call(targe) === '[object Function]';

/**
 * 判断地理坐标
 * @param point
 */
export function isPoint({ latitude, longitude }: pointDTO) {
  if (
    latitude < -90.0 ||
    latitude > 90.0 ||
    longitude < -180.0 ||
    longitude > 180.0
  ) {
    return false;
  }
  return true;
}

/**
 * 参数错误报错信息
 * @param param
 * @returns
 */
export function error(param: string | number) {
  const list: any = {
    400: 'incorrect parameter type. 参数类型错误',
    401: 'Parameter is null. 参数为空',
    402: 'Bmob.GeoPoint location error. 参数错误',
  };
  if (!list[param]) {
    console.error(`Error: ${param}`);
    throw Error();
  } else {
    console.error(`Error: ${list[param]}`);
    throw Error();
  }
}

/**
 * 判断key是否在对象上
 * @param key
 * @param object
 * @returns
 */
export function isValidKey(
  key: string | number | symbol,
  object: object
): key is keyof typeof object {
  return key in object;
}

/**
 * 随机生成16长度字符串成
 * @returns
 */
export function randomString(): string {
  const chars = [];
  for (let j = 97; j <= 122; j++) {
    chars.push(String.fromCharCode(j));
  }
  for (let i = 65; i <= 90; i++) {
    chars.push(String.fromCharCode(i));
  }
  for (let k = 0; k <= 9; k++) {
    chars.push(k);
  }
  let nums = '';
  for (let i = 0; i < 16; i++) {
    const id = parseInt(Math.random() * 61 + '');
    nums += chars[id];
  }
  return nums;
}
