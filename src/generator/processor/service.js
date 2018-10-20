const Struct = require('./struct');
const Utils = require('@lushijie/utils');
const Base = require('../base');

module.exports = function({syntax, thriftTool}) {
  let res = {};
  Object.keys(syntax.service).forEach(key => {
    res[key] = {
      returns: Base({
        syntax: syntax.service[key]['returns'],
        thriftTool,
      }),

      arguments: Struct({
        syntax: syntax.service[key]['arguments'],
        thriftTool,
      }),

      // objectToPair 将 1:InvalidOperation e 把 e 名字过滤掉
      throws: syntax.service[key]['throws'] && Utils.objectToPairs(Struct({
        syntax: syntax.service[key]['throws'],
        thriftTool,
      }))[0][1]
    }
  });

  if (syntax.baseService) {
    res = Utils.extend(res, thriftTool.gen(syntax.baseService.valueType, thriftTool));
  }

  return res;
}