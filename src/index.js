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
    // console.log('--- 第一次解析结果 ---');
    // console.log(JSON.stringify(DEFINITIONS));
    return DEFINITIONS;
  } catch(e) {
    throw new Error(`语法错误，生成AST失败：${e}`);
  }
}

// 第二次解析
function secondParse() {
  let STORE = ThriftTool.createStore();
  firstParse().forEach(ele => {
    const type = ele.type.toLowerCase();
    const fn = Parser[type];
    if (Utils.isFunction(fn)) {
      STORE[type] = Utils.extend(STORE[type], fn(ele));
      return;
    }
    throw new Error(`${type} 类型解析器不存在`);
  });

  // console.log('--- 第二次解析结果 ---');
  // console.log(JSON.stringify(STORE, undefined, 2))

  STORE = ThriftTool.resolveTypedef(STORE);
  STORE = ThriftTool.resolveUnion(STORE);
  console.log('--- 第三次解析结果 ---');
  console.log(JSON.stringify(STORE, undefined, 2))
  return STORE;
}
const STORE = secondParse();

// // 构造结构化的数据
const gen = ThriftTool.createJSON(STORE);
const res = gen('Honor2');
console.log('--- 获得 JSON 格式 ---');
console.log(JSON.stringify(res, undefined, 2))
