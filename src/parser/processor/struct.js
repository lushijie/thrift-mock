module.exports = function(ast, store) {
  const identifier = ast.id.name;

  store[identifier] = {};
  ast.fields.forEach(ele => {
    const key = ele.name;
    const field = {
      refer: null,
      type: null,
      defaultValue: null,
      optional: ele.optional,
      required: ele.required,
      list: null,
      map: null,
      set: null
    }

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

    switch(ele.valueType.type) {
      case 'BaseType':
        field.type = ele.valueType.baseType;
      break;

      case 'Identifier':
        field.refer = ele.valueType.name;
      break;

      case 'List':
        let listChildValueType = ele.valueType.valueType;
        if (listChildValueType.type === 'BaseType') {
          field.list = {
            type: listChildValueType.baseType
          }
        } else if (listChildValueType.type === 'Identifier') {
          field.list = {
            refer: listChildValueType.name
          }
        }
      break;

      case 'Set':
        let setChildValueType = ele.valueType.valueType;
        if (setChildValueType.type === 'BaseType') {
          field.set = {
            type: setChildValueType.baseType
          }
        } else if (setChildValueType.type === 'Identifier') {
          field.set = {
            refer: setChildValueType.name
          }
        }
      break;

      case 'Map':
        let mapKey = ele.valueType.keyType;
        let mapValue = ele.valueType.valueType;
        field.map = {};

        if (mapKey.type === 'BaseType') {
          field.map.key = {
            type: mapKey.baseType
          }
        } else if (mapKey.type === 'Identifier') {
          field.map.key = {
            refer: mapKey.name
          }
        }

        if (mapValue.type === 'BaseType') {
          field.map.value = {
            type: mapValue.baseType
          }
        } else if (mapValue.type === 'Identifier') {
          field.map.value = {
            refer: mapValue.name
          }
        }
      break;
    }

    store[identifier][key] = field;
  });
}