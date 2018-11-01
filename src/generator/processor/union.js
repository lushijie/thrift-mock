const Icon = require('../../constants/icon');
const Base = require('../base');
module.exports = function({syntax, thriftTool}) {
  const res = {};
  Object.keys(syntax).forEach(key => {
    res[`${Icon['optional']} ${key}`] = Base({
      syntax: syntax[key],
      thriftTool
    });
  });
  return res;
};
