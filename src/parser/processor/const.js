const ThriftTool = require('../../thrift-tool');
module.exports = function(ast) {
  return {
    [ast.id.name]: ThriftTool.resolveMixValue(ast.value)
  };
}