# thrift-mock

[![npm](https://img.shields.io/npm/v/@lushijie/thrift-mock.svg?colorB=brightgreen&style=flat-square)](https://www.npmjs.com/package/@lushijie/thrift-mock)

### 1. 前言

我们当前开发模式：客户端请求 Node 层， Node 层通过 thrift 与后端 rpc 通信， Node 层以 json 格式将获取到的数据返回客户端，大家在定义好 .thrift 文件之后前后端就各自开始开发了...

对于前端来说，现在没有可用的接口拿不到返回结果。但是 Node 层和客户端需要 mock 数据来写逻辑。这时候就需要翻译 .thrift 文件，来获取接口将会返回的数据结构，然后再为每个字段 mock 特定数据。

我们可以看懂 idl 表达的数据结构，但是当数据结构超级复杂的时候，我们在脑海中其实已经启动了一个“线程”将其快速地转化为 json 结构，每次写逻辑都会走一遍这个”翻译“流程。当使用了 ”include“ 命令的时候就更麻烦了，要来回的切换文件，切着切着就忘记刚刚看过的结构了...

biu biu ... thrift-mock 就诞生了！ thrift-mock 是一个根据 .thrift 文件生成对应数据结构的工具，当然也可以 mock 出相应的数据。

### 2. 输出示例

`tmock -f a.thrift`

<p>
  <img src="./demo.png">
</p>

## 3. 基本特性
  * 支持 const、enum、typedef、struct、exception、union、service 基本数据结构
  * 支持多层数据类型的嵌套
  * 支持多层数据结构的嵌套
  * 支持 include & include alias
  * 支持 service extend

### 4. 如何使用

#####  4.1. 命令行

npm install @lushijie/thrift-mock -g

tmock 参数：
* -d 要编译的包含thrift文件的目录
* -f 要编译的thrift文件
* [--match] 需要获取的数据结构, 如 struct.User
* [--auto] 是否自动生成mock数据
* [--output <value>] 重定向文件输出目录，默认文件所在的目录
* [--outext <value>] 输出文件后缀，支持 .js 和 .json， 默认 .js
* [--inext <value>] thrift 文件后缀，默认 .thrift

```
使用示例，存在如下目录：
* demo
  * case
    * a.thrift
    * b.thrift
进入 cd /demo，此时目录存在 case 目录，目录中包含 a.thrift 与 b.thrift

1. 编译 case 下所有的 .thrift 文件 （在 case 目录下生成 a.mock.js、b.mock.js）
  tmock -d ./case

2. 编译 case 下的所有 .thrift 文件，并改变输出目录（在 /a 目录下生成 a.mock.js、b.mock.js）
  tmock -d ./case --output /a

3. 编译 case 下的 a.thrift 文件（在 case 目录下生成 a.mock.js）
  tmock -f ./case/a.thrift

4. 编译 case 下的 a.thrift 文件，并重命名 （在 case 目录下生成 a1.json）
  tmock -f ./case/a.thrift --output ./case/a1.json
  * 此处重命名文件后缀只能是 .js 或者 .json

5. 编译 case 下的 a.thrift 中 User 结构体（在 case 目录下生成 a.json，仅包含 User 结构体）
  tmock -f ./case/a.thrift --match struct.User

6. 编译 case 下所有的 .thrift 文件，生成 .json 文件（在 case 目录下生成 a.mock.json、b.mock.json）
  tmock -d ./case --outext .json

7. 编译 case 下的 a.thrift 文件， 输出 service 中 SMSService 的 send 方法
  tmock -f a.thrift --match service.SMSService.send

8. 自动生成 mock 数据
  tmock -f a.thrift --auto
```

##### 4.2. 交互式命令

tmock run

tmock run 通过交互式的命令来使用，这样就不用记这么多的参数了！

##### 4.3. node 调用
npm install @lushijie/thrift-mock --save

```js
// 获取 a.thrift 中 User 结构体的结构
const thriftTool = require('@lushijie/thrift-mock');
const res = thriftTool.parse({filePath: '/usr/a.thrift', auto: true});
console.log(res);
```

### 5. 输出标识

```js
module.exports = {
  basic: '◎', // 基本类型，如 bool, byte, i16, i32, i64 ,double, string, void
  required: '★', // 必填字段
  optional: '☆', // 选填字段
  enum: '✼', // enum 类型
  enum_or: '┇' // enum 连接符
}
```

### 6. 生成 mock 数据

获取到数据结构之后，接下来就是生成 mock 数据，但是现实的情况是每个字段都有很强的语义，比如一个菜品 mock 出来一个城市名，这是不行的！也不可能为每个字段指定 mock 规则。

所以提供了 --auto 参数，如果提供了 auto 参数，会根据 thrift 基本类型生成一些无语义的随机数...如果mock 数据语义化要求较高，可以在生成的 .js 文件中自行使用各种各样的 random 类库创造属于自己的 mock 数据 ！！！

### 相关问题
1. [https://github.com/thriftrw/thriftrw-node/issues/162](https://github.com/thriftrw/thriftrw-node/issues/162)
2. [https://github.com/thriftrw/thriftrw-node/issues/163](https://github.com/thriftrw/thriftrw-node/issues/163)

第三方库暂时还没有解决上述问题，所以 fork 了一个，暂时做了兼容处理

---
<p align="center">
  <img src="https://p0.meituan.net/travelcube/d4f2c3a22d50957b2d4a6c20fa728d0663733.gif">
</p>
