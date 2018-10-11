const Utils = require('@lushijie/utils');
const Tool = require('../tool');
const Processor = {
  const: require('./processor/const'),
  enum: require('./processor/enum'),
  struct: require('./processor/struct'),
};

module.exports = function(store, mapKey) {
  store = Utils.extend({}, store);
  return function gen(name) {
    const type = Tool.findThriftType(store, name);
    if (type) {
      return Processor[type](store, name);
    }
    throw new Error(`未在 thrift 类型中找到: ${name}`)
  }
}