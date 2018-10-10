const ALL_TYPE = require('../constants/type');

module.exports = {
  findThriftType(store = {}, name) {
    let matchedType = null;
    ALL_TYPE.forEach(type => {
      if (store[type][name] && !matchedType) {
        matchedType = type;
      }
    });
    return matchedType;
  },
  resolveMixType(eleValueType) {
    let res = {};
    switch(eleValueType.type) {
      case 'BaseType':
        res = {
          type: eleValueType.baseType
        }
      break;

      case 'Identifier':
        res = {
          refer: eleValueType.name
        }
      break;

      case 'List':
        let listChildValueType = eleValueType.valueType;
        res.list = {};
        if (listChildValueType.type === 'BaseType') {
          res.list = {
            type: listChildValueType.baseType
          }
        } else if (listChildValueType.type === 'Identifier') {
          res.list = {
            refer: listChildValueType.name
          }
        }
      break;

      case 'Set':
        let setChildValueType = eleValueType.valueType;
        res.set = {};
        if (setChildValueType.type === 'BaseType') {
          res.set = {
            type:  setChildValueType.baseType
          }
        } else if (setChildValueType.type === 'Identifier') {
          res.set = {
            refer: setChildValueType.name
          }
        }
      break;

      case 'Map':
        let mapKey = eleValueType.keyType;
        let mapValue = eleValueType.valueType;
        res.map = {};

        if (mapKey.type === 'BaseType') {
          res.map.key = {
            type: mapKey.baseType
          }
        } else if (mapKey.type === 'Identifier') {
          res.map.key = {
            refer: mapKey.name
          }
        }

        if (mapValue.type === 'BaseType') {
          res.map.value = {
            type: mapValue.baseType
          }
        } else if (mapValue.type === 'Identifier') {
          res.map.value = {
            refer: mapValue.name
          }
        }
      break;
    }
    return res;
  }
}