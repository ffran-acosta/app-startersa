import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CreateTodo } from '../../../application/todos/create-todo.js'
import { DeleteTodo } from '../../../application/todos/delete-todo.js'
import { GetTodo } from '../../../application/todos/get-todo.js'
import { ListTodos } from '../../../application/todos/list-todos.js'
import { UpdateTodo } from '../../../application/todos/update-todo.js'
import type { Actor } from '../../../domain/user/user.js'
import { CurrentUser } from '../common/current-user.decorator.js'
import { CreateTodoDto } from './dto/create-todo.dto.js'
import { ListTodosQueryDto } from './dto/list-todos-query.dto.js'
import { UpdateTodoDto } from './dto/update-todo.dto.js'

@ApiTags('todos')
@ApiBearerAuth()
@Controller('todos')
export class TodosController {
  constructor(
    private readonly listTodos: ListTodos,
    private readonly getTodo: GetTodo,
    private readonly createTodo: CreateTodo,
    private readonly updateTodo: UpdateTodo,
    private readonly deleteTodo: DeleteTodo,
  ) {}

  @Get()
  list(@CurrentUser() actor: Actor, @Query() query: ListTodosQueryDto) {
    return this.listTodos.execute(actor, query)
  }

  @Post()
  create(@CurrentUser() actor: Actor, @Body() dto: CreateTodoDto) {
    return this.createTodo.execute(actor, withDueDate(dto))
  }

  @Get(':id')
  get(@CurrentUser() actor: Actor, @Param('id', ParseUUIDPipe) id: string) {
    return this.getTodo.execute(actor, id)
  }

  @Patch(':id')
  update(
    @CurrentUser() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTodoDto,
  ) {
    if (Object.values(dto).every((value) => value === undefined)) {
      throw new BadRequestException('At least one field must be provided')
    }
    return this.updateTodo.execute(actor, id, withDueDate(dto))
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() actor: Actor, @Param('id', ParseUUIDPipe) id: string) {
    return this.deleteTodo.execute(actor, id)
  }
}

/** El contrato usa strings RFC 3339; el dominio, `Date`. */
function withDueDate<T extends { dueDate?: string | null }>({
  dueDate,
  ...rest
}: T) {
  return {
    ...rest,
    dueDate: typeof dueDate === 'string' ? new Date(dueDate) : dueDate,
  }
}
