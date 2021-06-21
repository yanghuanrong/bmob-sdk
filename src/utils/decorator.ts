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
