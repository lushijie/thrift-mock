module.exports = function(ast) {
  const identifier = ast.id.name;
  const res = {
    [identifier]: {}
  };

  ast.definitions.forEach(ele => {
    const key = ele.id.name;
    res[identifier][key] = ele.value === null ? key : ele.value.value;
  });
  return res;
}