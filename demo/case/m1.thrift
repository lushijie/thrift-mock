include AA "m11.thrift"
include "m12.thrift"

struct Body {
  1: i32 id,
}

struct User {
  1: i32 id,
  2: AA.Address addr,
  3: m12.Honor h,
  4: Body b,
}

