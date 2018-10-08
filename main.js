/*
 * @Author: lushijie
 * @Date:   2018-09-30 17:21:31
 * @Last Modified by:   lushijie
 * @Last Modified time: 2018-09-30 18:22:07
 */
const fs = require('fs');
const path = require('path');
const Thriftrw = require('thriftrw').Thrift;
const AstParser = require('./parser');
const Generator = require('./generator');
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

console.log(JSON.stringify(DEFINITIONS));

DEFINITIONS.forEach(ele => {
  const type = ele.type.toLowerCase();
  console.log(type);
  Generator[type](ele, STORE[type])
});

console.log(JSON.stringify(STORE));

// const parser = require('node-thrift-parser');
// console.log(JSON.stringify(parser(source)));