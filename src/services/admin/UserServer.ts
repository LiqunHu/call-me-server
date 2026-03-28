import { Request } from 'express'
import common from '@/utils/Common'
import GLBConfig from '@/utils/GLBConfig'
import { prisma, queryWithCount } from '@/utils/DB'
import redisClient from '@/utils/RedisClient'
import { createLogger } from '@logger'

const logger = createLogger(__filename)

async function initAct() {
  const returnData = Object.create(null)

  const groups: {
    id: number
    text: string
    disabled: boolean
  }[] = []

  async function genUserGroup(parentId: string, lev: number) {
    const actgroups = await prisma.common_group.findMany({
      where: {
        parent_id: parentId,
        group_type: GLBConfig.USER_TYPE.TYPE_DEFAULT,
        state: GLBConfig.ENABLE,
      },
      orderBy: { group_id: 'asc' },
    })
    for (const g of actgroups) {
      if (g.node_type === GLBConfig.NODE_TYPE.NODE_ROOT) {
        groups.push({
          id: g.group_id,
          text: '--'.repeat(lev) + g.group_name,
          disabled: true,
        })
        await genUserGroup(String(g.group_id), lev + 1)
      } else {
        groups.push({
          id: g.group_id,
          text: '--'.repeat(lev) + g.group_name,
          disabled: false,
        })
      }
    }
  }

  await genUserGroup('0', 0)
  returnData.groupInfo = groups

  return common.success(returnData)
}

async function searchAct(req: Request) {
  const doc = common.docValidate(req)
  const returnData = Object.create(null)

  let queryStr = `select * from tbl_common_user where state = '1' and user_type = '${GLBConfig.USER_TYPE.TYPE_DEFAULT}' `
  const replacements: any[] = []

  if (doc.search_text) {
    queryStr += ` and (user_username like $1 or user_email like $2 or user_phone like $3 or user_name like $4 or user_address like $5 or user_account like $6)`
    const search_text = '%' + doc.search_text + '%'
    replacements.push(search_text, search_text, search_text, search_text, search_text, search_text)
  }

  const result = await queryWithCount(doc, queryStr, replacements)

  returnData.total = result.count
  returnData.rows = []

  for (const ap of result.data as any[]) {
    ap.user_groups = []
    const user_groups = await prisma.common_user_group.findMany({
      where: { user_id: ap.user_id, state: GLBConfig.ENABLE },
      select: { group_id: true },
    })
    for (const g of user_groups) {
      ap.user_groups.push(g.group_id)
    }
    delete ap.user_password
    returnData.rows.push(ap)
  }

  return common.success(returnData)
}

async function addAct(req: Request) {
  const doc = common.docValidate(req)
  let groupCheckFlag = true

  for (const gid of doc.user_groups) {
    const usergroup = await prisma.common_group.findFirst({
      where: { group_id: gid, state: GLBConfig.ENABLE },
    })
    if (!usergroup) {
      groupCheckFlag = false
      break
    }
  }

  if (groupCheckFlag) {
    const adduser = await prisma.common_user.findFirst({
      where: {
        state: GLBConfig.ENABLE,
        OR: [{ user_phone: doc.user_phone }, { user_username: doc.user_username }],
      },
    })
    if (adduser) {
      return common.error('operator_02')
    }
    const created = await prisma.common_user.create({
      data: {
        user_type: GLBConfig.USER_TYPE.TYPE_DEFAULT,
        user_username: doc.user_username,
        user_email: doc.user_email,
        user_phone: doc.user_phone,
        user_password: GLBConfig.INITPASSWORD,
        user_name: doc.user_name,
        user_gender: doc.user_gender,
        user_address: doc.user_address,
        user_zipcode: doc.user_zipcode,
        state: GLBConfig.ENABLE,
      },
    })

    for (const gid of doc.user_groups) {
      await prisma.common_user_group.create({
        data: {
          user_id: created.user_id,
          group_id: gid,
          state: GLBConfig.ENABLE,
        },
      })
    }

    const returnData = JSON.parse(JSON.stringify(created))
    delete returnData.user_password
    returnData.user_groups = doc.user_groups

    return common.success(returnData)
  } else {
    return common.error('operator_01')
  }
}

async function modifyAct(req: Request) {
  const doc = common.docValidate(req)

  const modiuser = await prisma.common_user.findFirst({
    where: { user_id: doc.user_id, state: GLBConfig.ENABLE },
  })
  if (modiuser) {
    if (doc.user_email) {
      const emailuser = await prisma.common_user.findFirst({
        where: {
          user_email: doc.user_email,
          user_id: { not: modiuser.user_id },
          state: GLBConfig.ENABLE,
        },
      })
      if (emailuser) {
        return common.error('operator_02')
      }
    }

    if (doc.user_phone) {
      const phoneuser = await prisma.common_user.findFirst({
        where: {
          user_phone: doc.user_phone,
          user_id: { not: modiuser.user_id },
          state: GLBConfig.ENABLE,
        },
      })
      if (phoneuser) {
        return common.error('operator_02')
      }
    }

    await prisma.common_user.update({
      where: { user_id: modiuser.user_id },
      data: {
        user_email: doc.user_email,
        user_phone: doc.user_phone,
        user_name: doc.user_name,
        user_gender: doc.user_gender,
        user_avatar: doc.user_avatar,
        user_address: doc.user_address,
        user_zipcode: doc.user_zipcode,
      },
    })

    const links = await prisma.common_user_group.findMany({
      where: { user_id: modiuser.user_id, state: GLBConfig.ENABLE },
    })
    const existids: number[] = []
    for (const g of links) {
      if (doc.user_groups.indexOf(g.group_id) < 0) {
        await prisma.common_user_group.delete({
          where: { user_group_id: g.user_group_id },
        })
      } else {
        existids.push(g.group_id)
      }
    }

    for (const gid of doc.user_groups) {
      if (existids.indexOf(gid) < 0) {
        await prisma.common_user_group.create({
          data: {
            user_id: modiuser.user_id,
            group_id: gid,
            state: GLBConfig.ENABLE,
          },
        })
      }
    }

    const fresh = await prisma.common_user.findFirst({
      where: { user_id: modiuser.user_id },
    })
    const returnData = JSON.parse(JSON.stringify(fresh))
    delete returnData.user_password
    returnData.user_groups = doc.user_groups
    logger.debug('modify success')
    return common.success(returnData)
  } else {
    return common.error('operator_03')
  }
}

async function deleteAct(req: Request) {
  const doc = common.docValidate(req)

  const deluser = await prisma.common_user.findFirst({
    where: { user_id: doc.user_id, state: GLBConfig.ENABLE },
  })

  if (deluser) {
    await prisma.common_user.update({
      where: { user_id: deluser.user_id },
      data: { state: GLBConfig.DISABLE },
    })
    await redisClient.del([GLBConfig.REDIS_KEYS.AUTH, 'WEB', deluser.user_id].join('_'))
    await redisClient.del([GLBConfig.REDIS_KEYS.AUTH, 'MOBILE', deluser.user_id].join('_'))
    return common.success()
  } else {
    return common.error('operator_03')
  }
}

export default {
  initAct,
  searchAct,
  addAct,
  modifyAct,
  deleteAct,
}
