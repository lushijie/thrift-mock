const Icon = require('../../constants/icon');
const Base = require('../base');
module.exports = function({syntax, gen}) {
  let res = {};
  Object.keys(syntax).forEach(key => {
    res[`${Icon['optional']} ${key}`] = Base({
      syntax: syntax[key],
      gen
    })
  });
  return res;
}