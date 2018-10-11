const ThriftTool = require('../../thrift-tool');
module.exports = function(ast) {
  const store = {};
  const identifier = ast.id.name;
  store[identifier] = ThriftTool.resolveMixValue(ast.value);
  return store;
}