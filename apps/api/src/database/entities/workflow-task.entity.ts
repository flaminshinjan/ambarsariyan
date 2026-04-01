import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Workflow } from './workflow.entity';
import { Task } from './task.entity';

@Entity('workflow_tasks')
export class WorkflowTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workflowId: string;

  @Column()
  taskId: string;

  @Column()
  sequence: number;

  @ManyToOne(() => Workflow, (w) => w.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflowId' })
  workflow: Workflow;

  @ManyToOne(() => Task, { eager: true })
  @JoinColumn({ name: 'taskId' })
  task: Task;
}
