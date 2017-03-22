module.exports = () => {
  const letters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = '';
  for (let i = 0; i < 3; i += 1) {
    const num = Math.floor(Math.random() * letters.length);
    result += letters[num];
  }
  return result;
}
