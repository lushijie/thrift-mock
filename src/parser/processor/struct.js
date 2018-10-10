const Utils = require('@lushijie/utils');
const Tool = require('../../tool');

module.exports = function(ast, store = {}) {
  const identifier = ast.id.name;

  store[identifier] = {};
  ast.fields.forEach(ele => {
    const key = ele.name;
    let field = {
      refer: null,
      type: null,
      defaultValue: null,
      optional: ele.optional,
      required: ele.required,
      list: null,
      map: null,
      set: null
    }

    // 默认值
    if (ele.defaultValue) {
      if (ele.defaultValue.value) {
        field.defaultValue = {
          value: ele.defaultValue.value
        }
      } else if (ele.defaultValue.type === 'Identifier') {
        field.defaultValue = {
          refer: ele.defaultValue.name
        }
      }
    }

    field = Utils.extend(field, Tool.resolveMixType(ele.valueType));
    store[identifier][key] = field;
  });

  return store;
}