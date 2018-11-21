#!/usr/bin/env node

/* eslint-disable */
const fs = require('fs');
const path = require('path');
const program = require('commander');
const chalk = require('chalk');
const ThriftTool = require('../src');

program
  .version('0.1.0')
  .option('-d, --dir <value>', 'compile all .thrift file in the dir')
  .option('-f, --file <value>', 'single thrift file you want to convert')
  .option('-c, --class <value>', 'class name for output')
  .option('-o, --output <value>', 'the output path')
  .option('-e, --ext <value>', 'thrift file extension')
  .parse(process.argv);

const extension = program.ext || '.thrift';

function getFileFromDir(dir, ext){
  let res = [];
  if (!fs.existsSync(dir)) {
    console.log(chalk.red('✘ 输入的路径不存在，请检查:', dir));;
    return res;
  }
  const files = fs.readdirSync(dir);
  for(let i = 0; i< files.length; i++) {
    var filename = path.join(dir, files[i]);
    var stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      res = res.concat(getFileFromDir(filename, ext));
    } else if (filename.indexOf(ext) >= 0) {
      res.push(path.resolve(filename));
    };
  };
  return res;
};

function convertFile(filePath, outputPath) {
  // outputPath 不传入，使用filePath dirname
  outputPath = outputPath || path.dirname(filePath);

  outputPath = path.resolve(outputPath);
  filePath = path.resolve(filePath);

  // 如果输入文件不带后缀，补充后缀
  if (!filePath.endsWith(extension)) {
    filePath = filePath + extension;
  }
  const fileName = path.parse(filePath).name;

  // 如果输出不带后缀，当做一个目录输出，补充fileName与后缀
  if (!outputPath.endsWith('.json')) {
    outputPath = path.join(outputPath, fileName + '.json');
  }

  if (!fs.existsSync(filePath)) {
    return console.log(chalk.red('✘ 输入的文件不存在，请检查:', filePath));
  }

  const thriftTool = new ThriftTool();
  const res = thriftTool.parse(filePath, program.class);
  if (res) {
    console.log(chalk.green(`✔︎ 编译成功 ${outputPath}`));
    fs.writeFileSync(outputPath, JSON.stringify(res, undefined, 2), 'utf8');
  }
}

if (program.file) {
  convertFile(program.file, program.output)
} else if (program.dir) {
  getFileFromDir(program.dir, extension).forEach(function(filePath) {
    convertFile(filePath, program.output);
  });
}
