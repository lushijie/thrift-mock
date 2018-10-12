const Utils = require('@lushijie/utils');

module.exports = function(ast, thriftTool) {
  const res = {};
  const identifier = ast.id.name;
  res[identifier] = {};

  ast.fields.forEach(ele => {
    const key = ele.name;
    let field = {
      valueType: null,
      defaultValue: null,
      optional: ele.optional,
      required: ele.required,
    }

    // 默认值，目前仅支持常量，有待加强
    if (ele.defaultValue) {
      field.defaultValue = thriftTool.resolveMixValue(ele.defaultValue);
    }

    field = Utils.extend(field, thriftTool.resolveMixType(ele.valueType));
    res[identifier][key] = field;
  });

  return res;
}