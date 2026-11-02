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
import { CurrentUser, type AuthUser } from '../auth/index.js'
import { CreateTodoDto } from './dto/create-todo.dto.js'
import { ListTodosQueryDto } from './dto/list-todos-query.dto.js'
import { UpdateTodoDto } from './dto/update-todo.dto.js'
import { TodosService } from './todos.service.js'

@ApiTags('todos')
@ApiBearerAuth()
@Controller('todos')
export class TodosController {
  constructor(private readonly todos: TodosService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: ListTodosQueryDto) {
    return this.todos.list(user, query)
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateTodoDto) {
    return this.todos.create(user, dto)
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.todos.get(user, id)
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTodoDto,
  ) {
    if (Object.values(dto).every((value) => value === undefined)) {
      throw new BadRequestException('At least one field must be provided')
    }
    return this.todos.update(user, id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.todos.remove(user, id)
  }
}
