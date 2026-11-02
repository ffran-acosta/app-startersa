import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { envValidator } from '../../../libs/config/validate-env.js'
import { Env } from './env.js'
import { PrismaService } from './prisma.service.js'
import { TodosController } from './todos.controller.js'
import { TodosRepository } from './todos.repository.js'
import { TodosService } from './todos.service.js'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: envValidator(Env) }),
  ],
  controllers: [TodosController],
  providers: [PrismaService, TodosService, TodosRepository],
})
export class AppModule {}
