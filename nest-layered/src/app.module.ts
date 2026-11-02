import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js'
import { validationPipe } from './common/pipes/validation.pipe.js'
import { validateEnv } from './config/env.js'
import { PrismaModule } from './database/prisma.module.js'
import { AuthModule } from './modules/auth/auth.module.js'
import { TodosModule } from './modules/todos/todos.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    PrismaModule,
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
