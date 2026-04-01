import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Workflow } from './workflow.entity';
import { TaskRun } from './task-run.entity';

export enum WorkflowRunStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('workflow_runs')
export class WorkflowRun {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workflowId: string;

  @ManyToOne(() => Workflow, { eager: true })
  @JoinColumn({ name: 'workflowId' })
  workflow: Workflow;

  @Column({ type: 'text', default: WorkflowRunStatus.PENDING })
  status: WorkflowRunStatus;

  @OneToMany(() => TaskRun, (tr) => tr.workflowRun, { eager: true, cascade: true })
  taskRuns: TaskRun[];

  @Column({ type: 'datetime', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
