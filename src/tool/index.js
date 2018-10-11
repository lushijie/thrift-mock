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

  // 嵌套 type 的解析
  resolveMixType(valueType) {
    const valueStyle = valueType.type.toLowerCase();
    if (valueStyle === 'basetype') {
      return {
        valueStyle,
        valueType: valueType.baseType
      };
    }

    if (valueStyle === 'identifier') {
      return {
        valueStyle,
        valueType: valueType.name
      }
    }

    if (valueStyle === 'set' || valueStyle === 'list') {
      return {
        valueStyle,
        valueType: module.exports.resolveMixType(valueType.valueType)
      }
    }

    if (valueStyle === 'map') {
      return {
        valueStyle,
        keyType: module.exports.resolveMixType(valueType.keyType),
        valueType: module.exports.resolveMixType(valueType.valueType)
      }
    }
  },

  // 嵌套 value 的解析
  resolveMixValue(value, prefix = 'const') {
    const valueType = value.type.toLowerCase();
    if (valueType === 'literal') {
      return value.value;
    }

    if (valueType === `${prefix}list` || valueType === `${prefix}set`) {
      return value.values.map(ele => {
        return module.exports.resolveMixValue(ele);
      });
    }

    if (valueType === `${prefix}map`) {
      return value.entries.map(ele => {
        return {
          [ele.key.value]: module.exports.resolveMixValue(ele.value)
        }
      });
    }
  },
}