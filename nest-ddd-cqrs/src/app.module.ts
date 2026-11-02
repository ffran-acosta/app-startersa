import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { typeOrmOptions } from './database/options.js'
import { IdentityModule } from './identity/identity.module.js'
import { validateEnv, type Env } from './shared/infrastructure/config/env.js'
import { AllExceptionsFilter } from './shared/infrastructure/http/all-exceptions.filter.js'
import { JwtAuthGuard } from './shared/infrastructure/http/jwt-auth.guard.js'
import { validationPipe } from './shared/infrastructure/http/validation.pipe.js'
import { TodosModule } from './todos/todos.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        typeOrmOptions(config.get('DATABASE_URL', { infer: true })),
    }),
    CqrsModule.forRoot(),
    IdentityModule,
    TodosModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_PIPE, useValue: validationPipe },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
