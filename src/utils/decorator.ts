import { isUndefined } from './index';

/**
 * 给返回的数据注入属性
 * @param target
 * @param propertyKey
 * @param descriptor
 * @returns
 */
export function injectProperty(
  target: any,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<any>
): any {
  const originalMethod = descriptor.value;
  descriptor.value = async function (...args: any) {
    try {
      const result = await originalMethod.apply(this, args);
      const Query = Object.create(this);
      const rest = { ...result };

      Query.setData = rest;

      [
        'set',
        'setPoint',
        'unset',
        'destroy',
        'add',
        'addUnique',
        'remove',
        'increment',
        'save',
      ].forEach((key) => {
        Object.defineProperty(result, key, {
          value: Query[key].bind(Query),
        });
      });

      return result;
    } catch (error) {
      console.log(error);
    }
  };
  return descriptor;
}

/**
 * 添加条件查询数据
 * @param target
 * @param propertyKey
 * @param descriptor
 */
export function injectQuery(operator: string, val?: boolean) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any) {
      const self = originalMethod.apply(this, args);
      const [key, value] = args;
      const data = {
        [key]: {
          [operator]: value || val,
        },
      };
      if (Object.keys(self.queryData).length) {
        if (!isUndefined(self.queryData.$and)) {
          self.queryData.$and.push(data);
        } else {
          self.queryData = {
            $and: [self.queryData, data],
          };
        }
      } else {
        self.queryData = data;
      }

      return self;
    };
  };
}

/**
 * 获取 Query 对象的公有属性
 * @param self
 * @returns
 */
export function getParams(self: any) {
  let parmas: any = {};
  parmas.where = {
    ...self.queryData,
  };
  if (Object.keys(self.location).length) {
    parmas.where = {
      ...self.location,
      ...self.queryData,
    };
  }
  if (Object.keys(self.andData).length) {
    parmas.where = {
      ...self.andData,
      ...self.queryData,
    };
  }
  if (Object.keys(self.orData).length) {
    parmas.where = {
      ...self.orData,
      ...self.queryData,
    };
  }
  parmas.limit = self.limitData;
  parmas.skip = self.skipData;
  parmas.include = self.includeData;
  parmas.order = self.orderData;
  parmas.keys = self.selectData;

  if (Object.keys(self.stat).length) {
    parmas = {
      ...parmas,
      ...self.stat,
    };
  }

  for (const key in parmas) {
    if (
      (parmas.hasOwnProperty(key) && parmas[key] === null) ||
      parmas[key] === 0 ||
      parmas[key] === ''
    ) {
      delete parmas[key];
    }
  }
  return parmas;
}
