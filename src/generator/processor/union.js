const Icon = require('../../constants/icon');
const Base = require('../base');
module.exports = function({ syntax, thriftTool }) {
  const res = {};
  Object.keys(syntax).forEach(key => {
    let newKey = `${Icon['optional']}_${key}`;
    if (thriftTool.auto) {
      newKey = key;
    }
    res[newKey] = Base({
      syntax: syntax[key],
      thriftTool
    });
  });
  return res;
};
