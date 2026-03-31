import * as z from 'zod'

export default {
  name: 'SystemApiControl Services',
  apiList: {
    init: {
      name: '获取数据字典',
      summary: '获取数据字典',
      description: '获取数据字典',
      path: '/api/system/auth/SystemApiControl/init',
      type: 'post',
      ZodSchema: {},
    },
    search: {
      name: 'API树查询',
      summary: 'API树查询',
      description: 'API树查询',
      path: '/api/system/auth/SystemApiControl/search',
      type: 'post',
      ZodSchema: {},
    },
    addFolder: {
      name: '增加目录',
      summary: '增加目录',
      description: '增加目录',
      path: '/api/system/auth/SystemApiControl/addFolder',
      type: 'post',
      ZodSchema: {
        body: z.object({
          parent_id: z.number().int(),
          menu_icon: z.string().max(50),
          menu_name: z.string().max(50),
        }),
      },
    },
    modifyFolder: {
      name: '修改目录',
      summary: '修改目录',
      description: '修改目录',
      path: '/api/system/auth/SystemApiControl/modifyFolder',
      type: 'post',
      ZodSchema: {
        body: z.object({
          menu_id: z.number().int(),
          menu_icon: z.string().max(50),
          menu_name: z.string().max(50),
        }),
      },
    },
    addMenu: {
      name: '增加API',
      summary: '增加API',
      description: '增加API',
      path: '/api/system/auth/SystemApiControl/addMenu',
      type: 'post',
      ZodSchema: {
        body: z.object({
          parent_id: z.number().int(),
          api_type: z.string().max(10),
          api_path: z.string().max(300),
          api_function: z.string().max(100),
          auth_flag: z.string().max(10),
          api_remark: z.string().max(500),
          menu_name: z.string().max(300),
        }),
      },
    },
    modifyMenu: {
      name: '修改API',
      summary: '修改API',
      description: '修改API',
      path: '/api/system/auth/SystemApiControl/modifyMenu',
      type: 'post',
      ZodSchema: {
        body: z.object({
          menu_id: z.number().int(),
          api_type: z.string().max(10),
          api_path: z.string().max(300),
          api_function: z.string().max(100),
          auth_flag: z.string().max(10),
          api_remark: z.string().max(500),
          menu_name: z.string().max(300),
        }),
      },
    },
    remove: {
      name: '删除节点',
      summary: '删除节点',
      description: '删除节点',
      path: '/api/system/auth/SystemApiControl/remove',
      type: 'post',
      ZodSchema: {
        body: z.object({
          menu_id: z.number().int(),
        }),
      },
    },
  },
}
