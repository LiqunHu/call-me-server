import * as z from 'zod'

export default {
  name: 'UserSetting Services',
  apiList: {
    init: {
      name: 'changePassword',
      summary: 'changePassword',
      description: 'changePassword',
      path: '/api/admin/user/UserSetting/changePassword',
      type: 'post',
      ZodSchema: {
        body: z.object({
          old_password: z.string(),
          password: z.string(),
        }),
      },
    }
  }
}
