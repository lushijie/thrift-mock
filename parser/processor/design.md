```js
const STORE = {
  const: {
    constName1: basic|collect
  },
  enum: {
    enumName1: {

    }
  },
  struct: {
    struct1: {

    },

    struct2: {

      {
        ref: 'enum|struct',
        name: ''
      }
    }
  },
  exception: {},
  service: {},
  typedef: {
    orginName1: aliasName1
  },
}
```

```js
{
  type: 'enum',
  identifier: 'Sex',
  type: 'i32',
  fields:[
    { identifier: 'FEMALE', value: 1},
    { identifier: 'MALE', value: 'MALE'}
  ]
}

{
  type: 'const',
  identifier: 'name',
  list: {
    value: {
      collectType: 'refName' || null,
      value: []
    }
  },
  map: {
    key: {

    },
    value: {

    }
  }
}
```