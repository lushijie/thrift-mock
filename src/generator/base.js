const Icon = require('../constants/icon');
module.exports = function({syntax, gen}) {
  const {
    valueStyle,
    valueType,
    keyType,
    required,
    optional
  } = syntax;

  function fn({valueStyle, valueType, keyType = null}) {
    if (valueStyle === 'basetype') {
      let prefix = `${Icon['basic']} `;
      if (required) {
        prefix = `${Icon['required']} `;
      }
      if (optional) {
        prefix = `${Icon['optional']} `;
      }
      return `${prefix}${valueType}`;
    } else if (valueStyle === 'identifier') {
      return gen(valueType);
    } else if (valueStyle === 'list' || valueStyle === 'set') {
      return [fn(valueType)]
    } else if (valueStyle === 'map') {
      return {
        [fn(keyType)]: fn(valueType)
      }
    }
  }

  return fn({valueStyle, valueType, keyType});
}