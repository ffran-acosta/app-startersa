import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core'
import { validateEnv } from './infrastructure/config/env.js'
import { AuthModule } from './infrastructure/http/auth/auth.module.js'
import { AllExceptionsFilter } from './infrastructure/http/common/all-exceptions.filter.js'
import { JwtAuthGuard } from './infrastructure/http/common/jwt-auth.guard.js'
import { validationPipe } from './infrastructure/http/common/validation.pipe.js'
import { TodosModule } from './infrastructure/http/todos/todos.module.js'
import { PersistenceModule } from './infrastructure/persistence/persistence.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    PersistenceModule,
    AuthModule,
    TodosModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_PIPE, useValue: validationPipe },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
