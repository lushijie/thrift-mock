typedef i32 MyInt

union UN {
  1: i32 a,
  2: string b,
}

struct User {
  1: MyInt id,
  2: UN un,
}