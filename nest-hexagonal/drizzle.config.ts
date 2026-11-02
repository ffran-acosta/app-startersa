import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/infrastructure/persistence/schema.ts',
  out: './drizzle/migrations',
  casing: 'snake_case',
  dbCredentials: { url: process.env.DATABASE_URL! },
})
