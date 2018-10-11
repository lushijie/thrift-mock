const struct = require('./struct.js');
module.exports = function(ast, store = {}) {
  struct(ast, store)
  return store;
}