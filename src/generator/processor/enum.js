const Icon = require('../../constants/icon');
module.exports = function({syntax}) {
  return `${Icon['enum']}_${Object.keys(syntax).map(key => {
    return syntax[key];
  }).join(Icon['enum_or'])}`;
};
