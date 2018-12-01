#!/usr/bin/env node

/* eslint-disable */
const fs = require('fs');
const path = require('path');
const program = require('commander');
const Utils = require('@lushijie/utils');
const chalk = require('chalk');
const stringifyObject = require('stringify-object');
const ThriftTool = require('../src');

program
  .version('1.0.0')
  .option('-d, --dir <value>', '编译文件目录下的所有 .thrfit 文件')
  .option('-f, --file <value>', '编译指定的单个 .thrift 文件')
  .option('--output <value>', '输出目录, 默认文件所在目录')
  .option('--outext <value>', '输出文件后缀，.js 或者 .json', '.js')
  .option('--inext <value>', '输入文件后缀', '.thrift')
  .option('--name <value>', '输出特定的 thrift 结构，如只输出某一个 service')
  .parse(process.argv);

const params = {
  dir: program.dir,
  file: program.file,
  output: program.output,
  outext: program.outext,
  inext: program.inext,
  name: Utils.isFunction(program.name) ? undefined : program.name,
};

const jsFileHeader = `
/**
  * @Genetate by: think-json
  * @Github: https://github.com/lushijie/thrift-json
  * @Date: ${Utils.dateTimeFormat(new Date(), 'yyyy-MM-dd hh:mm:ss')}
 */

module.exports =
`;

if (!params.dir && !params.file) {
  console.log(chalk.red('✘ Please input dir or file of the thrift file...'));
}

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

function convertFile(filePath) {
  let outputPath = params.output;
  outputPath = outputPath || path.dirname(filePath);   // 未指定，使用filePath dirname
  outputPath = path.resolve(outputPath);
  filePath = path.resolve(filePath);

  // 如果输入文件不带后缀，补充后缀
  if (!filePath.endsWith(params.inext)) {
    filePath = filePath + params.inext;
  }
  const fileName = path.parse(filePath).name;

  // 如果输出不带后缀，则当做一个目录输出
  if (!(outputPath.endsWith('.js') || outputPath.endsWith('.json'))) {
    outputPath = path.join(outputPath, fileName + '.mock' + params.outext);
  }

  if (!fs.existsSync(filePath)) {
    return console.log(chalk.red('✘ 输入的文件不存在，请检查:', filePath));
  }

  const thriftTool = new ThriftTool();
  const res = thriftTool.parse(filePath, params.name);
  if (res) {
    console.log(chalk.green(`✔︎ 编译成功 ${outputPath}`));
    let outputResult = '';
    if (params.outext === '.js') {
      // js 类型输出
      outputResult = jsFileHeader + stringifyObject(res, {
        indent: '  ',
      });
    } else {
      // .json 类型输出
      outputResult = JSON.stringify(res, undefined, 2);
    }
    fs.writeFileSync(outputPath, outputResult, 'utf8');
  }
}

if (params.file) {
  convertFile(params.file)
} else if (params.dir) {
  getFileFromDir(params.dir, params.inext).forEach(function(filePath) {
    convertFile(filePath);
  });
}
