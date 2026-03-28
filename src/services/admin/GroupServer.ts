import { Request } from 'express'
import common from '@/utils/Common'
import GLBConfig from '@/utils/GLBConfig'
import { prisma } from '@/utils/DB'
import { createLogger } from '@logger'

const logger = createLogger(__filename)

interface menuItem {
  menu_id: number
  menu_name?: string
  node_type: string
  name: string
  parent_flag: boolean
  title: string
  expand?: boolean
  api_id?: number
  parent_id?: number
  children?: menuItem[]
}

async function initAct() {
  const returnData = Object.create(null)

  const rootMenu: menuItem = {
    menu_id: 0,
    name: 'Root',
    parent_flag: true,
    title: 'Root',
    expand: true,
    node_type: GLBConfig.NODE_TYPE.NODE_ROOT,
    children: [],
  }
  returnData.menuInfo = [rootMenu]

  rootMenu.children = await genMenu('0')
  return common.success(returnData)
}

async function genMenu(parentId: string | number): Promise<menuItem[]> {
  const return_list: menuItem[] = []
  const pid = String(parentId)
  const menus = await prisma.$queryRaw<
    {
      menu_id: number
      menu_name: string
      node_type: string
      parent_id: string
      api_type: string | null
      api_function: string | null
    }[]
  >`SELECT
      a.menu_id AS menu_id,
      a.menu_name AS menu_name,
      a.node_type,
      a.parent_id,
      b.api_type,
      b.api_function
    FROM tbl_common_system_menu a
    LEFT JOIN tbl_common_api b ON a.api_id = b.api_id
    WHERE a.parent_id = ${pid} AND a.state = '1'
    ORDER BY a.menu_index`

  for (const m of menus) {
    let sub_menus: menuItem[] = []
    if (m.node_type === GLBConfig.NODE_TYPE.NODE_ROOT) {
      sub_menus = await genMenu(m.menu_id)
      return_list.push({
        menu_id: m.menu_id,
        menu_name: m.menu_name,
        node_type: m.node_type,
        name: m.menu_name,
        parent_flag: true,
        title: m.menu_name,
        expand: true,
        parent_id: Number(m.parent_id) || 0,
        children: sub_menus,
      })
    } else {
      return_list.push({
        menu_id: m.menu_id,
        menu_name: m.menu_name,
        node_type: m.node_type,
        name: m.menu_name + '->' + (m.api_function ?? ''),
        title: m.menu_name + '->' + (m.api_function ?? ''),
        parent_flag: false,
        parent_id: Number(m.parent_id) || 0,
      })
    }
  }
  return return_list
}

async function searchAct() {
  const root = {
    group_id: 0,
    name: 'Root',
    parent_flag: true,
    title: 'Root',
    expand: true,
    node_type: GLBConfig.NODE_TYPE.NODE_ROOT,
    children: [] as any[],
  }
  root.children = JSON.parse(JSON.stringify(await genUserGroup('0')))
  return common.success([root])
}

async function genUserGroup(parentId: string): Promise<any[]> {
  const return_list: any[] = []
  const groups = await prisma.common_group.findMany({
    where: {
      parent_id: parentId,
      group_type: GLBConfig.USER_TYPE.TYPE_DEFAULT,
      state: GLBConfig.ENABLE,
    },
    orderBy: { group_id: 'asc' },
  })
  for (const g of groups) {
    let sub_group: any[] = []
    if (g.node_type === GLBConfig.NODE_TYPE.NODE_ROOT) {
      sub_group = await genUserGroup(String(g.group_id))
      return_list.push({
        group_id: g.group_id,
        node_type: g.node_type,
        group_type: g.group_type,
        name: g.group_name,
        parent_flag: true,
        title: g.group_name,
        expand: true,
        parent_id: g.parent_id,
        children: sub_group,
      })
    } else {
      return_list.push({
        group_id: g.group_id,
        node_type: g.node_type,
        group_type: g.group_type,
        group_code: g.group_code,
        name: g.group_name,
        title: g.group_name,
        parent_flag: false,
        parent_id: g.parent_id,
      })
    }
  }
  return return_list
}

async function getCheckAct(req: Request) {
  const doc = common.docValidate(req)
  const returnData = Object.create(null)
  returnData.groupMenu = []

  const menus = await prisma.common_group_menu.findMany({
    where: { group_id: doc.group_id, state: GLBConfig.ENABLE },
    select: { menu_id: true },
  })
  for (const item of menus) {
    returnData.groupMenu.push(item.menu_id)
  }
  return common.success(returnData)
}

async function addAct(req: Request) {
  const doc = common.docValidate(req)

  if (doc.node_type === '01') {
    const code = await prisma.common_group.findFirst({
      where: { group_code: doc.group_code, state: GLBConfig.ENABLE },
    })

    if (code) {
      return common.error('group_05')
    }
  }

  const group = await prisma.common_group.create({
    data: {
      group_code: doc.group_code ?? '',
      group_name: doc.group_name,
      group_type: GLBConfig.USER_TYPE.TYPE_DEFAULT,
      node_type: doc.node_type,
      parent_id: String(doc.parent_id ?? '0'),
    },
  })

  if (doc.node_type === '01' && Array.isArray(doc.menus)) {
    for (const m of doc.menus) {
      await prisma.common_group_menu.create({
        data: {
          group_id: group.group_id,
          menu_id: m.menu_id,
        },
      })
    }
  }

  return common.success({
    ...group,
    group_id: group.group_id,
    group_code: group.group_code,
    group_name: group.group_name,
    group_type: group.group_type,
  })
}

async function modifyAct(req: Request) {
  const doc = common.docValidate(req)
  const group = await prisma.common_group.findFirst({
    where: { group_id: doc.group_id, state: GLBConfig.ENABLE },
  })
  if (group) {
    await prisma.common_group.update({
      where: { group_id: group.group_id },
      data: { group_name: doc.group_name },
    })

    if (group.node_type === '01') {
      await prisma.common_group_menu.deleteMany({
        where: { group_id: doc.group_id },
      })

      if (Array.isArray(doc.menus)) {
        for (const m of doc.menus) {
          await prisma.common_group_menu.create({
            data: {
              group_id: group.group_id,
              menu_id: m.menu_id,
            },
          })
        }
      }
    }
    logger.debug('modify success')
    const updated = await prisma.common_group.findFirst({
      where: { group_id: group.group_id },
    })
    return common.success({
      ...updated,
      group_id: updated?.group_id,
      group_code: updated?.group_code,
      group_name: updated?.group_name,
      group_type: updated?.group_type,
    })
  } else {
    return common.error('group_02')
  }
}

async function removeAct(req: Request) {
  const doc = common.docValidate(req)
  const group = await prisma.common_group.findFirst({
    where: { group_id: doc.group_id, state: GLBConfig.ENABLE },
  })

  if (!group) {
    return common.error('group_02')
  }

  if (group.node_type === '01') {
    await prisma.common_user_group.deleteMany({
      where: { group_id: group.group_id },
    })

    await prisma.common_group_menu.deleteMany({
      where: { group_id: group.group_id },
    })

    await prisma.common_group.delete({
      where: { group_id: group.group_id },
    })
    return common.success()
  } else {
    const check_count = await prisma.common_group.count({
      where: { parent_id: String(group.group_id), state: GLBConfig.ENABLE },
    })

    if (check_count > 0) {
      return common.error('group_06')
    }
    await prisma.common_group.delete({
      where: { group_id: group.group_id },
    })
    return common.success()
  }
}

export default {
  initAct,
  searchAct,
  getCheckAct,
  addAct,
  modifyAct,
  removeAct,
}
