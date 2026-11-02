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
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import type { Actor } from '../../../shared/domain/actor.js'
import { CurrentUser } from '../../../shared/infrastructure/http/current-user.decorator.js'
import { CreateTodoCommand } from '../../application/commands/create-todo.command.js'
import { DeleteTodoCommand } from '../../application/commands/delete-todo.command.js'
import { UpdateTodoCommand } from '../../application/commands/update-todo.command.js'
import { GetTodoQuery } from '../../application/queries/get-todo.query.js'
import { ListTodosQuery } from '../../application/queries/list-todos.query.js'
import { CreateTodoDto } from './dto/create-todo.dto.js'
import { ListTodosQueryDto } from './dto/list-todos-query.dto.js'
import { UpdateTodoDto } from './dto/update-todo.dto.js'

/** Los comandos no devuelven el recurso: la respuesta sale del lado de lectura. */
@ApiTags('todos')
@ApiBearerAuth()
@Controller('todos')
export class TodosController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  list(@CurrentUser() actor: Actor, @Query() query: ListTodosQueryDto) {
    return this.queryBus.execute(new ListTodosQuery(actor, query))
  }

  @Post()
  async create(@CurrentUser() actor: Actor, @Body() dto: CreateTodoDto) {
    const id = await this.commandBus.execute(
      new CreateTodoCommand(actor, withDueDate(dto)),
    )
    return this.queryBus.execute(new GetTodoQuery(actor, id))
  }

  @Get(':id')
  get(@CurrentUser() actor: Actor, @Param('id', ParseUUIDPipe) id: string) {
    return this.queryBus.execute(new GetTodoQuery(actor, id))
  }

  @Patch(':id')
  async update(
    @CurrentUser() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTodoDto,
  ) {
    if (Object.values(dto).every((value) => value === undefined)) {
      throw new BadRequestException('At least one field must be provided')
    }
    await this.commandBus.execute(
      new UpdateTodoCommand(actor, id, withDueDate(dto)),
    )
    return this.queryBus.execute(new GetTodoQuery(actor, id))
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() actor: Actor, @Param('id', ParseUUIDPipe) id: string) {
    return this.commandBus.execute(new DeleteTodoCommand(actor, id))
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
