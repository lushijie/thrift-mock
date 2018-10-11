const randomString = require("randomstring");
module.exports = {
  bool() {
    return Math.random() >= 0.5;
  },
  byte() {

  },
  i16(min = 1, max = 9007199254740992) {
    return 16;
  },
  i32(min, max) {
    return 32;
  },
  i64(min, max) {
    return 64;
  },
  double(min = 0, max = 9007199254740992) {
    return 8.88;
  },
  string(length = 7, charset) {
    return randomString.generate({
      length: length,
      charset: charset
    });
  },

  id() {
    return 'id123';
  },

  address() {
    return {
      a: 123,
    }
  },

  code() {
    return 'code123';
  }
}