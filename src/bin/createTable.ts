import 'dotenv/config'
import { DataSource } from 'typeorm'
import { SnakeNamingStrategy } from '@/utils/DB'
import { typeormLogger } from '@logger'

// const table = null
const table = 'src/entities/common/common_api.ts'
// let connection: Connection | null = null
export async function createDB() {
  if (table) {
    const dataSource = new DataSource({
      type: 'postgres',
      url: process.env.DATABASE_URL || '',
      entities: [table],
      synchronize: true,
      logger: typeormLogger,
      namingStrategy: new SnakeNamingStrategy(),
    })
    await dataSource.initialize()
  }
}

(async () => {
  await createDB()
  process.exit(0)
})()
