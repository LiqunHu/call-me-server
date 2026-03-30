import * as z from 'zod'

export default {
  name: 'SystemApiControl Services',
  apiList: {
    init: {
      name: '获取数据字典',
      enname: 'SystemApiControlinit',
      tags: ['SystemApiControl'],
      path: '/api/system/auth/SystemApiControl/init',
      type: 'post',
      ZodSchema: {},
    },
    search: {
      name: 'API树查询',
      enname: 'SystemApiControlsearch',
      tags: ['SystemApiControl'],
      path: '/api/system/auth/SystemApiControl/search',
      type: 'post',
      ZodSchema: {},
    },
    addFolder: {
      name: '增加目录',
      enname: 'SystemApiControladdFolder',
      tags: ['SystemApiControl'],
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
      enname: 'SystemApiControlmodifyFolder',
      tags: ['SystemApiControl'],
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
      enname: 'SystemApiControladdMenu',
      tags: ['SystemApiControl'],
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
      enname: 'SystemApiControlmodifyMenu',
      tags: ['SystemApiControl'],
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
      enname: 'SystemApiControlremove',
      tags: ['SystemApiControl'],
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
