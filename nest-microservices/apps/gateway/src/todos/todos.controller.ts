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
import type { AuthUser } from '../../../../libs/contracts/index.js'
import { CurrentUser } from '../auth/current-user.decorator.js'
import { ServicesClient } from '../services.client.js'
import { CreateTodoDto } from './dto/create-todo.dto.js'
import { ListTodosQueryDto } from './dto/list-todos-query.dto.js'
import { UpdateTodoDto } from './dto/update-todo.dto.js'

@ApiTags('todos')
@ApiBearerAuth()
@Controller('todos')
export class TodosController {
  constructor(private readonly services: ServicesClient) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: ListTodosQueryDto) {
    return this.services.send('todos.list', { user, query })
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateTodoDto) {
    return this.services.send('todos.create', { user, data: dto })
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.services.send('todos.get', { user, id })
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
    return this.services.send('todos.update', { user, id, data: dto })
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.services.send('todos.remove', { user, id })
  }
}
