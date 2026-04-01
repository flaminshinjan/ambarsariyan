import { WorkflowRunStatus, TaskRunStatus } from '../enums';
import { ITask } from './task';

export interface IWorkflow {
  id: string;
  name: string;
  description: string;
  tasks: IWorkflowTask[];
  createdAt: string;
  updatedAt: string;
}

export interface IWorkflowTask {
  id: string;
  taskId: string;
  task?: ITask;
  sequence: number;
}

export interface IWorkflowRun {
  id: string;
  workflowId: string;
  workflow?: IWorkflow;
  status: WorkflowRunStatus;
  taskRuns: ITaskRun[];
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface ITaskRun {
  id: string;
  workflowRunId: string;
  taskId: string;
  task?: ITask;
  sequence: number;
  status: TaskRunStatus;
  response: unknown;
  startedAt: string | null;
  completedAt: string | null;
}

export interface IWorkflowTemplate {
  id: string;
  name: string;
  description: string;
  taskIds: string[];
}
