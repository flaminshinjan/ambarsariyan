export enum TaskCategory {
  GMAIL = 'gmail',
  HTTP = 'http',
  CUSTOM = 'custom',
}

export enum TaskType {
  BUILTIN = 'builtin',
  CUSTOM = 'custom',
}

export enum WorkflowRunStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum TaskRunStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug',
}
