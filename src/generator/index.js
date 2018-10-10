const Tool = require('../tool');

const Processor = {
  const: require('./processor/const'),
  enum: require('./processor/enum'),
  struct: require('./processor/struct'),
};

module.exports = function(store, mapKey) {
  return function gen(name) {
    const type = Tool.findThriftType(store, name);
    return Processor[type](store, type, name);
  }
}