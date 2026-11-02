import { join } from 'node:path'
import type { DataSourceOptions } from 'typeorm'
import { RefreshTokenEntity } from '../identity/infrastructure/persistence/refresh-token.entity.js'
import { UserEntity } from '../identity/infrastructure/persistence/user.entity.js'
import { TodoEntity } from '../todos/infrastructure/persistence/todo.entity.js'

/** Compartido por la app, la CLI de TypeORM, el migrador y el seed. */
export function typeOrmOptions(url: string): DataSourceOptions {
  return {
    type: 'postgres',
    url,
    entities: [UserEntity, RefreshTokenEntity, TodoEntity],
    migrations: [join(import.meta.dirname, 'migrations', '*.{ts,js}')],
  }
}
