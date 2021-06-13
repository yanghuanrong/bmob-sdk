import Bmob from './bmob/index';

Bmob.initialize('c8bed465c9e6a524', '999999');

(async function () {
  const User = Bmob.Query('zz');
  // const data = await User.get('288f20076e');
  // console.log(data);
  User.set('title', '1234');
  User.save();
})();

export default Bmob;
