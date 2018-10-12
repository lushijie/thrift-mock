const Utils = require('@lushijie/utils');
const ALL_THRIFT_TYPE = require('../constants/type');
const GenProcessor = require('../generator');
let STORE = null;
let MAP_KEY = null;

module.exports = {
  // 创建存储空间
  createStore() {
    STORE = {};
    ALL_THRIFT_TYPE.forEach(type => {
      STORE[type] = {};
    });
    return STORE;
  },

  // 获取存储空间
  getStore() {
    return STORE;
  },

  createJSON() {
    const store = module.exports.getStore();
    return function gen(name) {
      const type = module.exports.findThriftType(name);
      if (type) {
        const fn = GenProcessor[type];
        if (Utils.isFunction(fn)) {
          return fn({
            name,
            syntax: store[type][name],
            gen,
          });
        }
        throw new Error(`${type} 类型构造器不存在`);
      }
      throw new Error(`${name} 未在 thrift 定义中找到`);
    }
  },

  // 查找 thrift 类型
  findThriftType(name) {
    const store = module.exports.getStore();
    let matchedType = null;
    ALL_THRIFT_TYPE.forEach(type => {
      if (store[type][name] && !matchedType) {
        matchedType = type;
      }
    });
    return matchedType;
  },

  // 嵌套 type 的解析
  resolveMixType(valueType) {
    const valueStyle = valueType.type.toLowerCase();
    if (valueStyle === 'basetype') {
      return {
        valueStyle,
        valueType: valueType.baseType
      };
    }

    if (valueStyle === 'identifier') {
      return {
        valueStyle,
        valueType: valueType.name
      }
    }

    if (valueStyle === 'set' || valueStyle === 'list') {
      return {
        valueStyle,
        valueType: module.exports.resolveMixType(valueType.valueType)
      }
    }

    if (valueStyle === 'map') {
      return {
        valueStyle,
        keyType: module.exports.resolveMixType(valueType.keyType),
        valueType: module.exports.resolveMixType(valueType.valueType)
      }
    }
  },

  // 嵌套 value 的解析
  resolveMixValue(value, prefix = 'const') {
    const valueType = value.type.toLowerCase();
    if (valueType === 'literal') {
      return value.value;
    }

    if (valueType === `${prefix}list` || valueType === `${prefix}set`) {
      return value.values.map(ele => {
        return module.exports.resolveMixValue(ele);
      });
    }

    if (valueType === `${prefix}map`) {
      return value.entries.map(ele => {
        return {
          [ele.key.value]: module.exports.resolveMixValue(ele.value)
        }
      });
    }
  },

  // 将 typedef 替换
  resolveTypedef() {
    const store = module.exports.getStore();
    const replaceType= ['exception', 'struct', 'service'];
    replaceType.forEach(type => {
      function fn(obj) {
        Object.keys(obj).forEach(key => {
          let ele = obj[key];
          if (
            ele &&  // 兼容 service baseService: null 的情况
            ele.valueStyle === 'identifier' &&
            module.exports.findThriftType(ele.valueType) === 'typedef'
          ) {
            ele = Utils.extend(ele, store['typedef'][ele.valueType]);
          }
        });
      };

      Object.keys(store[type]).forEach(ele => {
        fn(store[type][ele]);
      });
    });
  },

  // Union 类型解析
  resolveUnion(gen) {
    const store = module.exports.getStore();
    const theUnion = store['union'];

    Object.keys(theUnion).map(name => {
      Object.keys(theUnion[name]).forEach(key => {
        theUnion[name][key] = GenProcessor['struct']({
          syntax: {
            [key]: theUnion[name][key]
          },
          gen
        })[key];
      });
    });

    const replaceType= ['exception', 'struct', 'service'];
    replaceType.forEach(type => {
      function fn(obj) {
        Object.keys(obj).forEach(key => {
          let ele = obj[key];
          if (
            ele && // 兼容 service baseService: null 的情况
            ele.valueStyle === 'identifier' &&
            module.exports.findThriftType(ele.valueType) === 'union'
          ) {
            const theUnion = store['union'][ele.valueType]
            ele = Utils.extend(ele, {
              valueStyle: 'union',
              valueType: Object.keys(theUnion).map(key => {
                if (!Utils.isString(theUnion[key])) {
                  return JSON.stringify(theUnion[key]);
                }
                return theUnion[key]
              }).join('|'),
              union: true,
            });
          }
        });
      };

      Object.keys(store[type]).forEach(ele => {
        fn(store[type][ele]);
      });
    });
  }
}