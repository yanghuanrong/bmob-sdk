import Bmob from './bmob/index';

Bmob.initialize('c8bed465c9e6a524', '999999');

(async function () {
  const User = Bmob.Query('zz');

  const data = await User.get('e7ccfddd96');
  console.log(data, '---');

  // User.set('title', '1234');
  // User.set({
  //   content: 'hello',
  // });
  // const data = await User.save();
  // console.log(data);
})();

export default Bmob;
