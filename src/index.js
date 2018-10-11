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
const Generator = require('./generator/gen');
const source = fs.readFileSync(path.join(__dirname, 'thrift.idl'), 'ascii');
const ThriftTool = require('./thrift-tool');
let STORE = require('./constants/store');

// 第一次解析
function firstParse() {
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
}

// 第二次解析
function secondParse() {
  const store = {};
  firstParse().forEach(ele => {
    const type = ele.type.toLowerCase();
    const fn = Parser[type];
    if (Utils.isFunction(fn)) {
      store[type] = Utils.extend(store[type], fn(ele));
      return;
    }
    throw new Error(`${type} 类型解析器不存在`);
  });
  return store;
}

STORE = Utils.extend(STORE, secondParse());
console.log('--- 第二次解析结果 ---');
STORE = ThriftTool.resolveTypedef(STORE);
console.log('--- 第三次解析结果 ---');

// 构造结构化的数据
const gen = Generator(STORE);
const res = gen('Teacher', gen);
console.log('res=', JSON.stringify(res, undefined, 2))
