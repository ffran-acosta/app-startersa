import {
  IsEnum,
  IsRFC3339,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateIf,
} from 'class-validator'
import {
  TodoStatus,
  type UpdateTodoData,
} from '../../../../../libs/contracts/index.js'

/** Parcial: `undefined` no toca el campo; `null` borra `description` o `dueDate`. */
export class UpdateTodoDto implements UpdateTodoData {
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Length(1, 200)
  title?: string

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null

  @ValidateIf((_, value) => value !== undefined)
  @IsEnum(TodoStatus)
  status?: TodoStatus

  @IsOptional()
  @IsRFC3339()
  dueDate?: string | null
}
