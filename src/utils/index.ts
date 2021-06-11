export function isValidKey(
  key: string | number | symbol,
  object: object
): key is keyof typeof object {
  return key in object;
}

export function randomString(): string {
  const chars = [];
  for (let j = 97; j <= 122; j++) {
    chars.push(String.fromCharCode(j));
  }
  for (let i = 65; i <= 90; i++) {
    chars.push(String.fromCharCode(i));
  }
  for (let k = 0; k <= 9; k++) {
    chars.push(k);
  }
  let nums = '';
  for (let i = 0; i < 16; i++) {
    const id = parseInt(Math.random() * 61 + '');
    nums += chars[id];
  }
  return nums;
}
