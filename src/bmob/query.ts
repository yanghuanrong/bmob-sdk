import request from './request';
import { QUERY } from './api';
import { isObject, isString, isArray, isNumber, error } from 'src/utils';
import { injectProperty } from '../utils/decorator';

class Query {
  public tableName: string;
  public setData: any = {};
  public unsetData: any = {};
  public setArray: any = {};
  public setIncremen: any = {};

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
   * 删除字段的值
   * @param key
   */
  unset(key: string) {
    if (!isString(key)) {
      error(400);
    }
    this.unsetData[key] = {
      __op: 'Delete',
    };
  }

  /**
   * 删除一行数据
   * @param id
   * @returns
   */
  destroy(id?: string) {
    if (id && !isString(id)) {
      error(400);
    }
    const objectId = id || this.setData.objectId;
    return request(`${this.tableName}/${objectId}`, 'DELETE');
  }

  /**
   * 在一个数组的末尾加入一个给定的对象
   * @param key
   * @param val
   */
  add(key: string, value: Array<any>) {
    if (!isString(key) || !isArray(value)) {
      error(400);
    }
    this.setArray[key] = {
      __op: 'Add',
      objects: value,
    };
    return this;
  }

  /**
   * 把原本不存在的对象加入数组，加入的位置没有保证
   * @param key
   * @param val
   */
  addUnique(key: string, value: Array<any>) {
    if (!isString(key) || !isArray(value)) {
      error(400);
    }
    this.setArray[key] = {
      __op: 'AddUnique',
      objects: value,
    };
    return this;
  }

  /**
   * 删除数组
   * @param key
   * @param value
   */
  remove(key: string, value: Array<any>) {
    if (!isString(key) || !isArray(value)) {
      error(400);
    }
    this.setArray[key] = {
      __op: 'Remove',
      objects: value,
    };
    return this;
  }

  /**
   * 原子计数器
   * @param key
   * @param value
   */
  increment(key: string, value: number = 1) {
    if (!isString(key) || !isNumber(value)) {
      error(400);
    }
    this.setIncremen[key] = {
      __op: 'Increment',
      amount: value,
    };
  }

  /**
   * 保存数据
   */
  save() {
    const rest = {
      ...this.setData,
      ...this.unsetData,
      ...this.setArray,
      ...this.setIncremen,
    };
    const method = this.setData.objectId ? 'PUT' : 'POST';
    const objectId = this.setData.objectId || '';

    delete rest.createdAt;
    delete rest.updatedAt;
    delete rest.objectId;

    return request(`${this.tableName}/${objectId}`, method, rest);
  }
}

export default Query;
