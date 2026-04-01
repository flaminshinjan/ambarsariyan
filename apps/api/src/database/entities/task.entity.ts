import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TaskCategory {
  GMAIL = 'gmail',
  HTTP = 'http',
  CUSTOM = 'custom',
}

export enum TaskType {
  BUILTIN = 'builtin',
  CUSTOM = 'custom',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: '' })
  description: string;

  @Column({ type: 'text', default: TaskCategory.CUSTOM })
  category: TaskCategory;

  @Column({ type: 'text', default: TaskType.CUSTOM })
  type: TaskType;

  @Column()
  handler: string;

  @Column({ type: 'json', default: '{}' })
  config: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
