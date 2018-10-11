const Utils = require('@lushijie/utils');
const ThriftTool = require('../thrift-tool');
const Processor = require('./');

module.exports = function(store, mapKey = {}) {
  store = Utils.extend({}, store);
  return function (name, gen) {
    const type = ThriftTool.findThriftType(store, name);
    if (type) {
      if (Utils.isFunction(Processor[type])) {
        // return Processor[type](store[type][name], gen, mapKey);
        return Processor[type]({
          type,
          name,
          syntax: store[type][name],
          gen,
          mapKey
        });
      }
      throw new Error(`${type} 类型构造器不存在`);
    }
    throw new Error(`${name} 未在 thrift 定义中找到`);
  }
}