/*
 * @Author: lushijie
 * @Date:   2018-09-30 17:21:31
 * @Last Modified by:   lushijie
 * @Last Modified time: 2018-09-30 18:22:07
 */
const fs = require('fs');
const path = require('path');
const Thriftrw = require('thriftrw').Thrift;
const Parser = require('./parser');
const Generator = require('./generator');
const Utils = require('./utils');
const source = fs.readFileSync(path.join(__dirname, 'thrift.idl'), 'ascii');

// 数据存储
const STORE = {
  const: {},
  enum: {},
  exception: {},
  struct: {},
  typedef: {}
};

// 第一次解析
const thriftrw = new Thriftrw({
  source: source,
  strict: false,
  allowOptionalArguments: true,
  defaultAsUndefined: false
}).toJSON();

// 第二次解析
function secondParser(store, thriftrw) {
  const ENTRY_POINT = thriftrw.entryPoint;
  const DEFINITIONS = thriftrw['asts'][ENTRY_POINT]['definitions'];
  // console.log('第一次解析:', JSON.stringify(DEFINITIONS));

  DEFINITIONS.forEach(ele => {
    const type = ele.type.toLowerCase();
    const fn = Parser[type];
    if (Utils.is.isFunction(fn)) {
      fn(ele, store[type]);
      return;
    }
    console.error(`${type} 类型解析器不存在`);
  });
  // console.log('第二次解析:', JSON.stringify(store, undefined, 2));
  return store;
}
secondParser(STORE, thriftrw);

// 构造结构化的数据
const myGen = Generator(STORE, {
  Address: {
    code() {
      return 'aaa';
    }
  }
});

const res = myGen('Sex.MALE');
console.log(res);

