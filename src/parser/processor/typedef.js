module.exports = function(ast, thriftTool) {
  return {
    [ast.id.name]: thriftTool.resolveMixType(ast.valueType)
  };
};
