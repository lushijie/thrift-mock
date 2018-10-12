/*
 * @Author: lushijie
 * @Date:   2018-09-30 17:21:31
 * @Last Modified by:   lushijie
 * @Last Modified time: 2018-09-30 18:22:07
 */
const fs = require('fs');
const path = require('path');
const ThriftTool = require('./thrift-tool');
const tt = new ThriftTool();

const source = fs.readFileSync(path.join(__dirname, 'thrift.idl'), 'ascii');
tt.parse(source, 'DishesCO');