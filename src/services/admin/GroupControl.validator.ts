import * as z from 'zod'

export default {
  name: 'GroupControl Services',
  apiList: {
    init: {
      name: '获取组数据字典',
      summary: '获取组数据字典',
      description: '获取组数据字典',
      path: '/api/admin/GroupControl/init',
      type: 'post',
      ZodSchema: {},
    },
    search: {
      name: '组查询',
      summary: '组查询',
      description: '组查询',
      path: '/api/admin/GroupControl/search',
      type: 'post',
      ZodSchema: {},
    },
    getcheck: {
      name: '获取组下拥有的菜单',
      summary: '获取组下拥有的菜单',
      description: '获取组下拥有的菜单',
      path: '/api/admin/GroupControl/getcheck',
      type: 'post',
      ZodSchema: {
        body: z.object({
          group_id: z.number().int(),
        }),
      },
    },
    add: {
      name: '增加目录或者节点',
      summary: '增加目录或者节点',
      description: '增加目录或者节点',
      path: '/api/admin/GroupControl/add',
      type: 'post',
      ZodSchema: {
        body: z.object({
          group_name: z.string().max(50),
          node_type: z.string().max(2),
          parent_id: z.number().int(),
          group_code: z.string().max(20),
          menus: z.array(
            z.object({
              menu_id: z.number().int(),
            }),
          ),
        }),
      },
    },
    modify: {
      name: '修改节点',
      summary: '修改节点',
      description: '修改节点',
      path: '/api/admin/GroupControl/modify',
      type: 'post',
      ZodSchema: {
        body: z.object({
          group_id: z.number().int(),
          group_code: z.string().max(20),
          group_name: z.string().max(50),
          menus: z.array(
            z.object({
              menu_id: z.number().int(),
            }),
          ),
        }),
      },
    },
    remove: {
      name: '删除组',
      summary: '删除组',
      description: '删除组',
      path: '/api/admin/GroupControl/remove',
      type: 'post',
      ZodSchema: {
        body: z.object({
          group_id: z.number().int(),
        }),
      },
    },
  },
}
