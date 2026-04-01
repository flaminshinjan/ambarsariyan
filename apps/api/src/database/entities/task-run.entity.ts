import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { WorkflowRun } from './workflow-run.entity';

export enum TaskRunStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

@Entity('task_runs')
export class TaskRun {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workflowRunId: string;

  @Column()
  taskId: string;

  @ManyToOne(() => Task, { eager: true })
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @ManyToOne(() => WorkflowRun, (wr) => wr.taskRuns, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflowRunId' })
  workflowRun: WorkflowRun;

  @Column()
  sequence: number;

  @Column({ type: 'text', default: TaskRunStatus.PENDING })
  status: TaskRunStatus;

  @Column({ type: 'json', nullable: true })
  response: unknown;

  @Column({ type: 'datetime', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date | null;
}
