// Centralized mocks to keep API tests isolated from real DB/Redis/log file IO.

jest.mock('@utils/Logger', () => {
  const noop = () => undefined
  const child = () => ({
    info: noop,
    debug: noop,
    warn: noop,
    error: noop,
    fatal: noop,
  })

  return {
    __esModule: true,
    default: child(),
    createLogger: () => child(),
  }
})

jest.mock('@utils/RedisClient', () => {
  const noopAsync = async () => undefined
  return {
    __esModule: true,
    default: {
      initClient: noopAsync,
      quit: () => undefined,
      get: async () => ({}), // prevents AuthMiddleware from querying DB for AUTHAPI
      set: noopAsync,
      setExpiry: noopAsync,
      del: noopAsync,
      hmset: noopAsync,
      hset: noopAsync,
      hgetall: async () => ({}),
      hget: async () => null,
      hdel: noopAsync,
      ttl: async () => 0,
    },
  }
})

jest.mock('@utils/DB', () => {
  const prisma = {
    common_api: {
      findMany: async () => [],
    },
    common_user: {
      findFirst: async () => null,
      update: async () => ({}),
    },
    $queryRaw: async () => [],
    $queryRawUnsafe: async () => [],
    $disconnect: async () => undefined,
  }

  return {
    __esModule: true,
    prisma,
    initDB: () => undefined,
    closeDB: async () => undefined,
    simpleSelect: async () => [],
    queryWithCount: async () => ({ count: 0, data: [] }),
  }
})

