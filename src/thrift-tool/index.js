const path = require('path');
const Utils = require('@lushijie/utils');
const Parser = require('../parser');
const Generator = require('../generator');
const Thriftrw = require('thriftrw').Thrift;
const ALL_THRIFT_TYPE = require('../constants/type');
const Icon = require('../constants/icon');

module.exports = class ThriftTool {
  constructor() {
    this.store = {};
    this.result = {};
  }

  // 根据类型设置存储，
  _setStoreByType(type, payload) {
    this.store[type] = Utils.extend(this.store[type], payload);
  }

  // 获取存储空间
  getStore() {
    return this.store;
  }

  // 获取第N步的解析结果
  getResult(step) {
    if (!step) {
      return this.result;
    }
    return this.result[step];
  }

  // 解析
  parse(filePath, name) {
    let thriftrw;
    try {
      thriftrw = new Thriftrw({
        strict: false,
        entryPoint: path.resolve(filePath),
        allowOptionalArguments: true,
        defaultAsUndefined: false,
        allowIncludeAlias: true,
        allowFilesystemAccess: true,
      }).toJSON();
    } catch(e) {
      throw new Error(`语法错误，生成AST失败：${e}`);
    }

    this.result[0] = thriftrw;
    // console.log('--- 第 0 次原始解析结果 ---');
    // console.log(JSON.stringify(this.result[0], undefined, 2));

    const ENTRY_POINT = thriftrw.entryPoint;
    const DEFINITIONS = thriftrw['asts'][ENTRY_POINT]['definitions'];
    this.result[1] = DEFINITIONS;
    // console.log('--- 第 1 次 DEFINITION 解析结果 ---');
    // console.log(JSON.stringify(this.result[1], undefined, 2));

    DEFINITIONS.forEach(ele => {
      const type = ele.type.toLowerCase();
      const fn = Parser[type];
      if (Utils.isFunction(fn)) {
          this._setStoreByType(type, fn(ele, this));
      } else {
        throw new Error(`${type} 类型解析器不存在`);
      }
    });
    this.result[2] = Utils.extend({}, this.getStore());
    console.log('--- 第 2 次解析 ast转化 结果 ---');
    console.log(JSON.stringify(this.result[2], undefined, 2));

    const gen = this.genFactory();
    // this.resolveDefUnion(gen);
    // this.result[3] = Utils.extend({}, this.getStore());
    // console.log('--- 第 3 次解析 resolveDefUnion 结果 ---');
    // console.log(JSON.stringify(this.result[3], undefined, 2));

    let res = null; // 第4步返回的 json 不再存储到store
    if (!name) {
      // 不传具体获取的结构名时处理
      ALL_THRIFT_TYPE.forEach(type => {
        const typeStore = this.getStore()[type];
        res = res || {};
        res[type] = res[type] || {};
        if (typeStore) {
          Object.keys(typeStore).forEach(key => {
            if (key) {
              res[type][key] = gen(key)
            }
          });
        }
      });
    } else {
      res = gen(name);
    }
    this.result[4] = res;
    console.log('--- 第 4 次解析 json 结果 ---');
    console.log(JSON.stringify(this.result[4], undefined, 2));
    return res;
  }

  // 创建JSON格式的工厂函数
  genFactory() {
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
      if (matchedType) return;
      if (store[type] && store[type][name]) {
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

  // // typedef、union 类型的预先解析成json格式，方便后续直接替换
  // // typedef、union 解析json的时机早于其他类型
  // _replaceDefUnionType(gen) {
  //   const store = this.getStore();
  //   const fn = function(obj) {
  //     if (obj) {
  //       Object.keys(obj).map(key => {
  //         obj[key] = Generator['struct']({
  //           syntax: { [key]: obj[key] },
  //           gen
  //         })[key];
  //       });
  //     }
  //   }

  //   // typedef
  //   const theDef = store['typedef'];
  //   fn(theDef);

  //   // union
  //   const theUnion = store['union'];
  //   if (theUnion) {
  //     Object.keys(theUnion).map(name => {
  //       fn(theUnion[name]);
  //     });
  //   }
  // }

  // // 特定类型中的 union、typedef 的替换
  // resolveDefUnion(gen) {
  //   this._replaceDefUnionType(gen);
  //   const store = this.getStore();
  //   console.log('------------');
  //   console.log(JSON.stringify(store, undefined, 2));

  //   const replaceType= ['exception', 'struct', 'service'];
  //   replaceType.forEach(type => {
  //     const self = this;

  //     function fn(obj) {
  //       if (!Utils.isObject(obj)) return;
  //       Object.keys(obj).forEach(key => {
  //         let ele = obj[key];

  //         // ele 兼容 service baseService: null 的情况
  //         if (ele && ele.valueStyle === 'identifier') {
  //           const type = self.findThriftType(ele.valueType);

  //           console.log('++++');
  //           console.log(ele);

  //           // // typedef
  //           // if (type === 'typedef') {
  //           //   ele = Utils.extend(ele, {
  //           //     valueStyle: 'basetype',
  //           //     valueType: store['typedef'][ele.valueType]
  //           //   });
  //           // }

  //           console.log('------------');
  //           console.log(JSON.stringify(store, undefined, 2));

  //           // union
  //           if (type === 'union') {
  //             // union 嵌套处理
  //             if (ele && Utils.isObject(ele)) {
  //               return fn(ele);
  //             }
  //             const theUnion = store['union'][ele.valueType]
  //             ele = Utils.extend(ele, {
  //               valueStyle: 'union',
  //               valueType: Object.keys(theUnion).map(key => {
  //                 if (!Utils.isString(theUnion[key])) {
  //                   return JSON.stringify(theUnion[key]);
  //                 }
  //                 return theUnion[key]
  //               }).join(Icon['or']),
  //             });
  //           }
  //         }
  //       });
  //     };


  //     let preobj = store[type];
  //     if (!preobj) return;
  //     if (type === 'service') {
  //       // service 处理
  //       Object.keys(preobj).forEach(serviceName => {
  //         let preobj1 = preobj[serviceName];
  //         Object.keys(preobj1).forEach(key => {
  //           let preobj2 = preobj1['service'];
  //           Object.keys(preobj2).forEach(methodName => {
  //             let preobj3 = preobj2[methodName];
  //             fn(preobj3['returns']);
  //             fn(preobj3['arguments']);
  //             fn(preobj3['throws']);
  //           });
  //         });
  //       });
  //     } else {
  //       // struct/exception 同等处理
  //       Object.keys(preobj).forEach(ele => {
  //         fn(preobj[ele]);
  //       });
  //     }
  //   });
  // }
}