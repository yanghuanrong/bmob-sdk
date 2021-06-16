import request from './request';
import { QUERY } from './api';
import { isObject, isString, error } from 'src/utils';
import { injectProperty } from '../utils/decorator';

class Query {
  public tableName: string;
  public setData: any = {};
  constructor(tableName: string) {
    this.tableName = `${QUERY}${tableName}`;
  }

  /**
   * 通过主键获取一行记录
   * @param id
   * @returns
   */
  @injectProperty
  async get(id: string) {
    if (!isString(id)) {
      error(400);
    }
    const route = `${this.tableName}/${id}`;
    const result = await request(route, 'GET');
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
      this.setData = { ...this.setData, ...key };
    } else if (isString(key)) {
      key === 'id' && (key = 'objectId');
      this.setData[key] = value;
    } else {
      error(400);
    }
    return this;
  }

  /**
   * 保存数据
   */
  save() {
    const rest = { ...this.setData };
    const method = this.setData.objectId ? 'PUT' : 'POST';
    const objectId = this.setData.objectId || '';

    delete rest.createdAt;
    delete rest.updatedAt;
    delete rest.objectId;

    return request(`${this.tableName}/${objectId}`, method, rest);
  }
}

export default Query;
