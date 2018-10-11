const Struct = require('./struct');
const Utils = require('@lushijie/utils');

module.exports = function({syntax, gen, mapKey}) {
  let res = {};
  Object.keys(syntax.service).forEach(key => {
    // 返回格式有待确认
    res[key] = {
      returns: Struct({
        syntax: {returns: syntax.service[key]['returns']},
        gen,
        mapKey
      }).returns,

      arguments: Struct({
        syntax: syntax.service[key]['arguments'],
        gen,
        mapKey
      }),

      // warn
      throws: syntax.service[key]['throws'] && Utils.objectToPairs(Struct({
        syntax: syntax.service[key]['throws'],
        gen,
        mapKey
      }))[0][1]
    }
  });

  if (syntax.baseService) {
    res = Utils.extend(res, gen(syntax.baseService.valueType, gen));
  }

  return res;
}