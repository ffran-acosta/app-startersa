import { Module } from '@nestjs/common'
import { CreateTodo } from '../../../application/todos/create-todo.js'
import { DeleteTodo } from '../../../application/todos/delete-todo.js'
import { GetTodo } from '../../../application/todos/get-todo.js'
import { ListTodos } from '../../../application/todos/list-todos.js'
import { UpdateTodo } from '../../../application/todos/update-todo.js'
import { TodoRepository } from '../../../domain/todo/todo.repository.js'
import { provideUseCase } from '../../provide-use-case.js'
import { TodosController } from './todos.controller.js'

@Module({
  controllers: [TodosController],
  providers: [
    provideUseCase(ListTodos, [TodoRepository]),
    provideUseCase(GetTodo, [TodoRepository]),
    provideUseCase(CreateTodo, [TodoRepository]),
    provideUseCase(UpdateTodo, [TodoRepository]),
    provideUseCase(DeleteTodo, [TodoRepository]),
  ],
})
export class TodosModule {}
