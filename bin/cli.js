#!/usr/bin/env node

const fs = require('fs');
const path = require("path");
const program = require('commander');
const chalk = require('chalk');
const ThriftTool = require('../src');

program
  .version('0.1.0')
  .option('-f, --file <value>', 'thrift file with ext')
  .option('-c, --class <value>', 'class name for output')
  .option('-o, --output <value>', 'output file name with ext')
  .parse(process.argv);

if (!program.file) {
  return console.log(chalk.red('✘ 请输入要编译的 .thrift 文件，例如：tjson -f filename.thrift'));
}

const filePath = path.resolve(program.file);
if (!fs.existsSync(filePath)) {
  return console.log(chalk.red('✘ 输入的 .thrift 文件不存在，请检查所输入路径'));;
}

const thriftTool = new ThriftTool();
const outputPath = path.resolve(program.output || `${path.parse(filePath).name}.json`);

const res = thriftTool.parse(filePath, program.class);
if (res) {
  console.log(chalk.green(`✔︎ 编译成功，输出文件 ${outputPath}`));
  fs.writeFileSync(outputPath, JSON.stringify(res, undefined, 2), 'utf8');
}

