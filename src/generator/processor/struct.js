const ThriftTool = require('../../thrift-tool');

module.exports = function structGen({syntax, gen, mapKey}) {
  const res = {};

  Object.keys(syntax).forEach(key => {
    const valueStyle = syntax[key].valueStyle;
    const valueType = syntax[key].valueType;
    const keyType = syntax[key].keyType || null; // for map

    function fn({valueStyle, valueType, keyType}) {
      if (valueStyle === 'basetype') {
        return valueType; // random position
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