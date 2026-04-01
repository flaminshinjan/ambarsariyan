import { Injectable } from '@nestjs/common';

export interface TaskExecutionContext {
  taskId: string;
  workflowRunId: string;
  config: Record<string, unknown>;
  previousResults: TaskResult[];
}

export interface TaskResult {
  success: boolean;
  data: unknown;
  error?: string;
  executionTimeMs: number;
}

export interface TaskHandler {
  execute(context: TaskExecutionContext): Promise<TaskResult>;
}

@Injectable()
export class TaskRegistry {
  private handlers = new Map<string, TaskHandler>();

  register(key: string, handler: TaskHandler): void {
    this.handlers.set(key, handler);
  }

  get(key: string): TaskHandler | undefined {
    return this.handlers.get(key);
  }

  getAvailableHandlers(): string[] {
    return Array.from(this.handlers.keys());
  }

  has(key: string): boolean {
    return this.handlers.has(key);
  }
}
