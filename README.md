# thrift-json

[![npm](https://img.shields.io/npm/v/@lushijie/thrift-json.svg?colorB=brightgreen&style=flat-square)](https://www.npmjs.com/package/@lushijie/thrift-json)

### 1. 前言

我们当前开发模式：客户端请求 Node 层， Node 层通过 thrift 与后端 rpc 通信， Node 层以 json 格式将获取到的数据返回客户端，大家在定义好 .thrift 文件之后前后端就各自开始开发了...

对于前端来说，现在没有可用的接口拿不到返回结果。但是 Node 层和客户端需要 mock 数据来写逻辑。这时候就需要翻译 .thrift 文件，来获取接口将会返回的数据结构，然后再为每个字段 mock 特定数据。

我们可以看懂 idl 表达的数据结构，但是当数据结构超级复杂的时候，我们在脑海中其实已经启动了一个“线程”将其快速地转化为 json 结构，每次写逻辑都会走一遍这个”翻译“流程。当使用了 ”include“ 命令的时候就更麻烦了，要来回的切换文件，切着切着就忘记刚刚看过的结构了...

biu biu ... thrift-json 就诞生了！ thrift-json 是一个根据 .thrift 文件生成 json 数据结构的工具。

### 2. 输出示例

`tjson -f a.thrift -c User`
<p>
  <img src="https://p0.meituan.net/travelcube/5612b6fc9ff31003fadddf47a161776f158521.png">
</p>

## 3. 基本特性
  * 支持 const、enum、typedef、struct、exception、union、service 基本数据结构
  * 支持多层数据类型的嵌套
  * 支持多层数据结构的嵌套
  * 支持 include thrift文件
  * 支持 service 的 extend 语法

### 4. 如何使用
#####  4.1. 命令行
npm install @lushijie/thrift-json -g

```
使用示例，存在如下目录：
* demo
  * case
    * a.thrift 
    * b.thrift
进入 cd /demo，此时目录存在 case 目录，目录中包含 a.thrift 与 b.thrift

1. 编译 case 下所有的 .thrift 文件 （在 case 目录下生成 a.json、b.json）
  tjson -d ./case

2. 编译 case 下的所有 .thrift 文件，并改变输出目录（在当前目录下生成 a.json、b.json）
  tjson -d ./case -o .

3. 编译 case 下的 a.thrift 文件（在 case 目录下生成 a.json）
  tjson -f ./case/a.thrift

4. 编译 case 下的 a.thrift 文件，并重命名 （在 case 目录下生成 a1.json）
  tjson -f ./case/a.thrift -o ./case/a1.json
  或者进入 case 目录执行
  tjson -f a.thrift a1.json

5. 编译 case 下的 a.thrift 中 User 结构体（在 case 目录下生成 a.json，仅包含 User 结构体）
  tjson -f ./case/a.thrift -c User
```

tjson 参数：
* -d 要编译的目录
* -f 要编译的thrift文件
* [-e] 指定thrift文件的后缀，默认.thrift
* [-c] 要获取的结构名，不传时获取全部结构
* [-o] 重定向文件输出目录

##### 4.2. node 调用
npm install @lushijie/thrift-json --save

```js
const thriftTool = require('@lushijie/thrift-json');
const res = thriftTool.parse('a.thrift', 'User'); // 获取 User 结构体的 json 结构， 如果不传值返回整个文件的 json 结构
console.log(res);
```

### 5. 输出标识

```js
module.exports = {
  basic: '◎', // 基本类型
  required: '★', // required
  optional: '☆', // optional
  enum: '➤', // enum
  enum_or: '⍮' // enum 连接符
}
```

### 6. 生成 mock 数据

获取到数据结构之后，最初打算一起生成 mock 数据。但是现实的情况是每个字段都有很强的语义，比如一个菜品 mock 出来一个城市名，这是不行的！
也不可能为每个字段指定 mock 规则，所以暂时放弃一并生成 mock 数据的想法。

### 相关问题
1. [https://github.com/thriftrw/thriftrw-node/issues/162](https://github.com/thriftrw/thriftrw-node/issues/162)
2. [https://github.com/thriftrw/thriftrw-node/issues/163](https://github.com/thriftrw/thriftrw-node/issues/163)

第三方库暂时还没有解决上述问题，所以 fork 了一个，暂时做了兼容处理

---
<p align="center">
  <img src="https://p0.meituan.net/travelcube/d4f2c3a22d50957b2d4a6c20fa728d0663733.gif">
</p>
