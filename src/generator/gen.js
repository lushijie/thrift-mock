const Utils = require('@lushijie/utils');
const Tool = require('../tool');
const Processor = require('./');

module.exports = function(store, mapKey) {
  store = Utils.extend({}, store);
  return function gen(name, factory) {
    const type = Tool.findThriftType(store, name);
    if (type) {
      return Processor[type](store, name, mapKey, factory);
    }
    throw new Error(`未在 thrift 类型中找到: ${name}`)
  }
}