const path = require('path');
const Utils = require('@lushijie/utils');
const Parser = require('../parser');
const Generator = require('../generator');
const Thriftrw = require('thriftrw').Thrift;
const ALL_THRIFT_TYPE = require('../constants/type');

module.exports = class ThriftTool {
  constructor() {
    this.store = {};
    this.result = {};
  }

  // 根据类型设置存储，
  _setStore(type, payload) {
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
    let thriftrwJSON;
    try {
      thriftrwJSON = new Thriftrw({
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

    this.result[1] = thriftrwJSON;
    console.log('--- 第 1 次原始解析结果 ---');
    console.log(JSON.stringify(this.result[1], undefined, 2));

    const ENTRY_POINT = thriftrwJSON.entryPoint;
    const DEFINITIONS = thriftrwJSON['asts'][ENTRY_POINT]['definitions'];

    DEFINITIONS.forEach(ele => {
      const type = ele.type.toLowerCase();
      const fn = Parser[type];
      if (Utils.isFunction(fn)) {
          this._setStore(type, fn(ele, this));
      } else {
        throw new Error(`${type} 类型解析器不存在`);
      }
    });
    this.result[2] = Utils.extend({}, this.getStore());
    console.log('--- 第 2 次解析 ast转化 结果 ---');
    console.log(JSON.stringify(this.result[2], undefined, 2));

    const gen = this.genFactory();

    // 最后构建的JSON不再存储到store
    let res = null;
    if (!name) {
      // 不传具体获取的结构名时，全量扫描
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
    this.result[3] = res;
    console.log('--- 第 3 次解析 json 结果 ---');
    console.log(JSON.stringify(this.result[3], undefined, 2));
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
}