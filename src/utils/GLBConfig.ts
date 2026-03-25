export default {
  INITPASSWORD: '123456',
  REDIS_KEYS: {
    AUTH: 'AUTH',
    SMS: 'SMS',
    CAPTCHA: 'CAPTCHA',
    AUTHAPI: 'AUTHAPI',
  },
  NODE_TYPE: {
    NODE_ROOT: '00',
    NODE_LEAF: '01',
  },
  MTYPEINFO: [
    {
      id: '00',
      text: 'Folder',
    },
    {
      id: '01',
      text: 'Menu',
    },
  ],
  NODETYPEINFO: [
    {
      id: '00',
      text: 'Root',
    },
    {
      id: '01',
      text: 'Leaf',
    },
  ],
  ORG_TYPE: {
    TYPE_SYSTEM: '00',
    TYPE_DEFAULT: '01',
  },
  USER_TYPE: {
    TYPE_DEFAULT: '00',
    TYPE_ADMINISTRATOR: '01',
    TYPE_SYSTEM: '02',
  },
  AUTH: '1',
  NOAUTH: '0',
  AUTHINFO: [
    {
      id: '1',
      text: 'Yes',
    },
    {
      id: '0',
      text: 'No',
    },
  ],
  ENABLE: '1',
  DISABLE: '0',
  STATUSINFO: [
    {
      id: '1',
      text: 'valid',
    },
    {
      id: '0',
      text: 'invalid',
    },
  ],
  TRUE: '1',
  FALSE: '0',
  TFINFO: [
    {
      id: '1',
      text: 'Yes',
    },
    {
      id: '0',
      text: 'No',
    },
  ]
}
