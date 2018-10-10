const ALL_TYPE = require('../constants/type');

module.exports = {
  is: require('core-util-is'),
  findThriftType(store = {}, name) {
    let matchedType = null;
    // if (name.indexOf('.') > -1) {
    //   name = name.split('.')[0];
    // }
    ALL_TYPE.forEach(type => {
      if (store[type][name] && !matchedType) {
        matchedType = type;
      }
    });
    return matchedType;
  }
}