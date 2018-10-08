module.exports = function(def) {
  const res = {
    type: 'typedef',
    identifier: def.id.name,
  };

  // typedef i32 MyInteger
  // typedef Address myAddress
  res. def.valueType.type;
  res. def.valueType.baseType || def.valueType.name;



  if (def.valueType.type === 'BaseType') {
    // res.collectType = 'base';
    res.valueType = def.valueType.baseType || def.valueType.name
    res.valueType
  }


  if (def.valueType.type === 'Identifier') {
    // res.collectType = 'identifier';
    res.valueType = def.valueType.name
  }

  // typedef list<Address> myAddressList
  if (def.valueType.type === 'List') {
    res.collectType = 'list';
    res.child = {

    }
    res.valueType = def.valueType.valueType.name
  }

  return res;
}