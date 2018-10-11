const Tool = require('../../tool');
module.exports = function(ast, store = {}) {
  const identifier = ast.id.name;
  store[identifier] = Tool.resolveMixValue(ast.value);
  return store;
}