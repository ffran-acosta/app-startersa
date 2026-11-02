import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import type {
  MessagePayload,
  MessageResult,
  Pattern,
} from '../../../libs/contracts/index.js'
import { TodosService } from './todos.service.js'

@Controller()
export class TodosController {
  constructor(private readonly todos: TodosService) {}

  @MessagePattern('todos.list' satisfies Pattern)
  list(
    @Payload() { user, query }: MessagePayload<'todos.list'>,
  ): Promise<MessageResult<'todos.list'>> {
    return this.todos.list(user, query)
  }

  @MessagePattern('todos.create' satisfies Pattern)
  create(
    @Payload() { user, data }: MessagePayload<'todos.create'>,
  ): Promise<MessageResult<'todos.create'>> {
    return this.todos.create(user, data)
  }

  @MessagePattern('todos.get' satisfies Pattern)
  get(
    @Payload() { user, id }: MessagePayload<'todos.get'>,
  ): Promise<MessageResult<'todos.get'>> {
    return this.todos.get(user, id)
  }

  @MessagePattern('todos.update' satisfies Pattern)
  update(
    @Payload() { user, id, data }: MessagePayload<'todos.update'>,
  ): Promise<MessageResult<'todos.update'>> {
    return this.todos.update(user, id, data)
  }

  @MessagePattern('todos.remove' satisfies Pattern)
  async remove(
    @Payload() { user, id }: MessagePayload<'todos.remove'>,
  ): Promise<MessageResult<'todos.remove'>> {
    await this.todos.remove(user, id)
    return null
  }
}
