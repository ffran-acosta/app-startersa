import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'
import { TodoStatus } from '../../domain/todo.js'

/**
 * Modelo de persistencia, separado del aggregate. `owner_id` referencia a un
 * usuario de otro contexto (identity), así que va sin FK ni relación.
 */
@Entity('todos')
@Index(['ownerId', 'createdAt'])
export class TodoEntity {
  @PrimaryColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 200 })
  title: string

  @Column({ type: 'varchar', length: 2000, nullable: true })
  description: string | null

  @Column({
    type: 'enum',
    enum: TodoStatus,
    enumName: 'todo_status',
    default: TodoStatus.PENDING,
  })
  status: TodoStatus

  @Column({ name: 'due_date', type: 'timestamptz', nullable: true })
  dueDate: Date | null

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date
}
