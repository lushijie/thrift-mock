module.exports = function(def) {
  const res = {};
  res.type = def.type;
  res.identifier = def.id.name;
  res.fields = [];

  def.fields.forEach(ele => {
    const { name, optional, required } = ele;
    const item = {
      identifier: name,
      optional,
      required,
    };

    const valueTypeType = ele.valueType.type;
    item.collectionType = valueTypeType;

    if (valueTypeType === 'BaseType') {
      // 基础类型
      item.valueType = ele.valueType.baseType;
    } else if (valueTypeType === 'Identifier') {
      // 引用自定义的类型，从解析无法区分 enum struct 等具体引用类型
      item.valueType = ele.valueType.name;
    } else if (valueTypeType === 'List' || valueTypeType === 'Set') {
      item.valueType = ele.valueType.valueType.name;
    } else if (valueTypeType === 'Map') {
      item.valueType = ele.valueType.valueType.name;
      // item.keyType = {
      //   type: ele.valueType.keyType.type,
      // };
    }

    item.defaultValue = (ele.defaultValue && ele.defaultValue.value) || null;
    res.fields.push(item);
  });

  return res;
}


// valueType.type === 'BaseType'
// valueType.type === 'Identifier'
// valueType.type === 'List'

// const Struct = {
//   type: 'Struct',
//   identifier: 'TestStruct',
//   fields: [
//     {
//       identifier: 't1',
//       isBaseType: true,
//       fieldType: 'int32',
//       defaultValue: 0,
//       optional: false,
//       required: false,
//    },
//   ]
// }

// "valueType": {
//   "type": "Identifier",
//   "name": "DishesTypeCO",
//   "line": 27,
//   "column": 8,
//   "as": null
// },