const struct = require('./struct');

function mixTypeResolve() {

}

module.exports = function(ast, store = {}) {
  const identifier = ast.id.name;

  store[identifier] = {};
  ast.functions.forEach(ele => {
    const key = ele.id.name;
    const field = {
      oneway: false,
      returns: null,
      throws: null,
      arguments: null
    };

    if (ele.returns.type === 'BaseType') {
      if (ele.returns.baseType !== 'void') {
        field.returns = {
          type: ele.returns.baseType
        }
      }
    }

    store[identifier][key] = field;
    // ele.returns

    // ele.throws.forEach(t => {
    //   field.throws[t.name] = struct({
    //     id: {
    //       name: t.name,
    //     },
    //     fields: [t]
    //   })[t.name][t.name];
    // });
    // console.log(field.throws)
  });

  console.log(JSON.stringify(store, undefined, 2));

  return store;
}