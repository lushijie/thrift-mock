const Utils = require('@lushijie/utils');
const Parser = require('../parser');
const ALL_THRIFT_TYPE = require('../constants/type');
const GenProcessor = require('../generator');
const Thriftrw = require('thriftrw').Thrift;

module.exports = class ThriftTool {
  constructor() {
    this.store = this._createStore();
  }

  parse(source, name) {
    let DEFINITIONS;
    try {
      const thriftrw = new Thriftrw({
        source: source,
        strict: false,
        allowOptionalArguments: true,
        defaultAsUndefined: false
      }).toJSON();
      const ENTRY_POINT = thriftrw.entryPoint;
      DEFINITIONS = thriftrw['asts'][ENTRY_POINT]['definitions'];
    } catch(e) {
      throw new Error(`语法错误，生成AST失败：${e}`);
    }

    // console.log('--- 第一次解析 thriftrw 结果 ---');
    // console.log(JSON.stringify(DEFINITIONS));

    DEFINITIONS.forEach(ele => {
      const type = ele.type.toLowerCase();
      const fn = Parser[type];
      if (Utils.isFunction(fn)) {
          this.setStoreByType(type, fn(ele, this));
      } else {
        throw new Error(`${type} 类型解析器不存在`);
      }
    });

    // console.log('--- 第二次解析 own 结果 ---');
    // console.log(JSON.stringify(this.getStore(), undefined, 2))

    this.resolveTypedef();
    // console.log('--- 第三次解析 resolveTypedef 结果 ---');
    // console.log(JSON.stringify(this.getStore(), undefined, 2));

    const gen = this.createJSON();
    this.resolveUnion(gen);
    // console.log('--- 第四次解析 resolveUnion 结果---');
    // console.log(JSON.stringify(this.getStore(), undefined, 2));

    console.log('--- 获得 JSON 格式 ---');
    console.log(JSON.stringify(gen(name), undefined, 2))
  }

  // 创建存储空间
  _createStore() {
    const store = {};
    ALL_THRIFT_TYPE.forEach(type => {
      store[type] = {};
    });
    return store;
  }

  setStoreByType(type, payload) {
    this.store[type] = Utils.extend(this.store[type], payload);
  }

  // 获取存储空间
  getStore() {
    return this.store;
  }

  createJSON() {
    const store = this.getStore();
    const self = this;
    return function gen(name) {
      const type = self.findThriftType(name);
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
  }

  // 查找 thrift 类型
  findThriftType(name) {
    const store = this.getStore();
    let matchedType = null;
    ALL_THRIFT_TYPE.forEach(type => {
      if (store[type][name] && !matchedType) {
        matchedType = type;
      }
    });
    return matchedType;
  }

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
        valueType: this.resolveMixType(valueType.valueType)
      }
    }

    if (valueStyle === 'map') {
      return {
        valueStyle,
        keyType: this.resolveMixType(valueType.keyType),
        valueType: this.resolveMixType(valueType.valueType)
      }
    }
  }

  // 嵌套 value 的解析
  resolveMixValue(value, prefix = 'const') {
    const valueType = value.type.toLowerCase();
    if (valueType === 'literal') {
      return value.value;
    }

    if (valueType === `${prefix}list` || valueType === `${prefix}set`) {
      return value.values.map(ele => {
        return this.resolveMixValue(ele);
      });
    }

    if (valueType === `${prefix}map`) {
      return value.entries.map(ele => {
        return {
          [ele.key.value]: this.resolveMixValue(ele.value)
        }
      });
    }
  }

  // 将 typedef 替换
  resolveTypedef() {
    const store = this.getStore();
    const replaceType= ['exception', 'struct', 'service'];
    replaceType.forEach(type => {
      const self = this;
      function fn(obj) {
        Object.keys(obj).forEach(key => {
          let ele = obj[key];
          if (
            ele &&  // 兼容 service baseService: null 的情况
            ele.valueStyle === 'identifier' &&
            self.findThriftType(ele.valueType) === 'typedef'
          ) {
            ele = Utils.extend(ele, store['typedef'][ele.valueType]);
          }
        });
      };

      Object.keys(store[type]).forEach(ele => {
        fn(store[type][ele]);
      });
    });
  }

  // Union 类型解析
  resolveUnion(gen) {
    const store = this.getStore();
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
      const self = this;
      function fn(obj) {
        Object.keys(obj).forEach(key => {
          let ele = obj[key];
          if (
            ele && // 兼容 service baseService: null 的情况
            ele.valueStyle === 'identifier' &&
            self.findThriftType(ele.valueType) === 'union'
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