import { Module } from '@nestjs/common'
import { TodosController } from './todos.controller.js'
import { TodosRepository } from './todos.repository.js'
import { TodosService } from './todos.service.js'

@Module({
  controllers: [TodosController],
  providers: [TodosService, TodosRepository],
})
export class TodosModule {}
