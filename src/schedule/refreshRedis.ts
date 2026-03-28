import { prisma } from '@/utils/DB'
import redisClient from '@/utils/RedisClient'
import GLBConfig from '@/utils/GLBConfig'
import { createLogger } from '@logger'

const logger = createLogger(__filename)

async function refreshRedis() {
  const apiList = await prisma.common_api.findMany({
    where: { state: '1', api_function: { not: '' } },
    select: { api_function: true, auth_flag: true },
  })

  const apis: Record<string, string> = {}
  for (const a of apiList) {
    apis[a.api_function] = a.auth_flag
  }

  if (Object.keys(apis).length !== 0) {
    await redisClient.set(GLBConfig.REDIS_KEYS.AUTHAPI, apis)
    logger.info('Refresh Api')
  }
}

export default {
  refreshRedis,
}
