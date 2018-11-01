const Struct = require('./struct');
module.exports = function({syntax, thriftTool}) {
  return Struct(...arguments);
};
