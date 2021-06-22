import request from './request';
import { QUERY, BATCH } from './api';
import { injectProperty, injectQuery } from '../utils/decorator';
import { pointDTO } from '../interface';
import {
  isObject,
  isString,
  isArray,
  isNumber,
  isPoint,
  isUndefined,
  error,
  isValidKey,
} from 'src/utils';

class Query {
  // 表名
  public tableName: string;

  // 需要保存的数据
  public setData: any = {};

  // 需要清空字段值的数据
  public unsetData: any = {};

  // 字段数组数据
  public setArray: any = {};

  // 原子计数器数据
  public setIncremen: any = {};

  // 地理位置
  public location: any = {};

  // 统计相关数据
  public stat: any = {};

  // 条件查询数据
  public queryData: any = {};

  constructor(tableName: string) {
    this.tableName = `${QUERY}/${tableName}`;
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
  set(key: any, value?: any) {
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
   * 设置地理坐标
   * @param key
   * @param point
   * @returns
   */
  setPoint(key: string, point: pointDTO) {
    if (!isPoint(point)) {
      error('402');
    }
    this.setData[key] = {
      __type: 'GeoPoint',
      ...point,
    };
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
  async save(param = {}) {
    if (!isObject(param)) {
      error(400);
    }
    const rest = {
      ...param,
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

    const result = await request(`${this.tableName}/${objectId}`, method, rest);

    this.setData = {};
    this.unsetData = {};
    this.setArray = {};
    this.setIncremen = {};

    return result;
  }

  /**
   * 批量保存
   */
  async saveAll(param: Array<any>) {
    if (!isArray(param)) {
      error(400);
    }
    if (param.length < 1) {
      error(401);
    }

    const key = param.map((item) => {
      const id = item.objectId || '';
      const method = item.objectId ? 'PUT' : 'POST';

      return {
        method: method,
        path: `${this.tableName}/${id}`,
        body: item.setData,
      };
    });

    return request(BATCH, 'POST', {
      requests: key,
    });
  }

  /**
   * 查询地理位置
   * @param field
   * @param param1
   * @param km
   * @returns
   */
  withinKilometers(key: string, point: pointDTO, km = 100) {
    this.location[key] = {
      $nearSphere: {
        __type: 'GeoPoint',
        ...point,
      },
      $maxDistanceInKilometers: km,
    };

    return this;
  }

  /**
   * 查询地理位置 矩形
   * @param field
   * @param param1
   * @param km
   * @returns
   */
  withinGeoBox(key: string, point: pointDTO, boxPoint: pointDTO) {
    this.location[key] = {
      $within: {
        $box: [
          {
            __type: 'GeoPoint',
            ...point,
          },
          {
            __type: 'GeoPoint',
            ...boxPoint,
          },
        ],
      },
    };
    return this;
  }

  /**
   * 统计数据查询
   * @param key
   * @param val
   * @returns
   */
  statTo(key: string, value: any) {
    if (!isString(key)) {
      error(400);
    }
    this.stat[key] = value;
    return this;
  }

  /**
   * 条件查询 判断值
   * @param key
   * @param operator
   * @param value
   */
  equalTo(key: string, operator: string, value: any) {
    if (!isString(key)) {
      error(400);
    }
    const operators = {
      '==': value,
      '===': value,
      '!=': { $ne: value },
      '<': { $lt: value },
      '<=': { $lte: value },
      '>': { $gt: value },
      '>=': { $gte: value },
    };

    if (isValidKey(operator, operators)) {
      const data = operators[operator];
      if (Object.keys(this.queryData).length) {
        if (!isUndefined(this.queryData.$and)) {
          this.queryData.$and.push(data);
        } else {
          this.queryData = {
            $and: [this.queryData, data],
          };
        }
      } else {
        this.queryData = data;
      }
    } else {
      error(400);
    }
    return this;
  }

  /**
   * 条件查询 包含在数组中
   * @param key
   * @param value
   * @returns
   */
  @injectQuery('$in')
  containedIn(key: string, value: Array<any>) {
    if (!isString(key) || !isArray(value)) {
      error(400);
    }
    return this;
  }
}

export default Query;
