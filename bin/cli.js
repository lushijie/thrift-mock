#!/usr/bin/env node

const fs = require('fs');
const path = require("path");
const program = require('commander');
const ThriftTool = require('../src');

program
  .version('0.1.0')
  .option('-f, --file <value>', 'thrift file name')
  .option('-c, --class <value>', 'name of element')
  .option('-o, --output <value>', 'output file name')
  .parse(process.argv);

const inputPath = path.resolve(program.file);
const tt = new ThriftTool();
const res = tt.parse(inputPath, program.class);
const outputPath = path.resolve(program.output || `${path.parse(inputPath).name}.json`);
fs.writeFileSync(outputPath, JSON.stringify(res, undefined, 2), 'utf8');
