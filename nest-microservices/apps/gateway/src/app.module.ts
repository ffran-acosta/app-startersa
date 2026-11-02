import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { envValidator } from '../../../libs/config/validate-env.js'
import { AuthController } from './auth/auth.controller.js'
import { JwtAuthGuard } from './auth/jwt-auth.guard.js'
import { Env } from './env.js'
import { AllExceptionsFilter } from './http/all-exceptions.filter.js'
import { validationPipe } from './http/validation.pipe.js'
import { NATS_CLIENT, ServicesClient } from './services.client.js'
import { TodosController } from './todos/todos.controller.js'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: envValidator(Env) }),
    // Solo verifica access tokens; los firma el servicio auth.
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        secret: config.get('JWT_ACCESS_SECRET', { infer: true }),
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: NATS_CLIENT,
        inject: [ConfigService],
        useFactory: (config: ConfigService<Env, true>) => ({
          transport: Transport.NATS,
          options: { servers: config.get<Env['NATS_URL']>('NATS_URL') },
        }),
      },
    ]),
  ],
  controllers: [AuthController, TodosController],
  providers: [
    ServicesClient,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_PIPE, useValue: validationPipe },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
