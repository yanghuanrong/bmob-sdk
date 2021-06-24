import request from './request';
import { QUERY, BATCH } from './api';
import { injectProperty, injectQuery, getParams } from '../utils/decorator';
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
  // 查询api路径
  public queryPath: string;

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

  // 或查询数据
  public orData: any = {};

  // 和查询数据
  public andData: any = {};

  // 分页数据
  public limitData: number = 100;

  // 跳页数据
  public skipData: number = 0;

  // 结果排序
  public orderData: any = null;

  // Pointer 关联表
  public includeData: any = null;

  // 指定列数据
  public selectData: any = null;

  // Relation数据
  public queryReilation: any = {};

  constructor(tableName: string) {
    this.queryPath = `${QUERY}/${tableName}`;
    this.tableName = tableName;
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
    const route = `${this.queryPath}/${id}`;
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
    return request(`${this.queryPath}/${objectId}`, 'DELETE');
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

    const result = await request(`${this.queryPath}/${objectId}`, method, rest);

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
        path: `${this.queryPath}/${id}`,
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

  /**
   * 条件查询 不包含在数组中
   * @param key
   * @param value
   * @returns
   */
  @injectQuery('$nin')
  notContainedIn(key: string, value: Array<any>) {
    if (!isString(key) || !isArray(value)) {
      error(400);
    }
    return this;
  }

  /**
   * 条件查询 这个key有值
   * @param key
   * @param value
   * @returns
   */
  @injectQuery('$exists', true)
  exists(key: string) {
    if (!isString(key)) {
      error(400);
    }
    return this;
  }

  /**
   * 条件查询 这个key无值
   * @param key
   * @param value
   * @returns
   */
  @injectQuery('$exists', false)
  doesNotExist(key: string) {
    if (!isString(key)) {
      error(400);
    }
    return this;
  }

  /**
   * 或查询
   * @param querys
   */
  or(...querys: any[]) {
    querys.forEach((item) => {
      if (!isObject(item)) {
        error(400);
      }
    });
    const queryData = this.queryData.$and;
    if (!isUndefined(queryData)) {
      for (let i = 0; i < queryData.length; i++) {
        for (let k = 0; k < querys.length; k++) {
          if (JSON.stringify(queryData[i]) === JSON.stringify(querys[k])) {
            this.queryData.$and.splice(i, 1);
          }
        }
      }
      if (!queryData.length) {
        delete this.queryData.$and;
      }
    }
    this.orData = {
      $or: querys,
    };
  }

  /**
   * 和查询
   * @param querys
   */
  and(...querys: any[]) {
    querys.forEach((item) => {
      if (!isObject(item)) {
        error(400);
      }
    });
    this.andData = {
      $and: querys,
    };
  }

  /**
   * 分页条数数据
   * @param param
   */
  limit(param: number) {
    if (!isNumber(param)) {
      error(400);
    }
    if (param > 1000) {
      param = 1000;
    }
    this.limitData = param;
  }

  /**
   * 跳页
   * @param parmas
   */
  skip(param: number) {
    if (!isNumber(param)) {
      error(400);
    }
    this.skipData = param;
  }

  /**
   * 结果排序
   * @param key
   */
  order(...param: string[]) {
    param.forEach((item) => {
      if (!isString(item)) {
        error(400);
      }
    });
    this.orderData = param.join(',');
  }

  /**
   * 查询 Pointer 关联表
   * @param param
   */
  include(...param: string[]) {
    param.forEach((item) => {
      if (!isString(item)) {
        error(400);
      }
    });
    this.includeData = param.join(',');
  }

  /**
   * 查询指定列
   * @param param
   */
  select(...param: string[]) {
    param.forEach((item) => {
      if (!isString(item)) {
        error(400);
      }
    });
    this.selectData = param.join(',');
  }

  /**
   * 设置需要查询的 Reilation 字段
   * @param key
   * @param objectId
   */
  field(key: string, objectId: string) {
    if (!isString(key) || !isString(objectId)) {
      error(400);
    }
    this.queryReilation.where = {
      $relatedTo: {
        object: {
          __type: 'Pointer',
          className: this.tableName,
          objectId: objectId,
        },
        key: key,
      },
    };
  }

  /**
   * 查询 relation 关联数据
   * @param tableName
   * @returns
   */
  relation(tableName: string) {
    if (!isString(tableName)) {
      error(400);
    }
    const name = tableName === '_User' ? 'users' : `classes/${tableName}`;
    this.queryReilation.count = 1;
    const parmas = {
      ...getParams(this),
      ...this.queryReilation,
    };
    return request(`/1/${name}`, 'GET', parmas);
  }
}

export default Query;
