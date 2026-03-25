import Joi from 'joi'

export default {
  name: 'Auth Services',
  apiList: {
    signin: {
      name: 'Login authorization',
      enname: 'Authsignin',
      tags: ['Auth'],
      path: '/api/auth/signin',
      type: 'post',
      JoiSchema: {
        body: {
          login_type: Joi.string().allow('WEB', 'MOBILE'),
          username: Joi.string().max(100),
          identify_code: Joi.string().max(100),
        },
      },
    },
    captcha: {
      name: 'Get captcha',
      enname: 'Authcaptcha',
      tags: ['Auth'],
      path: '/api/auth/captcha',
      type: 'post',
      JoiSchema: {},
    },
    now: {
      name: 'Get now',
      enname: 'Authnow',
      tags: ['Auth'],
      path: '/api/auth/now',
      type: 'post',
      JoiSchema: {},
    },
    loginSms: {
      name: 'Get login SMS',
      enname: 'AuthLoginSms',
      tags: ['Auth'],
      path: '/api/auth/loginSms',
      type: 'post',
      JoiSchema: {
        body: {
          user_phone: Joi.string().regex(/^1[3|4|5|6|7|8|9]\d{9}$/),
          key: Joi.string(),
          code: Joi.string(),
        },
      },
    },
    signinBySms: {
      name: 'Sign in by SMS',
      enname: 'AuthsigninBySms',
      tags: ['Auth'],
      path: '/api/auth/signinBySms',
      type: 'post',
      JoiSchema: {
        body: {
          login_type: Joi.string().allow('WEB', 'MOBILE'),
          user_phone: Joi.string().regex(/^1[3|4|5|6|7|8|9]\d{9}$/),
          code: Joi.string(),
        },
      },
    },
    signinByAccount: {
      name: 'Sign in by web3 address',
      enname: 'AuthsigninByAccount',
      tags: ['Auth'],
      path: '/api/auth/signinByAccount',
      type: 'post',
      JoiSchema: {
        body: {
          login_type: Joi.string().allow('WEB', 'MOBILE'),
          address: Joi.string(),
          timezone: Joi.string(),
          timestamp: Joi.number(),
          signature: Joi.string(),
        },
      },
    },
    signout: {
      name: 'Logout',
      enname: 'Authsignout',
      tags: ['Auth'],
      path: '/api/auth/signout',
      type: 'post',
      JoiSchema: {},
    },
    userExist: {
      name: 'Check if user exists',
      enname: 'AuthuserExist',
      tags: ['Auth'],
      path: '/api/auth/userExist',
      type: 'post',
      JoiSchema: {
        body: {
          user_username: Joi.string().max(100),
        },
      },
    },
    registerSms: {
      name: 'Get registration SMS verification code',
      enname: 'AuthRegisterSms',
      tags: ['Auth'],
      path: '/api/auth/registerSms',
      type: 'post',
      JoiSchema: {
        body: {
          country_code: Joi.string().allow('86', '852', '81', '853', '63', '65', '82', '886', '66', '60', '44', '1'),
          user_phone: Joi.string().regex(/^1[3|4|5|6|7|8|9]\d{9}$/),
          key: Joi.string(),
          code: Joi.string(),
        },
      },
    },
    register: {
      name: 'register',
      enname: 'Authregister',
      tags: ['Auth'],
      path: '/api/auth/register',
      type: 'post',
      JoiSchema: {
        body: {
          user_username: Joi.string().max(100),
          country_code: Joi.string().allow('86'),
          user_phone: Joi.string().regex(/^1[3|4|5|6|7|8|9]\d{9}$/),
          user_password: Joi.string().max(50),
          code: Joi.string(),
          user_name: Joi.string().empty('').max(100),
          company_name: Joi.string().empty('').max(100),
          user_position: Joi.string().empty('').max(50),
        },
      },
    },
  },
}
