const Base = require('../base');
module.exports = function structGen({syntax, gen}) {
  const res = {};
  Object.keys(syntax).forEach(key => {
    res[key] = Base({
      syntax: syntax[key],
      gen
    })
  });
  return res;
}