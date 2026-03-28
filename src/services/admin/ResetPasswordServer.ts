import { Request } from 'express'
import common from '@/utils/Common'
import GLBConfig from '@/utils/GLBConfig'
import { prisma } from '@/utils/DB'
import { createLogger } from '@logger'

const logger = createLogger(__filename)

async function searchAct(req: Request) {
  const doc = common.docValidate(req)

  const user = await prisma.common_user.findFirst({
    where: {
      state: GLBConfig.ENABLE,
      user_type: { not: GLBConfig.USER_TYPE.TYPE_ADMINISTRATOR },
      OR: [
        { user_phone: doc.search_text },
        { user_username: doc.search_text },
        { user_email: doc.search_text },
        { user_account: doc.search_text },
      ],
    },
  })

  if (user) {
    const ret = JSON.parse(JSON.stringify(user))
    delete ret.user_password
    return common.success(ret)
  } else {
    return common.error('resetpassword_01')
  }
}

async function resetAct(req: Request) {
  const doc = common.docValidate(req)

  const user = await prisma.common_user.findFirst({
    where: {
      user_id: doc.user_id,
      updated_at: doc.updated_at,
      state: GLBConfig.ENABLE,
    },
  })

  if (user) {
    await prisma.common_user.update({
      where: { user_id: user.user_id },
      data: {
        user_password: GLBConfig.INITPASSWORD,
        user_password_error: 0,
      },
    })
    logger.debug('modisuccess')
    return common.success()
  } else {
    return common.error('resetpassword_01')
  }
}

export default {
  searchAct,
  resetAct,
}
