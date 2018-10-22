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
    this.gen = this.createGen();
    this.includeFile = {};
    this.includeAlias = {};
    this.includeStack = [];
  }

  // 根据类型设置存储
  setStore(type, payload) {
    if (!Utils.isString(type)) {
      payload = type;
      this.store = Utils.extend(this.store, payload);
      return;
    }
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

  setResult(step, payload) {
    this.result[step] = Utils.extend({}, payload);
  }

  // 解析
  parse(filePath, name) {
    const sourceResult = this.parseSource(filePath);
    this.setResult(1, sourceResult);
    console.log('--- 第 1 次解析 origin 结果 ---');
    // console.log(JSON.stringify(this.result[1], undefined, 2));

    const ENTRY_POINT = sourceResult.entryPoint;
    this.includeStack.push(path.parse(ENTRY_POINT).name);
    Object.keys(sourceResult.asts).forEach(fileName => {
      const ast = sourceResult['asts'][fileName];
      fileName = path.parse(fileName).name;
      this.includeFile[fileName] = this.parseDefinition(ast['definitions']);
      this.includeAlias[fileName] = fileName;

      if (ast.headers.length > 0) {
        ast.headers.forEach(ele => {
          if (ele.namespace) {
            this.includeAlias[ele.namespace.name] = path.parse(ele.id).name;
          }
        });
      } else {
        this.includeAlias[fileName] = fileName;
      }
    });

    const DEFINITIONS = sourceResult['asts'][ENTRY_POINT]['definitions'];
    const definitionResult = this.parseDefinition(DEFINITIONS);
    this.setStore(definitionResult);
    this.setResult(2, this.getStore());
    console.log('--- 第 2 次解析 ast 结果 ---');
    console.log(JSON.stringify(this.result[2], undefined, 2));

    let res = this.getLastJSON(name);
    this.setResult(3, res);
    console.log('--- 第 3 次解析 json 结果 ---');
    console.log(JSON.stringify(this.result[3], undefined, 2));
    return res;
  }

  parseSource(filePath) {
    let res = null;
    try {
      res = new Thriftrw({
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
    return res;
  }

  parseDefinition(definition) {
    const res = {}
    definition.forEach(ele => {
      const type = ele.type.toLowerCase();
      const fn = Parser[type];
      if (Utils.isFunction(fn)) {
        res[type] = Utils.extend(res[type], fn(ele, this));
      } else {
        throw new Error(`${type} 类型解析器不存在`);
      }
    });
    return res;
  }

  getLastJSON(name) {
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
              res[type][key] = this.gen(key)
            }
          });
        }
      });
    } else {
      res = this.gen(name);
    }
    return res;
  }

  // generator
  createGen() {
    return (name) => {
      let structName = name;

      // include, .的特殊处理，这里可能有问题，不一定是include, 也可能是const 之类
      if (name.indexOf('.') > -1) {
        this.includeStack.push(this.includeAlias[name.split('.')[0]]);
        structName = name.split('.')[1];
      }

      let store = this.includeFile[this.includeStack.slice().pop()];
      let type = this.findThriftType(structName, store);

      // include 堆栈导致一些结构名需要遍历所有的thrift file
      while(this.includeStack.length && !type && name.indexOf('.') === -1) {
        this.includeStack.pop();
        store = this.includeFile[this.includeStack.slice().pop()];
        type = this.findThriftType(structName, store);
      }

      if (type) {
        const fn = Generator[type];
        if (Utils.isFunction(fn)) {
          return fn({
            structName,
            syntax: store[type][structName],
            thriftTool: this,
          });
        }
        throw new Error(`${type} 类型构造器不存在`);
      }
      throw new Error(`${name} 未在 thrift 定义中找到`);
    }
  }

  // 查找 thrift 类型
  findThriftType(name, store = this.getStore()) {
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