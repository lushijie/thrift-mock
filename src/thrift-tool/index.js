const path = require('path');
const Utils = require('@lushijie/utils');
const Parser = require('../parser');
const Generator = require('../generator');
const Thriftrw = require('@lushijie/thriftrw').Thrift;
const ALL_THRIFT_TYPE = require('../constants/type');

module.exports = class ThriftTool {
  constructor() {
    this.store = {};
    this.result = {};
    this.includeFile = {}; // includeFile ast content
    this.includeAlias = {}; // include 文件别名映射
    this.includeStack = []; // 当前 include 堆栈情况
    this.auto = false; // 自动生成mock数据，可能是非语义化数据
  }

  getAuto() {
    return this.auto;
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

  // 获取第 N 步解析结果
  getResult(step) {
    if (!step) {
      return this.result;
    }
    return this.result[step];
  }

  // 设置第 N 步解析结果
  setResult(step, payload) {
    this.result[step] = Utils.extend({}, payload);
  }

  // 根据 AST 创建 JSON 结构
  get gen() {
    return (name) => {
      let structName = name;

      // include . 的特殊处理
      if (name.indexOf('.') > -1) {
        this.includeStack.push(this.includeAlias[name.split('.')[0]]);
        structName = name.split('.')[1];
      }

      let store = this.includeFile[this.includeStack.slice().pop()];
      let type = this.findThriftType(structName, store);

      // include 堆栈导致一些结构名需要遍历所有的 thrift file
      while (this.includeStack.length && !type && name.indexOf('.') === -1) {
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
            thriftTool: this
          });
        }
        throw new Error(`${type} 类型的构造器在 generator 中不存在`);
      }
      throw new Error(`${name} 未在 thrift ast 语法树中搜寻到`);
    };
  }

  // 查找 thrift 类型
  findThriftType(name, store = this.store) {
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
      };
    }

    if (valueStyle === 'set' || valueStyle === 'list') {
      return {
        valueStyle,
        valueType: this.resolveMixType(valueType.valueType)
      };
    }

    if (valueStyle === 'map') {
      return {
        valueStyle,
        keyType: this.resolveMixType(valueType.keyType),
        valueType: this.resolveMixType(valueType.valueType)
      };
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
        };
      });
    }
  }

  // 解析 definition
  parseDefinition(definition) {
    const res = {};
    definition.forEach(ele => {
      const type = ele.type.toLowerCase();
      const fn = Parser[type];
      if (Utils.isFunction(fn)) {
        res[type] = Utils.extend(res[type], fn(ele, this));
      } else {
        throw new Error(`${type} 类型解析器在 parser 中不存在`);
      }
    });
    return res;
  }

  // 根据 name 获取最后的 JSON，构建结果不再存储到store
  getJSONByName(name) {
    let res = null;
    if (!name) { // 不传具体获取的结构名时，全量扫描
      ALL_THRIFT_TYPE.forEach(type => {
        const typeStore = this.store[type];
        res = res || {};
        res[type] = res[type] || {};
        if (typeStore) {
          Object.keys(typeStore).forEach(key => {
            if (key) {
              res[type][key] = this.gen(key);
            }
          });
        }
      });
    } else {
      res = this.gen(name);
    }
    return res;
  }

  // 入口
  parse({filePath, name, auto}) {
    this.auto = auto;
    const sourceResult = new Thriftrw({
      strict: false,
      entryPoint: path.resolve(filePath),
      allowOptionalArguments: true,
      defaultAsUndefined: false,
      allowIncludeAlias: true,
      allowFilesystemAccess: true
    }).toJSON();
    this.setResult(1, sourceResult);
    // console.log('--- 第 1 次解析 origin 结果 ---');
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
      }
    });

    const DEFINITIONS = sourceResult['asts'][ENTRY_POINT]['definitions'];
    const definitionResult = this.parseDefinition(DEFINITIONS);
    this.setStore(definitionResult);
    this.setResult(2, this.store);
    // console.log('--- 第 2 次解析 ast 结果 ---');
    // console.log(JSON.stringify(this.result[2], undefined, 2));

    const res = this.getJSONByName(name);
    this.setResult(3, res);
    // console.log('--- 第 3 次解析 json 结果 ---');
    // console.log(JSON.stringify(this.result[3], undefined, 2));
    return res;
  }
};
