const fs = require('fs');
const path = require('path');
const source = fs.readFileSync(path.join(__dirname, 'thrift.idl'), 'ascii');
const parser = require('node-thrift-parser');

const ast = parser(source);
console.log(JSON.stringify(ast));