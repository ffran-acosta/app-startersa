import 'dotenv/config'
import { DataSource } from 'typeorm'
import { typeOrmOptions } from './options.js'

const { DATABASE_URL } = process.env
if (!DATABASE_URL) throw new Error('DATABASE_URL is required')

/** Para la CLI de TypeORM (`pnpm typeorm ...`), el migrador y el seed. */
export default new DataSource(typeOrmOptions(DATABASE_URL))
