import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'

const { DATABASE_URL } = process.env
if (!DATABASE_URL) throw new Error('DATABASE_URL is required')

const db = drizzle(DATABASE_URL)
await migrate(db, { migrationsFolder: 'drizzle/migrations' })
await db.$client.end()
