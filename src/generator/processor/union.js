const Struct = require('./struct');
const Utils = require('@lushijie/utils');
const Icon = require('../../constants/icon');
module.exports = function({syntax, gen}) {
  let res = {};
  Object.keys(syntax).forEach(key => {
    res = Utils.extend(res, Struct({
      syntax: {[`${Icon['optional']} ${key}`]: syntax[key]},
      gen,
    }));
  });
  return res;
}