module.exports = function(ast, thriftTool) {
  return {
    [ast.id.name]: thriftTool.resolveMixValue(ast.value)
  };
};
