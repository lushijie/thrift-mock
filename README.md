# thrift-json

##  为什么写这样一个东西？

  起初是想根据 .thrift 数据生成 mock 数据，但是后来发现 mock 数据对语义化要求很高，例如一个菜品的分类，如果简单的返回随机的几个中文汉字就完全失去了可读性，其实可以为字段指定语义，但是当面对几十个字段时，指定语义貌似又成了一个繁琐的工作。
  最终放弃 mock 语义化的数据的想法......

  但是在 mock 的过程中其实还有一个工作，就是根据 .thrift 先获取到数据结构，这是制造 mock 数据的前提， 所以就有了 thrift-json。

  thrift-json 就是一个根据 .thrift 文件生成数据结构的工具：

`tjson -f xx.thrift`

<div>
  <img src="https://p1.meituan.net/travelcube/8b51c3be2a96410715ebd7cb0ae2a3e7333868.png" width="400">
</div>


`tjson -f a.thrift -c User`
<div>
  <img src="https://p0.meituan.net/travelcube/5612b6fc9ff31003fadddf47a161776f158521.png" width="400">
</div>



## 特性
  * 支持 const、enum、typedef、struct、exception、union、service 基本类型
  * 支持多层数据类型的嵌套，
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
####  1. 命令行
npm install lushijie@thrift-json -g

进入 .thrift 目录执行
`tjson -f xx.thrift`
或
`tjson -f a.thrift -c User -o b.json`

tjson 参数：
* -f 要编译的thrift文件，包含后缀
* -c 要获取的结构名，默认全部结构
* -o 重定向文件输出，包含后缀，默认当前目录，thrift的文件名

#### 2. node 调用
npm install lushijie@thrift-json --save

```js
const thriftTool = require('lushijie@thrift-json');
const res = thriftTool.parse('a.thrift', 'User');
console.log(res);
```
