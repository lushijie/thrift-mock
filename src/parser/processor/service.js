const Struct = require('./struct');
module.exports = function(ast, thriftTool) {
  const res = {};
  const identifier = ast.id.name;

  res[identifier] = {
    baseService: null,
    service: {}
  };

  if (ast.baseService) {
    res[identifier].baseService = {
      // 与 struct 结构保持统一，使用valueStyle、valueType
      valueStyle: ast.baseService.type.toLowerCase(), // 等于 identifier
      valueType: ast.baseService.name
    };
  }

  ast.functions.forEach(ele => {
    const key = ele.id.name;
    const field = {
      arguments: null,
      returns: null,
      throws: null,
      oneway: ele.oneway
    };

    field.returns = thriftTool.resolveMixType(ele.returns);
    field.arguments = Struct(ele, thriftTool)[key];
    field.throws = ele.throws && ele.throws.map(ele => {
      return {
        [ele.name]: thriftTool.resolveMixType(ele.valueType)
      };
    })[1]; // 0 为 success 结构， 1 为 error 结构
    res[identifier]['service'][key] = field;
  });
  return res;
};
