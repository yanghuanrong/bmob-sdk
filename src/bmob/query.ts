import request from './request';
import { QUERY } from './api';
import { isObject, isString } from 'src/utils';

class Query {
  public tableName: string;
  public addData: any = {};
  constructor(tableName: string) {
    this.tableName = `${QUERY}${tableName}`;
  }

  /**
   * 通过主键获取一行记录
   * @param id
   * @returns
   */
  async get(id: string) {
    if (!isString(id)) {
      new Error('参数类型错误');
    }
    const route = `${this.tableName}/${id}`;
    const result = await request(route, 'GET');
    console.log(result);
    return result;
  }

  /**
   * 设置需要保存的值
   * @param key
   * @param value
   * @returns
   */
  set(key: any, value?: string) {
    if (isObject(key)) {
      this.addData = { ...this.addData, ...key };
    } else if (isString(key)) {
      this.addData[key] = value;
    } else {
      new Error('参数类型错误');
    }
    return this;
  }

  /**
   * 保存数据
   */
  save() {
    const saveData = this.addData;
    const method = 'POST';
    return request(`${this.tableName}`, method, saveData);
  }
}
export default Query;
