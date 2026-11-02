import { Type } from 'class-transformer'
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator'
import {
  TodoStatus,
  type ListTodosQuery,
} from '../../../../../libs/contracts/index.js'

export class ListTodosQueryDto implements ListTodosQuery {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20

  @IsOptional()
  @IsEnum(TodoStatus)
  status?: TodoStatus

  @IsOptional()
  @IsString()
  @Length(1, 100)
  search?: string
}
