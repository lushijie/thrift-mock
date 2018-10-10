命名空间(namespace)

基本类型（Base Types）
bool: 布尔变量（A boolean value, one byte）；
byte: 8位有符号整数（A signed byte）；
i16: 16位有符号整数（A 16-bit signed integer）；
i32: 32位有符号整数（A 32-bit signed integer）；
i64: 64位有符号整数（A 64-bit signed integer）；
double: 64位浮点数（A 64-bit floating point number）；
binary: byte数组（A byte array）；
string: 字符串（Encoding agnostic text or binary string）；

容器类型（Containers）
list: 一系列由T类型的数据组成的有序列表，元素可以重复；
set: 一系列由T类型的数据组成的无序集合，元素不可重复
map: 一个字典结构，key为T1类型，value为T2类型；

结构体（Struct）

联合(Union)
在一个结构体中，如果field之间的关系是互斥的，即只能有一个field被使用被赋值。在这种情况下，我们可以使用union来声明这个结构体，而不是一堆堆optional的field，语意上也更明确了。例如：

union JavaObjectArg {
  1: i32 int_arg;
  2: i64 long_arg;
  3: string string_arg;
  4: bool bool_arg;
  5: binary binary_arg;
  6: double double_arg;
}

异常(Exceptions)

服务(service)