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
export function injectQuery(operator: string) {
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
          [operator]: value,
        },
      };
      console.log(self.queryData);
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
