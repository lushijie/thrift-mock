/*
 * @Author: lushijie
 * @Date:   2018-09-30 17:21:31
 * @Last Modified by:   lushijie
 * @Last Modified time: 2018-09-30 18:22:07
 */
const fs = require('fs');
const path = require('path');
const Thriftrw = require('thriftrw').Thrift;
const Convert = require('./convert');
const Radom = require('./random');
// const Utils = require('core-util-is');
const source = fs.readFileSync(path.join(__dirname, 'thrift.idl'), 'ascii');

const STORE = {
  const: {},
  enum: {},
  exception: {},
  struct: {},
  typedef: {}
}
const thriftrw = new Thriftrw({
  source: source,
  strict: false,
  allowOptionalArguments: true,
  defaultAsUndefined: false
}).toJSON();

const ENTRY_POINT = thriftrw.entryPoint;
const DEFINITIONS = thriftrw['asts'][ENTRY_POINT]['definitions'];
// console.log(JSON.stringify(DEFINITIONS));

DEFINITIONS.forEach(ele => {
  const type = ele.type.toLowerCase();
  const fn = Convert[type];
  fn(ele, STORE[type]);
});
// console.log(JSON.stringify(STORE));

// const parser = require('node-thrift-parser');
// console.log(JSON.stringify(parser(source)));

function createGen(store) {
  return function gen(type, name, mapKey = {}) {
    const item = {};
    const syntax = store[type][name];

    Object.keys(syntax).forEach(key => {
      const value = syntax[key];

      let valueType = value.type;
      if (mapKey[name] && mapKey[name][key]) {
        valueType = mapKey[name][key];
      }
      if (value.type) {
        item[key] = Radom[valueType]();
      }

      if (value.refer) {
        item[key] = gen('struct', value.refer);
      }
    });
    return item;
  }
}

const myGen = createGen(STORE);

const res = myGen('struct', 'User', {
  User: {
    id: 'id'
  }
});
console.log(res);

