const Utils = require('../utils');
const Processor = {
  const: require('./processor/const'),
  enum: require('./processor/enum'),
};


module.exports = function(store, mapKey) {
  return function gen(name) {
    const type = Utils.findThriftType(store, name);
    console.log(type);
    return Processor[type](store, type, name);

    // if (type === 'struct') {
    //   const item = {};
    //   const syntax = store[type][name];

    //   Object.keys(syntax).forEach(key => {
    //     const value = syntax[key];

    //     // 存在默认值使用默认值
    //     const defauleValue = syntax[key]['defaultValue'];
    //     // 基本类型默认值
    //     if (defauleValue && defauleValue.value) {
    //       item[key] = defauleValue;
    //       return;
    //     }

    //     // refer 类型默认值
    //     if (defauleValue && defauleValue.refer) {
    //       // const
    //       if (store['const'][defauleValue.refer]) {
    //         item[key] = store['const'][defauleValue.refer];
    //         return;
    //       }

    //       // enum
    //       if (defauleValue.refer.indexOf('.') > -1) {
    //         const enumName = defauleValue.refer.split('.')[0];
    //         const enumKey = defauleValue.refer.split('.')[1];
    //         item[key] = store['enum'][enumName][enumKey];
    //         return;
    //       }
    //     }

    //     let valueType = value.type;
    //     // 自定义类型
    //     if (mapKey[name] && mapKey[name][key]) {
    //       valueType = mapKey[name][key];
    //     }

    //     // 数据类型为字符串
    //     if (Utils.isString(valueType)) {
    //       if (Utils.isFunction(RadomRule[valueType])) {
    //         item[key] = RadomRule[valueType]();
    //       } else {
    //         console.error(`${valueType} 类型的随机构造函数不存在`);
    //       }
    //       return;
    //     }

    //     // 数据类型为函数
    //     if (Utils.isFunction(valueType)) {
    //       item[key] = valueType();
    //       return;
    //     }

    //     // 数据类型为 refer 指向
    //     if (value.refer) {
    //       item[key] = gen('struct', value.refer);
    //       return;
    //     }
    //   });
    //   return item;
    // }
  }
}