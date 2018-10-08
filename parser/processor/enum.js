// { type: 'enum',
//   identifier: 'Sex',
//   fields:
//     [
//       { identifier: 'FEMALE', value: 1, type: 'i32' },
//       { identifier: 'MALE', value: 'MALE', type: 'i32' }
//     ]
// }

module.exports = function (def) {
  const res = {};
  res.type = def.type.toLowerCase();
  res.identifier = def.id.name;
  res.fields = [];

  def.definitions.forEach(ele => {
    const item = {};
    item.identifier = ele.id.name;
    if (ele.value !== null) {
      item.value = ele.value.value;
    } else {
      item.value = item.identifier;
    }
    item.type = ele.fieldType.baseType;
    res.fields.push(item);
  });
  return res;
}
