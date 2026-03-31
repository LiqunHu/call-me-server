import * as z from 'zod'

export default {
  name: 'OperatorControl Services',
  apiList: {
    init: {
      name: '获取组相关信息',
      summary: '获取组相关信息',
      description: '获取组相关信息',
      path: '/api/system/auth/OperatorControl/init',
      type: 'post',
      ZodSchema: {},
    },
    search: {
      name: '用户查询',
      summary: '用户查询',
      description: '用户查询',
      path: '/api/system/auth/OperatorControl/search',
      type: 'post',
      ZodSchema: {
        body: z.object({
          search_text: z.string().max(50),
          limit: z.number().int(),
          offset: z.number().int(),
        }),
      },
    },
    add: {
      name: '增加操作员',
      summary: '增加操作员',
      description: '增加操作员',
      path: '/api/system/auth/OperatorControl/add',
      type: 'post',
      ZodSchema: {
        body: z.object({
          user_username: z.string().max(50),
          user_email: z.string().max(50),
          user_phone: z.string().max(50),
          user_name: z.string().max(50),
          user_gender: z.string().max(2),
          user_address: z.string().max(100),
          user_zipcode: z.string().max(10),
          user_groups: z.array(z.number().int()),
        }),
      },
    },
    modify: {
      name: '修改用户',
      summary: '修改用户',
      description: '修改用户',
      path: '/api/system/auth/OperatorControl/modify',
      type: 'post',
      ZodSchema: {
        body: z.object({
          user_id: z.string().max(36),
          user_username: z.string().max(100),
          user_email: z.string().max(100),
          user_country_code: z.string().max(5),
          user_phone: z.string().max(20),
          user_name: z.string().max(100),
          user_gender: z.string().max(1),
          user_avatar: z.string().max(200),
          user_province: z.string().max(20),
          user_city: z.string().max(20),
          user_district: z.string().max(20),
          user_address: z.string().max(100),
          user_zipcode: z.string().max(20),
          user_company: z.string().max(200),
          user_remark: z.string().max(200),
          user_groups: z.array(z.number().int()),
        }),
      },
    },
    delete: {
      name: '删除用户',
      summary: '删除用户',
      description: '删除用户',
      path: '/api/system/auth/OperatorControl/delete',
      type: 'post',
      ZodSchema: {
        body: z.object({
          user_id: z.string().max(50),
        }),
      },
    }
  }
}
