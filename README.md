# thrift-json

## 前言

我们当前开发模式：客户端请求 Node 层， Node 层通过 thrift 与后端 rpc 通信， Node 层在获取到返回的数据 JSON.parse 之后以 json 格式返回客户端，大家在定义好 .thrift 文件之后前后端就各自开始开发了...

对于前端来说现在没有可用的接口，拿不到接口返回的结果。但是 Node 层和客户端需要 mock 数据结构来写逻辑。这时候就需要翻译 .thrift 文件来获取接口将会返回的 json 结构。

我们可以看懂 idl 表达的数据结构！但是当数据结构超级复杂的时候，我们在脑海中其实已经启动了一个“线程”将其快速地转化为 json 结构。
当使用了 ”include“ 命令的时候就更麻烦了，要来回的切换文件，切着切着就忘记刚刚看过的结构了...

biu biu ... thrift-json 就诞生了！！！ thrift-json 是一个根据 .thrift 文件生成 json 数据结构的工具。

## 示例

`tjson -f a.thrift -c User`
<p>
  <img src="https://p0.meituan.net/travelcube/5612b6fc9ff31003fadddf47a161776f158521.png">
</p>

## 特性
  * 支持 const、enum、typedef、struct、exception、union、service 基本类型
  * 支持多层数据类型的嵌套
  * 支持多层数据结构的嵌套
  * 支持 include thrift文件
  * 支持 service extend

## 标识

```js
module.exports = {
  basic: '◎', // 基本类型
  required: '★', // required
  optional: '☆', // optional
  enum: '➤', // enum
  enum_or: '⍮' // enum 连接符
}
```

## 使用
####  方式1. 命令行
npm install lushijie@thrift-json -g

进入 .thrift 目录执行
`tjson -f xx.thrift`
或
`tjson -f a.thrift -c User -o abc.json`

tjson 参数：
* -f 要编译的thrift文件，包含后缀
* -c 要获取的结构名，默认全部结构
* -o 重定向文件输出，包含后缀

#### 方式2. node 调用
npm install lushijie@thrift-json --save

```js
const thriftTool = require('lushijie@thrift-json');
const res = thriftTool.parse('a.thrift', 'User');
console.log(res);
```

## mock 数据

获取到数据结构之后，最初打算一起生成 mock 数据。但是现实的情况是每个字段的语义都会很强，比如一个菜品 mock 出来一个城市名，这是不行的！
也不可能为每个字段指定 mock 规则，所以暂时放弃一并生成 mock 数据的想法。

## 相关问题
1. [https://github.com/thriftrw/thriftrw-node/issues/162](https://github.com/thriftrw/thriftrw-node/issues/162)
2. [https://github.com/thriftrw/thriftrw-node/issues/163](https://github.com/thriftrw/thriftrw-node/issues/163)

第三方库暂时还没有解决上述问题，所以 fork 了一个，暂时做了兼容处理