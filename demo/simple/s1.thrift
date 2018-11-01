const double PI = 3.14;
const map<string, list<i32>> FOOD_TYPE_MAP = {
	'1': [1, 2],
	'2': [2, 3]
}

typedef i32 MyInt
typedef string MyString
typedef list<User> UserList

enum SEX {
  FEMALE = 1,
  MALE,
}

union ARG1 {
  1: i32 a,
  2: string b,
}

struct User {
  1: required MyInt id,
  2: required MyString name,
  3: optional SEX s
}

exception InvalidOperation {
  1: i32 errno = 500,
  2: string errmsg = "Server Error..."
}

service Service1 {
  void ping1(1: ARG1 arg) throws (1:InvalidOperation e)
}

service Service2  extends Service1 {
  void ping2(1:i32 num1),
  i32 add(1:User u),
  UserList get(1:string name)
}