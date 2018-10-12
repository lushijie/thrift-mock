/*
 * @Author: lushijie
 * @Date:   2018-09-30 17:21:31
 * @Last Modified by:   lushijie
 * @Last Modified time: 2018-09-30 18:22:07
 */
const fs = require('fs');
const path = require('path');
const Utils = require('@lushijie/utils');
const Thriftrw = require('thriftrw').Thrift;
const Parser = require('./parser');
const source = fs.readFileSync(path.join(__dirname, 'thrift.idl'), 'ascii');
const ThriftTool = require('./thrift-tool');
let STORE = ThriftTool.createStore();

// 第一次解析
function firstParse() {
  try {
    const thriftrw = new Thriftrw({
      source: source,
      strict: false,
      allowOptionalArguments: true,
      defaultAsUndefined: false
    }).toJSON();
    const ENTRY_POINT = thriftrw.entryPoint;
    const DEFINITIONS = thriftrw['asts'][ENTRY_POINT]['definitions'];
    // console.log('--- 第一次解析 thriftrw 结果 ---');
    // console.log(JSON.stringify(DEFINITIONS));
    return DEFINITIONS;
  } catch(e) {
    throw new Error(`语法错误，生成AST失败：${e}`);
  }
}

// 第二次解析
function secondParse() {
  firstParse().forEach(ele => {
    const type = ele.type.toLowerCase();
    const fn = Parser[type];
    if (Utils.isFunction(fn)) {
      STORE[type] = Utils.extend(STORE[type], fn(ele));
      return;
    }
    throw new Error(`${type} 类型解析器不存在`);
  });

  console.log('--- 第二次解析 own 结果 ---');
  console.log(JSON.stringify(STORE, undefined, 2))

  console.log('--- 第三次解析 resolveTypedef 结果 ---');
  ThriftTool.resolveTypedef();
  console.log(JSON.stringify(STORE, undefined, 2));


  console.log('--- 第四次解析 resolveUnion 结果---');
  ThriftTool.resolveUnion(ThriftTool.createJSON(STORE));
  console.log(JSON.stringify(STORE, undefined, 2));
}

secondParse();

// 构造结构化的数据
let gen = ThriftTool.createJSON(STORE);
const res = gen('Honor2');
console.log('--- 获得 JSON 格式 ---');
console.log(JSON.stringify(res, undefined, 2))
