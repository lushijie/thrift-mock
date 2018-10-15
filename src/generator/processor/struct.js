const Icon = require('../../constants/icon');
module.exports = function structGen({syntax, gen}) {
  const res = {};

  Object.keys(syntax).forEach(key => {
    const theSyntax = syntax[key];
    const {
      valueStyle,
      valueType,
      keyType,
      required,
      optional
    } = theSyntax;

    function fn({valueStyle, valueType, keyType = null}) {
      if(valueStyle === 'union') {
        return valueType;
      } else if (valueStyle === 'basetype') {
        let prefix = `${Icon['basic']} `;
        if (required) {
          prefix = `${Icon['required']} `;
        }
        if (optional) {
          prefix = `${Icon['optional']} `;
        }
        return `${prefix}${valueType}`; // random position
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

    res[key] = fn({valueStyle, valueType, keyType});
  });
  return res;
}