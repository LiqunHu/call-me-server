import { redisClient } from 'node-srv-utils'
import { simpleSelect } from '@/utils/DB'
import GLBConfig from '@/utils/GLBConfig'
import { createLogger } from '@app/logger'
const logger = createLogger(__filename)

async function refreshRedis() {
  const apiList = await simpleSelect(
    `select api_function, auth_flag from tbl_common_api where state = '1' and api_function != '' `,
    []
  )

  const apis = {}
  for (const a of apiList) {
    apis[a.api_function] = a.auth_flag
  }

  if (Object.keys(apis).length != 0) {
    await redisClient.set(GLBConfig.REDIS_KEYS.AUTHAPI, apis)
    logger.info('Refresh Api')
  }
}

export default {
  refreshRedis
}
