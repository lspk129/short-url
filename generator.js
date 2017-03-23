module.exports = (i) => {
  const letters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const getLetter = () => letters[Math.floor(Math.random() * letters.length)];
  // array method (run function n times)
  return [...Array(i)].map(() => getLetter()).join('');
};

/*
  * run function x times can be done also using recursion or loop methods

  // recursion
  const getResult = (i) => {
    if (i > 0) {
      result += getLetter();
      getResult(i - 1);
    }
  };
  getResult(5)

 // for loop
  for (let i = 0; i < 3; i += 1) {
    const num = Math.floor(Math.random() * letters.length);
    result += letters[num];
  }
  return result;
*/
