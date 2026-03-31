import * as z from 'zod'

export default {
  name: 'Auth Services',
  apiList: {
    signin: {
      name: 'Login authorization',
      summary: 'Login authorization',
      description: 'Login authorization',
      path: '/api/auth/signin',
      type: 'post',
      ZodSchema: {
        body: z.object({
          login_type: z.enum(['WEB', 'MOBILE', 'ADMIN']),
          username: z.string().max(100),
          identify_code: z.string().max(100),
        }),
      },
    },
    captcha: {
      name: 'Get captcha',
      summary: 'Get captcha',
      description: 'Get captcha',
      path: '/api/auth/captcha',
      type: 'post',
      ZodSchema: {},
    },
    now: {
      name: 'Get now',
      summary: 'Get now',
      description: 'Get now',
      path: '/api/auth/now',
      type: 'post',
      ZodSchema: {},
    },
    loginSms: {
      name: 'Get login SMS',
      summary: 'Get login SMS',
      description: 'Get login SMS',
      path: '/api/auth/loginSms',
      type: 'post',
      ZodSchema: {
        body: z.object({
          user_phone: z.string().regex(/^1[3|4|5|6|7|8|9]\d{9}$/),
          key: z.string(),
          code: z.string(),
        }),
      },
    },
    signinBySms: {
      name: 'Sign in by SMS',
      summary: 'Sign in by SMS',
      description: 'Sign in by SMS',
      path: '/api/auth/signinBySms',
      type: 'post',
      ZodSchema: {
        body: z.object({
          login_type: z.enum(['WEB', 'MOBILE']),
          user_phone: z.string().regex(/^1[3|4|5|6|7|8|9]\d{9}$/),
          code: z.string(),
        }),
      },
    },
    signinByAccount: {
      name: 'Sign in by web3 address',
      summary: 'Sign in by web3 address',
      description: 'Sign in by web3 address',
      path: '/api/auth/signinByAccount',
      type: 'post',
      ZodSchema: {
        body: z.object({
          login_type: z.enum(['WEB', 'MOBILE']),
          address: z.string(),
          timezone: z.string(),
          timestamp: z.number(),
          signature: z.string(),
        }),
      },
    },
    signout: {
      name: 'Logout',
      summary: 'Logout',
      description: 'Logout',
      path: '/api/auth/signout',
      type: 'post',
      ZodSchema: {},
    },
    userExist: {
      name: 'Check if user exists',
      summary: 'Check if user exists',
      description: 'Check if user exists',
      path: '/api/auth/userExist',
      type: 'post',
      ZodSchema: {
        body: z.object({
          user_username: z.string().max(100),
        }),
      },
    },
    registerSms: {
      name: 'Get registration SMS verification code',
      summary: 'Get registration SMS verification code',
      description: 'Get registration SMS verification code',
      path: '/api/auth/registerSms',
      type: 'post',
      ZodSchema: {
        body: z.object({
          country_code: z.enum(['86', '852', '81', '853', '63', '65', '82', '886', '66', '60', '44', '1']),
          user_phone: z.string().regex(/^1[3|4|5|6|7|8|9]\d{9}$/),
          key: z.string(),
          code: z.string(),
        }),
      },
    },
    register: {
      name: 'register',
      summary: 'register',
      description: 'register',
      path: '/api/auth/register',
      type: 'post',
      ZodSchema: {
        body: z.object({
          user_username: z.string().max(100),
          country_code: z.literal('86'),
          user_phone: z.string().regex(/^1[3|4|5|6|7|8|9]\d{9}$/),
          user_password: z.string().max(50),
          code: z.string(),
          user_name: z.string().max(100),
          company_name: z.string().max(100),
          user_position: z.string().max(50),
        }),
      },
    },
  },
}
