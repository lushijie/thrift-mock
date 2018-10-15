const Utils = require('@lushijie/utils');
const Parser = require('../parser');
const Generator = require('../generator');
const Thriftrw = require('thriftrw').Thrift;
const ALL_THRIFT_TYPE = require('../constants/type');

module.exports = class ThriftTool {
  constructor() {
    this.store = this._createStore();
  }

  // 解析
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
      if(!DEFINITIONS) {
        throw new Error(`解析结果为空: ${JSON.stringify(thriftrw)}`);
      }
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
    console.log('--- 第二次解析 ast转化 结果 ---');
    console.log(JSON.stringify(this.getStore(), undefined, 2))

    const gen = this.createJSON();
    this.resolveTypedef(gen);
    // console.log('--- 第三次解析 resolveTypedef 结果 ---');
    // console.log(JSON.stringify(this.getStore(), undefined, 2));

    this.resolveUnion(gen);
    // console.log('--- 第四次解析 resolveUnion 结果---');
    // console.log(JSON.stringify(this.getStore(), undefined, 2));

    if (!name) {
      let ALL = {};
      ALL_THRIFT_TYPE.forEach(type => {
        ALL[type] = ALL[type] || {};
        Object.keys(this.getStore()[type]).forEach(key => {
          if (key) {
            ALL[type][key] = gen(key)
          }
        })
      });
      return ALL;
    }

    return gen(name);
  }

  // 创建存储空间
  _createStore() {
    const store = {};
    ALL_THRIFT_TYPE.forEach(type => {
      store[type] = {};
    });
    return store;
  }

  // 根据类型设置存储
  setStoreByType(type, payload) {
    this.store[type] = Utils.extend(this.store[type], payload);
  }

  // 获取存储空间
  getStore() {
    return this.store;
  }

  // 创建JSON格式
  createJSON() {
    const store = this.getStore();
    const self = this;
    return function gen(name) {
      const type = self.findThriftType(name);
      if (type) {
        const fn = Generator[type];
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
  resolveTypedef(gen) {
    const store = this.getStore();

    // repleace typedef
    const theDef = store['typedef'];
    Object.keys(theDef).map(key => {
      theDef[key] = Generator['struct']({
        syntax: {
          [key]: theDef[key]
        },
        gen
      })[key];
    });

    const replaceType= ['exception', 'struct', 'service'];
    replaceType.forEach(type => {
      const self = this;

      function fn(obj) {
        if (!Utils.isObject(obj)) {
          return;
        }
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

      let preobj = store[type];
      if (type === 'service') {
        Object.keys(preobj).forEach(serviceName => {
          let preobj1 = preobj[serviceName];
          Object.keys(preobj1).forEach(key => {
            let preobj2 = preobj1['service'];
            Object.keys(preobj2).forEach(methodName => {
              let preobj3 = preobj2[methodName];
              fn(preobj3['returns']);
              fn(preobj3['arguments']);
              fn(preobj3['throws']);
            });
          });
        });
      } else {
        Object.keys(preobj).forEach(ele => {
          fn(preobj[ele]);
        });
      }
    });
  }

  // union 类型替换
  resolveUnion(gen) {
    const store = this.getStore();

    // replace union
    const theUnion = store['union'];
    Object.keys(theUnion).map(name => {
      Object.keys(theUnion[name]).forEach(key => {
        theUnion[name][key] = Generator['struct']({
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
        if (!Utils.isObject(obj)) {
          return;
        }
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
            });
          }

          if (ele && Utils.isObject(ele)) {
            fn(ele);
          }
        });
      };

      let preobj = store[type];
      if (type === 'service') {
        Object.keys(preobj).forEach(serviceName => {
          let preobj1 = preobj[serviceName];
          Object.keys(preobj1).forEach(key => {
            let preobj2 = preobj1['service'];
            Object.keys(preobj2).forEach(methodName => {
              let preobj3 = preobj2[methodName];
              fn(preobj3['returns']);
              fn(preobj3['arguments']);
              fn(preobj3['throws']);
            });
          });
        });
      } else {
        Object.keys(preobj).forEach(ele => {
          fn(preobj[ele]);
        });
      }
    });
  }
}