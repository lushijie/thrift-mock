const Tool = require('../../tool');
const Struct = require('./struct');
module.exports = function(ast, store = {}) {
  const identifier = ast.id.name;

  store[identifier] = {
    baseService: null,
    service: {},
  };

  // 与 Struct 结构保持统一
  if (ast.baseService) {
    store[identifier].baseService = {
      valueStyle: ast.baseService.type.toLowerCase(),
      valueType: ast.baseService.name
    }
  }

  ast.functions.forEach(ele => {
    const key = ele.id.name;
    const field = {
      arguments: null,
      returns: null,
      throws: null,
      oneway: ele.oneway,
    };

    field.returns = Tool.resolveMixType(ele.returns);
    field.arguments = Struct(ele)[key];
    field.throws = ele.throws && ele.throws.map(ele => {
      return {
        [ele.name]: Tool.resolveMixType(ele.valueType)
      }
    });
    store[identifier]['service'][key] = field;
  });
  return store;
}