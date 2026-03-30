import { Request } from 'express'
import common from '@/utils/Common'
import GLBConfig from '@/utils/GLBConfig'
import refreshRedis from '@schedule/refreshRedis'
import { prisma } from '@/utils/DB'
import { createLogger } from '@logger'

const logger = createLogger(__filename)

async function initAct() {
  const returnData = {
    authInfo: GLBConfig.AUTHINFO,
    tfInfo: GLBConfig.TFINFO,
  }

  return common.success(returnData)
}

async function searchAct() {
  const root = {
    name: 'Root',
    menu_id: 0,
    node_type: GLBConfig.NODE_TYPE.NODE_ROOT,
    children: [] as any[],
  }
  root.children = JSON.parse(JSON.stringify(await genMenu('0')))
  return common.success([root])
}

async function genMenu(parentId: string | number): Promise<any[]> {
  const return_list: any[] = []
  const pid = String(parentId)
  const rows = await prisma.$queryRaw<
    {
      menu_id: number
      menu_name: string
      menu_icon: string
      node_type: string
      parent_id: string
      api_type: string | null
      api_function: string | null
      api_path: string | null
      auth_flag: string | null
      api_remark: string | null
    }[]
  >`SELECT
      a.menu_id,
      a.menu_name,
      a.menu_icon,
      a.node_type,
      a.parent_id,
      b.api_type,
      b.api_function,
      b.api_path,
      b.auth_flag,
      b.api_remark
    FROM tbl_common_system_menu a
    LEFT JOIN tbl_common_api b ON a.api_id = b.api_id
    WHERE a.parent_id = ${pid} AND a.state = '1'
    ORDER BY a.menu_index`

  for (const m of rows) {
    let sub_menus: any[] = []
    if (m.node_type === GLBConfig.NODE_TYPE.NODE_ROOT) {
      sub_menus = await genMenu(m.menu_id)
      return_list.push({
        name: m.menu_name,
        menu_id: m.menu_id,
        menu_name: m.menu_name,
        menu_icon: m.menu_icon,
        node_type: m.node_type,
        parent_id: m.parent_id,
        children: sub_menus,
      })
    } else {
      let name = ''
      if (m.api_function) {
        name = m.menu_name + '->' + m.api_function
      } else {
        name = m.menu_name
      }
      return_list.push({
        name,
        menu_id: m.menu_id,
        menu_name: m.menu_name,
        api_type: m.api_type,
        api_path: m.api_path,
        api_function: m.api_function,
        auth_flag: m.auth_flag,
        api_remark: m.api_remark,
        node_type: m.node_type,
        parent_id: m.parent_id,
      })
    }
  }
  return return_list
}

async function addFolderAct(req: Request) {
  const doc = common.docValidate(req)
  const folder = await prisma.common_system_menu.findFirst({
    where: { menu_name: doc.menu_name, state: GLBConfig.ENABLE },
  })

  if (folder) {
    return common.error('common_api_01')
  } else {
    await prisma.common_system_menu.create({
      data: {
        menu_name: doc.menu_name,
        menu_icon: doc.menu_icon ?? '',
        node_type: '00',
        parent_id: String(doc.parent_id ?? '0'),
        state: GLBConfig.ENABLE,
      },
    })

    return common.success()
  }
}

async function modifyFolderAct(req: Request) {
  const doc = common.docValidate(req)

  const folder = await prisma.common_system_menu.findFirst({
    where: { menu_id: doc.menu_id, state: GLBConfig.ENABLE },
  })

  if (folder) {
    await prisma.common_system_menu.update({
      where: { menu_id: folder.menu_id },
      data: {
        menu_name: doc.menu_name,
        menu_icon: doc.menu_icon ?? '',
      },
    })
  } else {
    return common.error('common_api_02')
  }
  logger.debug('modify success')
  return common.success()
}

async function addMenuAct(req: Request) {
  const doc = common.docValidate(req)

  const afolder = await prisma.common_system_menu.findFirst({
    where: { menu_name: doc.menu_name, state: GLBConfig.ENABLE },
  })

  const aapi = await prisma.common_api.findFirst({
    where: { api_name: doc.menu_name, state: GLBConfig.ENABLE },
  })

  let afunc = null
  if (doc.api_function) {
    afunc = await prisma.common_api.findFirst({
      where: { api_function: doc.api_function.toUpperCase(), state: GLBConfig.ENABLE },
    })
  }
  if (afolder || aapi || afunc) {
    return common.error('common_api_01')
  } else {
    let api_path = ''
    let api_function = ''
    let auth_flag = ''
    if (doc.api_type === '0') {
      api_path = doc.api_path
      api_function = doc.api_function.toUpperCase()
      auth_flag = doc.auth_flag
    } else if (doc.api_type === '1') {
      api_path = doc.api_path
    } else if (doc.api_type === '2') {
      api_function = doc.api_function.toUpperCase()
      auth_flag = doc.auth_flag
    }

    await prisma.$transaction(async (tx) => {
      const api = await tx.common_api.create({
        data: {
          api_name: doc.menu_name,
          api_type: doc.api_type,
          api_path,
          api_function,
          auth_flag,
          state: GLBConfig.ENABLE,
        },
      })

      await tx.common_system_menu.create({
        data: {
          menu_name: doc.menu_name,
          api_id: api.api_id,
          node_type: '01',
          parent_id: String(doc.parent_id ?? '0'),
          state: GLBConfig.ENABLE,
        },
      })
    })

    await refreshRedis.refreshRedis()
  }

  return common.success()
}

