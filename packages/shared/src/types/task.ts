import { TaskCategory, TaskType } from '../enums';

export interface ITask {
  id: string;
  name: string;
  description: string;
  category: TaskCategory;
  type: TaskType;
  handler: string;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ITaskResult {
  success: boolean;
  data: unknown;
  error?: string;
  executionTimeMs: number;
}

export interface ITaskExecutionContext {
  taskId: string;
  workflowRunId: string;
  config: Record<string, unknown>;
  previousResults: ITaskResult[];
}
