module.exports = function(ast) {
  const identifier = ast.id.name;
  const store = {
    [identifier]: {}
  };

  ast.definitions.forEach(ele => {
    const key = ele.id.name;
    store[identifier][key] = ele.value === null ? key : ele.value.value;
  });
  return store;
}