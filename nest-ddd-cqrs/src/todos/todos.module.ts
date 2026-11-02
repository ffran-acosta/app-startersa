import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CreateTodoHandler } from './application/commands/create-todo.command.js'
import { DeleteTodoHandler } from './application/commands/delete-todo.command.js'
import { UpdateTodoHandler } from './application/commands/update-todo.command.js'
import { LogTodoActivityHandler } from './application/events/log-todo-activity.handler.js'
import { GetTodoHandler } from './application/queries/get-todo.query.js'
import { ListTodosHandler } from './application/queries/list-todos.query.js'
import { TodoReadModel } from './application/queries/todo-read-model.js'
import { TodoRepository } from './domain/todo.repository.js'
import { TodosController } from './infrastructure/http/todos.controller.js'
import { TodoEntity } from './infrastructure/persistence/todo.entity.js'
import { TypeormTodoReadModel } from './infrastructure/persistence/typeorm-todo.read-model.js'
import { TypeormTodoRepository } from './infrastructure/persistence/typeorm-todo.repository.js'

/** Bounded context `todos`. */
@Module({
  imports: [TypeOrmModule.forFeature([TodoEntity])],
  controllers: [TodosController],
  providers: [
    { provide: TodoRepository, useClass: TypeormTodoRepository },
    { provide: TodoReadModel, useClass: TypeormTodoReadModel },
    CreateTodoHandler,
    UpdateTodoHandler,
    DeleteTodoHandler,
    GetTodoHandler,
    ListTodosHandler,
    LogTodoActivityHandler,
  ],
})
export class TodosModule {}