async function modifyMenuAct(req: Request) {
  const doc = common.docValidate(req)

  const menum = await prisma.common_system_menu.findFirst({
    where: { menu_id: doc.menu_id, state: GLBConfig.ENABLE },
  })

  if (menum) {
    const api = menum.api_id
      ? await prisma.common_api.findFirst({
          where: { api_id: menum.api_id, state: GLBConfig.ENABLE },
        })
      : null

    const conflictByName = await prisma.common_api.findFirst({
      where: {
        api_name: doc.menu_name,
        state: GLBConfig.ENABLE,
        ...(menum.api_id != null ? { NOT: { api_id: menum.api_id } } : {}),
      },
    })
    if (conflictByName) {
      return common.error('common_api_01')
    }
    if (doc.api_function) {
      const conflictByFunc = await prisma.common_api.findFirst({
        where: {
          api_function: doc.api_function.toUpperCase(),
          state: GLBConfig.ENABLE,
          ...(menum.api_id != null ? { NOT: { api_id: menum.api_id } } : {}),
        },
      })
      if (conflictByFunc) {
        return common.error('common_api_01')
      }
    }
    if (doc.api_path) {
      const conflictByPath = await prisma.common_api.findFirst({
        where: {
          api_path: doc.api_path,
          state: GLBConfig.ENABLE,
          ...(menum.api_id != null ? { NOT: { api_id: menum.api_id } } : {}),
        },
      })
      if (conflictByPath) {
        return common.error('common_api_01')
      }
    }

    if (api) {
      let api_path = ''
      let api_function = ''
      let auth_flag = ''
      if (doc.api_type === '0') {
        api_path = doc.api_path
        api_function = doc.api_function.toUpperCase()
        auth_flag = doc.auth_flag
      } else if (doc.api_type === '1') {
        api_path = doc.api_path
      } else if (doc.api_type === '2') {
        api_function = doc.api_function.toUpperCase()
        auth_flag = doc.auth_flag
      }

      await prisma.common_api.update({
        where: { api_id: api.api_id },
        data: {
          api_type: doc.api_type,
          api_name: doc.menu_name,
          api_path,
          api_function,
          auth_flag,
        },
      })
      await prisma.common_system_menu.update({
        where: { menu_id: menum.menu_id },
        data: { menu_name: doc.menu_name },
      })
      await refreshRedis.refreshRedis()
    } else {
      return common.error('common_api_02')
    }
  } else {
    return common.error('common_api_02')
  }

  return common.success()
}

async function removeAct(req: Request) {
  const doc = common.docValidate(req)
  const menum = await prisma.common_system_menu.findFirst({
    where: { menu_id: doc.menu_id, state: GLBConfig.ENABLE },
  })

  const groups = await prisma.common_group.findMany({
    where: { state: GLBConfig.ENABLE },
    select: { group_id: true },
  })

  const gids = groups.map((g) => g.group_id)

  if (menum) {
    if (menum.node_type === '01') {
      if (gids.length > 0) {
        await prisma.common_group_menu.deleteMany({
          where: {
            group_id: { in: gids },
            menu_id: menum.menu_id,
          },
        })
      }

      await prisma.common_system_menu.delete({
        where: { menu_id: menum.menu_id },
      })

      if (menum.api_id) {
        await prisma.common_api.delete({
          where: { api_id: menum.api_id },
        })
      }
      await refreshRedis.refreshRedis()
      return common.success()
    } else {
      const chcount = await prisma.common_system_menu.count({
        where: {
          parent_id: String(doc.menu_id),
          state: GLBConfig.ENABLE,
        },
      })
      if (chcount > 0) {
        return common.error('common_api_04')
      }

      if (gids.length > 0) {
        await prisma.common_group_menu.deleteMany({
          where: {
            group_id: { in: gids },
            menu_id: menum.menu_id,
          },
        })
      }

      await prisma.common_system_menu.delete({
        where: { menu_id: menum.menu_id },
      })

      await refreshRedis.refreshRedis()
      return common.success()
    }
  }
  return common.error('common_api_02')
}

export default {
  initAct,
  searchAct,
  addFolderAct,
  modifyFolderAct,
  addMenuAct,
  modifyMenuAct,
  removeAct,
}
