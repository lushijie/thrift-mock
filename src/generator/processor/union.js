const Struct = require('./struct');
module.exports = function({syntax, gen}) {
  return Struct(...arguments);
}