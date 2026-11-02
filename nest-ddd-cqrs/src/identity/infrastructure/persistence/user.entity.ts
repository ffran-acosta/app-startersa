import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Role } from '../../../shared/domain/actor.js'

@Entity('users')
export class UserEntity {
  @PrimaryColumn('uuid')
  id: string

  @Column({ type: 'text', unique: true })
  email: string

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash: string

  @Column({ type: 'text' })
  name: string

  @Column({ type: 'enum', enum: Role, enumName: 'role', default: Role.USER })
  role: Role

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date
}
