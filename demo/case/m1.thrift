include "m11.thrift"
include "m12.thrift"

struct User {
  1: i32 id,
  2: m11.Address addr,
  3: m12.Honor h,
  4: Body b,
}

struct Body {
  1: i32 id,
}