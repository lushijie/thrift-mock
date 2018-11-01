const Base = require('../base');
module.exports = function structGen({syntax, thriftTool}) {
  const res = {};
  Object.keys(syntax).forEach(key => {
    res[key] = Base({
      syntax: syntax[key],
      thriftTool
    });
  });
  return res;
};
