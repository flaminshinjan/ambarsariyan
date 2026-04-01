import { LogLevel } from '../enums';

export interface ILogEntry {
  id: string;
  level: LogLevel;
  message: string;
  context: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

export interface ILogQuery {
  level?: LogLevel;
  context?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}
