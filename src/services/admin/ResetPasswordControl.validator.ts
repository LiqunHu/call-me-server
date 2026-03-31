import * as z from 'zod'

export default {
  name: 'ResetPassword Services',
  apiList: {
    search: {
      name: '查询客户信息',
      summary: '查询客户信息',
      description: '查询客户信息',
      path: '/api/admin/ResetPassword/search',
      type: 'post',
      ZodSchema: {
        body: z.object({
          search_text: z.string().max(50),
        }),
      },
    },
    reset: {
      name: '重置密码',
      summary: '重置密码',
      description: '重置密码',
      path: '/api/admin/ResetPassword/reset',
      type: 'post',
      ZodSchema: {
        body: z.object({
          user_id: z.string().max(50),
          version: z.number().int(),
          updated_at: z.string().max(50),
        }),
      },
    },
  },
}
