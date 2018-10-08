// { type: 'const',
//   identifier: 'PI',
//   fields:
//     [
//       { identifier: 'FEMALE', value: 1, type: 'i32' },
//       { identifier: 'MALE', value: 'MALE', type: 'i32' }
//     ]
// }
module.exports = function(def) {
  const res = {
    type: 'const',
    identifier: def.id.name
  };

  // const i32 CUT_TIME = 10;
  if (def.fieldType.type === 'BaseType') {
    res.value = def.value.value;
  }

  // const map<string, string> FOOD_TYPE_MAP = {
  //   '1': 'chuangcai',
  //   '2': 'lucai'
  // }
  if (def.fieldType.type === 'Map') {
    res.value = {};
    def.value.entries.forEach(ele => {
      res.value[ele['key']['value']] = ele['value']['value'];
    });
  }

  // const list<string> Year = ['2012', '2013', '2014']
  // const set<string> Year = ['2012', '2013', '2014']
  if (def.fieldType.type === 'List' || def.fieldType.type === 'Set') {
    res.value = [];
    def.value.values.forEach(ele => {
      res.value.push(ele.value);
    });
  }

  return res;
}
