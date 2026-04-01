import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug',
}

@Entity('log_entries')
export class LogEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  level: LogLevel;

  @Column()
  message: string;

  @Column({ default: '' })
  context: string;

  @Column({ type: 'json', default: '{}' })
  metadata: Record<string, unknown>;

  @CreateDateColumn()
  timestamp: Date;
}
