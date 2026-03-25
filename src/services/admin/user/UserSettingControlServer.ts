import { Request } from 'express'
import common from '@/utils/Common'
import GLBConfig from '@/utils/GLBConfig'
import { common_user } from '@entities/common'
import { createLogger } from '@app/logger'
const logger = createLogger(__filename)

async function changePasswordAct(req: Request) {
  const doc = common.docValidate(req)
  const user = req.user

  const modiuser = await common_user.findOne({
    where: {
      user_id: user.user_id,
      base: {
        state: GLBConfig.ENABLE
      }
    }
  })

  if (modiuser) {
    if (modiuser.user_password != doc.old_password) {
      return common.error('usersetting_01')
    }

    modiuser.user_password = doc.password
    await modiuser.save()
    logger.debug('modisuccess')
    return common.success()
  } else {
    return common.error('common_api_02')
  }
}

export default {
  changePasswordAct
}
