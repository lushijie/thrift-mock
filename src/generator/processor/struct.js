module.exports = function structGen({syntax, gen, mapKey}) {
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
      if (valueStyle === 'basetype') {
        return `${required ? '★ ' : ''}${optional ? '☆ ' : ''}${valueType}`; // random position
      }

      if (valueStyle === 'identifier') {
        return gen(valueType, gen);
      }

      if (valueStyle === 'list' || valueStyle === 'set') {
        return [fn(valueType)]
      }

      if (valueStyle === 'map') {
        return {
          [fn(keyType)]: fn(valueType)
        }
      }
    }

    res[key] = fn({valueStyle, valueType, keyType});
  });
  return res;
}