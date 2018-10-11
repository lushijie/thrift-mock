const Utils = require('@lushijie/utils');
const ThriftTool = require('../../thrift-tool');

module.exports = function(ast) {
  const store = {};
  const identifier = ast.id.name;
  store[identifier] = {};

  ast.fields.forEach(ele => {
    const key = ele.name;
    let field = {
      valueType: null,
      defaultValue: null,
      optional: ele.optional,
      required: ele.required,
    }

    // 默认值，目前仅支持常量
    if (ele.defaultValue) {
      field.defaultValue = ThriftTool.resolveMixValue(ele.defaultValue);
    }

    field = Utils.extend(field, ThriftTool.resolveMixType(ele.valueType));
    store[identifier][key] = field;
  });

  return store;
}