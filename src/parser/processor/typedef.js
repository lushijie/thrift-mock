const Tool = require('../../tool');
module.exports = function(ast, store = {}) {
  const identifier = ast.id.name;
  store[identifier] = Tool.resolveMixType(ast.valueType);
  return store;
}