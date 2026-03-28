import { Request } from 'express'
import common from '@/utils/Common'
import GLBConfig from '@/utils/GLBConfig'
import { prisma } from '@/utils/DB'
import { createLogger } from '@logger'

const logger = createLogger(__filename)

async function changePasswordAct(req: Request) {
  const doc = common.docValidate(req)
  const user = req.user
  if (!user?.user_id) {
    return common.error('common_api_02')
  }

  const modiuser = await prisma.common_user.findFirst({
    where: {
      user_id: user.user_id,
      state: GLBConfig.ENABLE,
    },
  })

  if (modiuser) {
    if (modiuser.user_password != doc.old_password) {
      return common.error('usersetting_01')
    }

    await prisma.common_user.update({
      where: { user_id: modiuser.user_id },
      data: { user_password: doc.password },
    })
    logger.debug('modisuccess')
    return common.success()
  } else {
    return common.error('common_api_02')
  }
}

export default {
  changePasswordAct,
}
