#!/usr/bin/env node

/* eslint-disable */
const fs = require('fs');
const path = require('path');
const program = require('commander');
const Utils = require('@lushijie/utils');
const chalk = require('chalk');
const stringifyObject = require('stringify-object');
const inquirer = require('inquirer');
const ThriftTool = require('../src');

const jsFileHeader = `
/**
  * @Genetate by: think-json
  * @Github: https://github.com/lushijie/thrift-json
  * @Date: ${Utils.dateTimeFormat(new Date(), 'yyyy-MM-dd hh:mm:ss')}
 */

module.exports = `;
let params = {};

program
  .version('1.0.0')
  .option('-d, --dir <value>', '编译文件目录下的所有 .thrfit 文件')
  .option('-f, --file <value>', '编译指定的单个 .thrift 文件')
  .option('--name <value>', '输出特定的 thrift 结构，如只输出某一个 service 的名字')
  .option('--method <value>', '输出 service 中的某个方法')
  .option('--output <value>', '输出目录, 默认文件所在目录')
  .option('--outext <value>', '输出文件后缀，.js 或者 .json', '.js')
  .option('--inext <value>', '输入文件后缀', '.thrift')

program
  .command('run')
  .action(() => {
    let promps = [{
      type: 'list',
      name: 'dfType',
      message: '请选择, 编译文件还是目录:',
      default: 'dir',
      choices: [{
          name: '目录',
          value: 'dir'
        }, {
          name: '文件',
          value: 'file'
      }]
    }];
    inquirer.prompt(promps).then(answers => {
      params.dfType = answers.dfType;
      const tempText = answers.dfType === 'dir' ? '目录路径' : '文件地址';
      promps = [{
        type: 'input',
        name: 'dfPath',
        message: `请输入, ${tempText}:`,
        validate: function (input) {
          if (!input) {
            console.log(chalk.red(`✘ 请输入${tempText}`));;
            return false;
          };
          return true;
        }
      }];
      inquirer.prompt(promps).then(answers => {
        console.log(chalk.green('-- 以下参数都可以使用默认值 ---'));
        params[params.dfType] = answers.dfPath;
        const outputDefault = '默认 .thrift 文件所在的目录';
        const nameDefault = '默认全部输出';
        const methodDefault = '如果指定method, 则必须指定 name 为特定的 service 名称';
        promps = [{
          type: 'input',
          name: 'output',
          message: `请输入，输出的目录路径:`,
          default: outputDefault,
        }, {
          type: 'input',
          name: 'name',
          message: `请输入，特定的 thrift 结构名称(如某一个 struct 名称):`,
          default: nameDefault,
        }, {
          type: 'input',
          name: 'method',
          message: `请输入，输出 service 中特定的 method:`,
          default: methodDefault
        }, {
          type: 'list',
          name: 'outext',
          message: '请选择，输出后缀:',
          default: '.js',
          choices: [
            {
              name: '.js',
              value: '.js'
            },
            {
              name: '.json',
              value: '.json'
            }
          ]
        }, {
          type: 'input',
          name: 'inext',
          message: `请输入，输入的 thrift 文件后缀:`,
          default: '.thrift',
        }];
        inquirer.prompt(promps).then(answers => {
          params.name = (answers.name === nameDefault) ? undefined : answers.name;
          params.method = (answers.method === methodDefault) ? undefined : answers.method;
          params.output = (answers.output === outputDefault) ? undefined : answers.output;
          params.outext = answers.outext;
          params.inext = answers.inext;
          run(params);
        });
      });
    });
  });

program.parse(process.argv);

params = {
  dir: program.dir,
  file: program.file,
  output: program.output,
  outext: program.outext,
  inext: program.inext,
  method: program.method,
  name: Utils.isFunction(program.name) ? undefined : program.name, // 参数形式下不传name，默认返回funtion
};

function getFileFromDir(dir, ext){
  let res = [];
  if (!fs.existsSync(dir)) {
    console.log(chalk.red('✘ 输入的路径不存在，请检查:', dir));
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
  let res = thriftTool.parse(filePath, params.name) || {};

  // 获取特定service中的特定method
  if (params.method) {
    res = res[params.method];
  }

  // 输出到文件
  if (res) {
    console.log(chalk.green(`✔︎ 编译成功 ${outputPath}`));
    let outputResult = '';
    if (params.outext === '.js') { // js 类型输出
      outputResult = jsFileHeader + stringifyObject(res, {
        indent: '  ',
      });
    } else { // .json 类型输出
      outputResult = JSON.stringify(res, undefined, 2);
    }
    fs.writeFileSync(outputPath, outputResult, 'utf8');
  }
}

function run(params) {
  console.log(params);
  // if (!params.dir && !params.file) {
  //   console.log(chalk.red('✘ Please input dir or file of the thrift file...'));
  // }

  if (!params.name && params.method) {
    return console.log(chalk.red('✘ name is required if method exist...'));
  }

  if (params.file) {
    convertFile(params.file)
  } else if (params.dir) {
    getFileFromDir(params.dir, params.inext).forEach(function(filePath) {
      convertFile(filePath);
    });
  }
}

if (params.dir || params.file) {
  run(params);
}