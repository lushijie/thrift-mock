const Utils = require('@lushijie/utils');
const Icon = require('../constants/icon');
const Random = require('../random');

module.exports = function({syntax, thriftTool}) {
  const {
    valueStyle,
    valueType,
    keyType,
    required,
    optional
  } = syntax;

  function fn({valueStyle, valueType, keyType = null}) {
    if (valueStyle === 'basetype') {
      let prefix = `${Icon['basic']}_`;
      if (required) {
        prefix = `${Icon['required']}_`;
      }
      if (optional) {
        prefix = `${Icon['optional']}_`;
      }
      if (thriftTool.auto) {
        const fn = Random[valueType];
        if (Utils.isFunction(fn)) {
          return fn();
        }
      }
      return `${prefix}${valueType}`;
    } else if (valueStyle === 'identifier') {
      return thriftTool.gen(valueType);
    } else if (valueStyle === 'list' || valueStyle === 'set') {
      return [fn(valueType)];
    } else if (valueStyle === 'map') {
      return {
        [fn(keyType)]: fn(valueType)
      };
    }
  }

  return fn({valueStyle, valueType, keyType});
};
