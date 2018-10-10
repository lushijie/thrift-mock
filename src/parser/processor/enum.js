module.exports = function(ast, store = {}) {
  const identifier = ast.id.name;
  store[identifier] = {};
  ast.definitions.forEach(ele => {
    const key = ele.id.name;
    let value;
    if (ele.value === null) {
      value = key;
    } else {
      value = ele.value.value;
    }
    store[identifier][key] = value;
  });
  return store;
}