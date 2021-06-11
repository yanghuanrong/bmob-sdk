import Bmob from '../src/entry';

Bmob.initialize('c8bed465c9e6a524', '999999');

test('请求一条数据', async () => {
  const User = Bmob.Query('_User');
  const data: any = await User.get('288f20076e');
  expect(data.objectId).toBe('288f20076e');
});
