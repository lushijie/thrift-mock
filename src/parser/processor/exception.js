const struct = require('./struct.js');
module.exports = function(ast, thriftTool) {
  return struct(ast, thriftTool);
}