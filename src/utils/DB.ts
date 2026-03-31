import { PrismaClient } from '@prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { createLogger } from '@logger'

export let prisma: PrismaClient<'query'>
const logger = createLogger('Prisma')

export function initDB(url: string) {
  const pool = new PrismaPg({ connectionString: url })
  prisma = new PrismaClient({
    adapter: pool,
    log: [{ emit: 'event', level: 'query' }],
  })
  prisma.$on('query', (event) => {
    logger.debug(
      {
        query: event.query,
        params: event.params,
        duration: event.duration,
        target: event.target,
      },
      'prisma query',
    )
  })
}

export async function closeDB() {
  if (prisma) {
    await prisma.$disconnect()
  }
}

export async function simpleSelect(queryStr: string, replacements?: any[]) {
  return prisma.$queryRawUnsafe(queryStr, ...(replacements ?? []))
}

interface pageInfo {
  offset?: number
  limit?: number
}
export async function queryWithCount(pageDoc: pageInfo, queryStr: string, replacements?: any[]) {
  let queryStrCnt = ''
  const lowerStr = queryStr.toLowerCase()
  if (lowerStr.indexOf('group by') >= 0) {
    queryStrCnt = 'select count(1) num from ( ' + queryStr + ' ) temp'
  } else {
    const start = lowerStr.lastIndexOf('from') + 5
    let end = lowerStr.search(/order\s+by/)
    if (end < 0) {
      end = lowerStr.length
    }
    queryStrCnt = 'select count(1) num from ' + queryStr.slice(start, end)
  }
  const count: any = await prisma.$queryRawUnsafe(queryStrCnt, ...(replacements ?? []))

  const rep = [...(replacements ?? [])]
  const index = rep.length
  rep.push(pageDoc.offset || 0)
  rep.push(pageDoc.limit || 100)

  const queryRst = await prisma.$queryRawUnsafe(queryStr + ` offset $${index + 1} limit $${index + 2}`, ...rep)

  return {
    count: Number(count[0].num),
    data: queryRst,
  }
}
