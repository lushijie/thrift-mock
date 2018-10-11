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
const Generator = require('./generator');
const ALL_THRIFT_TYPE = require('./constants/type');
const source = fs.readFileSync(path.join(__dirname, 'thrift.idl'), 'ascii');

// 初始化数据存储
const STORE = {};
ALL_THRIFT_TYPE.forEach(type => {
  STORE[type] = {};
});

const thriftrw = new Thriftrw({
  source: source,
  strict: false,
  allowOptionalArguments: true,
  defaultAsUndefined: false
}).toJSON();

// 第一次解析
function firstParse(thriftrw) {
  const ENTRY_POINT = thriftrw.entryPoint;
  const DEFINITIONS = thriftrw['asts'][ENTRY_POINT]['definitions'];
  console.log('--- 第一次解析 ---');
  console.log(JSON.stringify(DEFINITIONS));
  return DEFINITIONS;
}
// firstParse(thriftrw);

// 第二次解析
function secondParse(store, thriftrw) {
  firstParse(thriftrw).forEach(ele => {
    const type = ele.type.toLowerCase();
    const fn = Parser[type];
    if (Utils.isFunction(fn)) {
      store[type] = Utils.extend(store[type], fn(ele));
      return;
    }
    console.error(`${type} 类型解析器不存在`);
  });
  console.log('第二次解析:', JSON.stringify(store, undefined, 2));
  return store;
}
secondParse(STORE, thriftrw);

// // 构造结构化的数据
// const myGen = Generator(STORE, {
//   Address: {
//     code() {
//       return 'aaa';
//     }
//   }
// });

// const res = myGen('Sex');
// console.log(res);

