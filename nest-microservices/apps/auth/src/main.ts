import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { Transport, type AsyncMicroserviceOptions } from '@nestjs/microservices'
import { AppModule } from './app.module.js'
import type { Env } from './env.js'

async function bootstrap() {
  const app = await NestFactory.createMicroservice<AsyncMicroserviceOptions>(
    AppModule,
    {
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        transport: Transport.NATS,
        // Con `queue`, las réplicas de auth se reparten los mensajes.
        options: {
          servers: config.get<Env['NATS_URL']>('NATS_URL'),
          queue: 'auth',
        },
      }),
    },
  )
  app.enableShutdownHooks()
  await app.listen()
}
await bootstrap()
