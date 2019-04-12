#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const program = require('commander');
const chalk = require('chalk');
const stringifyObject = require('stringify-object');
const inquirer = require('inquirer');
const ThriftTool = require('../src');

const jsFileHeader = `
/**
  * genetate by thrift-mock
  * https://github.com/lushijie/thrift-mock
  * ------------------------------------------------------------------
  * legend:
  *   '◎': 基本类型，如bool, byte, i16, i32, i64 ,double, string, void
  *   '★': 必填字段
  *   '☆': 选填字段
  *   '✼': enum 类型
  *   '┇': enum 数值连接符
  * ------------------------------------------------------------------
 */

module.exports = `;
let params = {};

program
  .version('1.0.0')
  .option('-d, --dir <value>', '编译文件目录下的所有 .thrfit 文件')
  .option('-f, --file <value>', '编译指定的单个 .thrift 文件')
  .option('--match <value>', '需要获取的数据结构, struct.User')
  .option('--output <value>', '输出目录, 默认文件所在目录')
  .option('--outputExt <value>', '输出文件后缀, .js 或者 .json', '.js')
  .option('--inputExt <value>', '输入文件后缀', '.thrift')
  .option('--auto', '自动生成 mock 数据');

// for tmock inquirer
program
  .command('run')
  .action(() => {
    let promps = [{
      type: 'list',
      name: 'dirOrFile',
      message: '请选择, 编译文件还是目录:',
      default: 'dir',
      choices: [
        { name: '目录', value: 'dir' },
        { name: '文件', value: 'file' }
      ]
    }];
    inquirer.prompt(promps).then(answers => {
      params.dirOrFile = answers.dirOrFile;

      const thriftText = `请输入, ${answers.dirOrFile === 'dir' ? '目录路径' : '文件地址'}: `;
      const matchText = '请输入, 要获取的数据结构(如service.serviceName.methodName), 默认全部: ';
      promps = [{
        type: 'input',
        name: 'thrift', // thrift 路径，dir path 或者 file path
        message: thriftText,
        validate: (input) => {
          if (!input) {
            return console.log(chalk.red(`✘ ${thriftText}`));
          };
          return true;
        }
      }, {
        type: 'input',
        name: 'match', // 需要获取的数据结构，如 service.serviceName.methodName
        message: matchText
      }];
      inquirer.prompt(promps).then(answers => {
        params.thrift = answers.thrift;
        params.match = answers.match;

        console.log(chalk.green('<<< 以下参数都可以使用默认值, 一路回车即可 >>>'));
        const outputDefault = '默认与 thrift 文件相同位置:';
        promps = [{
          type: 'input',
          name: 'output',
          message: '请输入，输出的目录路径:',
          default: outputDefault
        }, {
          type: 'list',
          name: 'outputExt',
          message: '请选择，输出文件的后缀:',
          default: '.js',
          choices: [
            { name: '.js', value: '.js' },
            { name: '.json', value: '.json' }
          ]
        }, {
          type: 'input',
          name: 'inputExt',
          message: `请输入，输入文件的后缀:`,
          default: '.thrift'
        }, {
          type: 'list',
          name: 'auto',
          message: '是否自动生成 mock 数据',
          default: false,
          choices: [
            { name: 'Y', value: true },
            { name: 'N', value: false }
          ]
        }];
        inquirer.prompt(promps).then(answers => {
          params.output = (answers.output === outputDefault) ? null : answers.output;
          params.outputExt = answers.outputExt;
          params.inputExt = answers.inputExt;
          params.auto = answers.auto;
          run(params);
        });
      });
    });
  });

/**
 * 在 dir 文件夹中查找 ext 后缀的文件，返回文件路径列表
 * @param {string} dir 目录
 * @param {string} ext 后缀
 * @return {array} 文件路径数组
 */
function getFileFromDir(dir, ext) {
  let res = [];
  if (!fs.existsSync(dir)) {
    console.log(chalk.red('✘ 输入的路径不存在，请检查:', dir));
    return res;
  }
  const files = fs.readdirSync(dir);
  for (let i = 0; i < files.length; i++) {
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

/**
 * @description thrift 文件解析
 * @param {string} filePath 文件路径
 */
function parseThriftFile(filePath) {
  let outputPath = params.output;
  outputPath = outputPath || path.dirname(filePath); // 未指定，使用filePath dirname
  outputPath = path.resolve(outputPath);
  filePath = path.resolve(filePath);

  // 如果输入文件不带后缀，补充后缀
  if (!filePath.endsWith(params.inputExt)) {
    filePath = filePath + params.inputExt;
  }
  const fileName = path.parse(filePath).name;

  // 如果输出不带后缀，则当做一个目录输出
  if (!(outputPath.endsWith('.js') || outputPath.endsWith('.json'))) {
    outputPath = path.join(outputPath, fileName + '.mock' + params.outputExt);
  }

  if (!fs.existsSync(filePath)) {
    return console.log(chalk.red('✘ 输入的文件不存在，请检查:', filePath));
  }

  const thriftTool = new ThriftTool();
  let res = thriftTool.parse({filePath, auto: params.auto}) || {};

  if (params.match) {
    const condition = params.match.split('.');
    while (condition.length) {
      const key = condition.shift();
      res = res[key];
    }
  }

  // 输出到文件
  if (res) {
    console.log(chalk.green(`✔︎ 编译成功 ${outputPath}`));
    let outputResult = '';
    if (params.outputExt === '.js') { // js 类型输出
      outputResult = jsFileHeader + stringifyObject(res, {
        indent: '  '
      }) + ';';
    } else { // .json 类型输出
      outputResult = JSON.stringify(res, undefined, 2);
    }
    fs.writeFileSync(outputPath, outputResult, 'utf8');
  }
}

/**
 * @description 主函数
 * @param { Object } params 运行参数
 * @returns undefined
 */
function run(params) {
  if (params.dirOrFile === 'file') {
    parseThriftFile(params.thirft);
  } else if (params.dirOrFile === 'dir') {
    getFileFromDir(params.thrift, params.inputExt).forEach(function(filePath) {
      parseThriftFile(filePath);
    });
  }
}

// for tmock cli
program.parse(process.argv);
params = {
  dirOrFile: program.dir ? 'dir' : 'file',
  thrift: program.dir || program.file,
  match: program.match,
  output: program.output,
  outputExt: program.outputExt,
  inputExt: program.inputExt,
  auto: program.auto
};
if (params.thrift) {
  run(params);
}
