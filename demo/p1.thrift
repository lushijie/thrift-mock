typedef i32 MyInt
typedef string MyString

union UN {
  1: i32 a,
  2: string b,
}

struct User {
  1: MyInt id,
  2: UN un,
  3: MyString s,
}


exception InvalidOperation {
  1: i32 errno = 500,
  2: string errmsg = "Server Error..."
}

service Service1 {
  void ping123(1:i32 num1, 2:string num2) throws (1:InvalidOperation myerr)
}


service MyService  extends Service1 {
  void ping(),
  list<i32> ping2(),
  User add(1:i32 num1, 2:string num2) throws (1:InvalidOperation myerr),
}