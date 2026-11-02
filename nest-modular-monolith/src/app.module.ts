import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_PIPE } from '@nestjs/core'
import { AuthModule } from './modules/auth/index.js'
import { TodosModule } from './modules/todos/index.js'
import { UsersModule } from './modules/users/index.js'
import { validateEnv } from './shared/config/env.js'
import { PrismaModule } from './shared/database/prisma.module.js'
import { AllExceptionsFilter } from './shared/http/all-exceptions.filter.js'
import { validationPipe } from './shared/http/validation.pipe.js'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    PrismaModule,
    UsersModule,
    AuthModule,
    TodosModule,
  ],
  providers: [
    { provide: APP_PIPE, useValue: validationPipe },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
