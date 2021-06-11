import Bmob from './bmob/index';

Bmob.initialize('c8bed465c9e6a524', '999999');

(async function () {
  const User = Bmob.Query('_User');
  const data = await User.get('288f20076e');
  console.log(data);
})();

export default Bmob;
