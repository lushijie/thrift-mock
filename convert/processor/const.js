module.exports = function(ast, store) {
  const identifier = ast.id.name;

  switch(ast.fieldType.type) {
    case 'BaseType':
      store[identifier] = ast.value.value;
    break;

    case 'List':
      store[identifier] = ast.value.values.map(ele => ele.value);
    break;

    case 'Set':
      store[identifier] = ast.value.values.map(ele => ele.value);
    break;

    case 'Map':
      store[identifier] = {};
      ast.value.entries.forEach(ele => {
        const key = ele['key']['value'];
        const value = ele['value']['value'];
        store[identifier][key] = value;
      })
    break;
  }
}