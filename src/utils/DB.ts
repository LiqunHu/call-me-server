import type { NamingStrategyInterface } from 'typeorm'
import { DataSource, DefaultNamingStrategy } from 'typeorm'
import { snakeCase } from 'typeorm/util/StringUtils'
import { typeormLogger } from '@logger'
import 'dotenv/config'

export class SnakeNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
  tableName(className: string, customName?: string) {
    return customName || snakeCase(className)
  }

  columnName(propertyName: string, customName: string | undefined, embeddedPrefixes: string[]) {
    return snakeCase(embeddedPrefixes.concat('').join('_')) + (customName || snakeCase(propertyName))
  }

  relationName(propertyName: string) {
    return snakeCase(propertyName)
  }

  joinColumnName(relationName: string, referencedColumnName: string) {
    return snakeCase(`${relationName}_${referencedColumnName}`)
  }

  joinTableName(firstTableName: string, secondTableName: string, firstPropertyName: string) {
    return snakeCase(`${firstTableName}_${firstPropertyName.replace(/\./g, '_')}_${secondTableName}`)
  }

  joinTableColumnName(tableName: string, propertyName: string, columnName?: string) {
    return snakeCase(`${tableName}_${columnName || propertyName}`)
  }

  classTableInheritanceParentColumnName(parentTableName: string, parentTableIdPropertyName: string) {
    return snakeCase(`${parentTableName}_${parentTableIdPropertyName}`)
  }

  eagerJoinRelationAlias(alias: string, propertyPath: string) {
    return `${alias}_${propertyPath.replace('.', '_')}`
  }
}

// let connection: Connection | null = null
export const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || '',
  entities: [__dirname + '/../entities/**/*{.ts,.js}'],
  synchronize: false,
  logger: typeormLogger,
  namingStrategy: new SnakeNamingStrategy(),
})

export async function initDB() {
  await dataSource.initialize()
}

export async function simpleSelect(queryStr: string, replacements?: any[]) {
  const entityManager = dataSource.manager
  const result = await entityManager.query(queryStr, replacements)
  return result
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
  const entityManager = dataSource.manager
  const count = await entityManager.query(queryStrCnt, replacements)

  const rep = replacements || []
  const index = rep.length
  rep.push(pageDoc.offset || 0)
  rep.push(pageDoc.limit || 100)

  const queryRst = await entityManager.query(queryStr + ` offset $${index + 1} limit $${index + 2}`, rep)

  return {
    count: count[0].num,
    data: queryRst,
  }
}
// module.exports.queryWithCount = async (pageDoc, queryStr, replacements) => {
//   let queryStrCnt = ''
//   let lowerStr = queryStr.toLowerCase()
//   if (lowerStr.indexOf('group by') >= 0) {
//     queryStrCnt = 'select count(1) num from ( ' + lowerStr + ' ) temp'
//   } else {
//     let cnt = lowerStr.indexOf('from') + 5
//     queryStrCnt = 'select count(1) num from ' + queryStr.substr(cnt)
//   }

//   let count = await dbHandle.query(queryStrCnt, {
//     replacements: replacements,
//     type: dbHandle.QueryTypes.SELECT
//   })

//   let rep = replacements
//   rep.push(pageDoc.offset || 0)
//   rep.push(pageDoc.limit || 100)

//   let queryRst = await dbHandle.query(queryStr + ' LIMIT ?,?', {
//     replacements: rep,
//     type: dbHandle.QueryTypes.SELECT
//   })

//   return {
//     count: count[0].num,
//     data: queryRst
//   }
// }
