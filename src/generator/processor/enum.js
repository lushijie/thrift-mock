const Utils = require('@lushijie/utils');
const Icon = require('../../constants/icon');

module.exports = function({ syntax, thriftTool }) {
  if (thriftTool.auto) {
    const list = Object.keys(syntax).map(key => {
      return syntax[key];
    });
    return list[Utils.randomNumber(0, list.length - 1, true)];
  }

  return `${Icon['enum']}_(${Object.keys(syntax).map(key => {
    return syntax[key];
  }).join(Icon['enum_or'])})`;
};
