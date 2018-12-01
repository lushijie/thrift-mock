const random = require('random');
const randomstring = require('randomstring');
const Utils = require('@lushijie/utils');

module.exports = {
  bool() {
    return random.boolean();
  },
  byte() {
    return random.int(0, 255);
  },
  i16() {
    return random.int(0, 32767);
  },
  i32() {
    return random.int(0, 2147483647);
  },
  i64() {
    return Utils.randomNumber(0, Math.pow(2, 53) - 1, true);
  },
  double() {
    return Utils.truncateNum(random.float(10, 100), 2, 2);
  },
  string() {
    return randomstring.generate(12);
  },
  void() {
    return undefined;
  }
};
