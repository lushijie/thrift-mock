module.exports = function(ast, store) {
  const identifier = ast.id.name;
  store[identifier] = {};

  const field = {
    type: null,
    refer: null,
    list: null,
    map: null,
    set: null
  }

  switch(ast.valueType.type) {
    case 'BaseType':
      field.type = ast.valueType.baseType;
    break;

    case 'Identifier':
      field.refer = ast.valueType.name;
    break;

    case 'List':
      let listChildValueType = ast.valueType.valueType;
      if (listChildValueType.type === 'BaseType') {
        field.list = {
          refer: null,
          type: listChildValueType.baseType
        }
      } else if (listChildValueType.type === 'Identifier') {
        field.list = {
          refer: listChildValueType.name
        }
      }
    break;

    case 'Set':
      let setChildValueType = ast.valueType.valueType;
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
      let mapKey = ast.valueType.keyType;
      let mapValue = ast.valueType.valueType;
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

  store[identifier] = field;
}