import { Request } from 'express'
import { createLogger } from '@logger'
import common from '@utils/Common'
const logger = createLogger(__filename)

async function echoAct(req: Request) {
  logger.info('echoAct called')
  return common.success({ aaaa: 1111 })
}

export default {
  echoAct,
}
