import { Global, Module } from '@nestjs/common'
import { RefreshTokenRepository } from '../../domain/auth/refresh-token.repository.js'
import { TodoRepository } from '../../domain/todo/todo.repository.js'
import { UserRepository } from '../../domain/user/user.repository.js'
import { DrizzleRefreshTokenRepository } from './drizzle-refresh-token.repository.js'
import { DrizzleTodoRepository } from './drizzle-todo.repository.js'
import { DrizzleUserRepository } from './drizzle-user.repository.js'
import { DrizzleService } from './drizzle.service.js'

/** Conecta cada puerto de repositorio con su adaptador Drizzle. */
@Global()
@Module({
  providers: [
    DrizzleService,
    { provide: UserRepository, useClass: DrizzleUserRepository },
    {
      provide: RefreshTokenRepository,
      useClass: DrizzleRefreshTokenRepository,
    },
    { provide: TodoRepository, useClass: DrizzleTodoRepository },
  ],
  exports: [UserRepository, RefreshTokenRepository, TodoRepository],
})
export class PersistenceModule {}
