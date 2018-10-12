const ThriftTool = require('../../thrift-tool');
const Struct = require('./struct');
module.exports = function(ast) {
  const res = {};
  const identifier = ast.id.name;

  res[identifier] = {
    baseService: null,
    service: {},
  };

  // 与 Struct 结构保持统一
  if (ast.baseService) {
    res[identifier].baseService = {
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

    field.returns = ThriftTool.resolveMixType(ele.returns);
    field.arguments = Struct(ele)[key];

    // warn
    field.throws = ele.throws && ele.throws.map(ele => {
      return {
        [ele.name]: ThriftTool.resolveMixType(ele.valueType)
      }
    })[1]; // 0 为 success 结构
    res[identifier]['service'][key] = field;
  });
  return res;
}