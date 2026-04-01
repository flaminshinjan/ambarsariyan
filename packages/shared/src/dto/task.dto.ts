import { TaskCategory, TaskType } from '../enums';

export interface CreateTaskDto {
  name: string;
  description: string;
  category: TaskCategory;
  type: TaskType;
  handler: string;
  config?: Record<string, unknown>;
}

export interface UpdateTaskDto {
  name?: string;
  description?: string;
  category?: TaskCategory;
  config?: Record<string, unknown>;
}
