import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { LogEntry, LogLevel } from '../../database/entities';

interface LogQuery {
  level?: LogLevel;
  context?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(LogEntry)
    private readonly logRepo: Repository<LogEntry>,
  ) {}

  async findAll(query: LogQuery): Promise<{ data: LogEntry[]; total: number }> {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<LogEntry> = {};

    if (query.level) {
      where.level = query.level;
    }

    if (query.context) {
      where.context = query.context;
    }

    if (query.from && query.to) {
      where.timestamp = Between(new Date(query.from), new Date(query.to));
    }

    const [data, total] = await this.logRepo.findAndCount({
      where,
      order: { timestamp: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total };
  }

  async getStats(): Promise<Record<string, number>> {
    const levels = Object.values(LogLevel);
    const stats: Record<string, number> = {};

    for (const level of levels) {
      stats[level] = await this.logRepo.countBy({ level });
    }

    return stats;
  }

  async create(
    level: LogLevel,
    message: string,
    context = '',
    metadata: Record<string, unknown> = {},
  ): Promise<LogEntry> {
    const entry = this.logRepo.create({ level, message, context, metadata });
    return this.logRepo.save(entry);
  }

  async info(
    message: string,
    context = '',
    metadata: Record<string, unknown> = {},
  ): Promise<LogEntry> {
    return this.create(LogLevel.INFO, message, context, metadata);
  }

  async warn(
    message: string,
    context = '',
    metadata: Record<string, unknown> = {},
  ): Promise<LogEntry> {
    return this.create(LogLevel.WARN, message, context, metadata);
  }

  async error(
    message: string,
    context = '',
    metadata: Record<string, unknown> = {},
  ): Promise<LogEntry> {
    return this.create(LogLevel.ERROR, message, context, metadata);
  }

  async debug(
    message: string,
    context = '',
    metadata: Record<string, unknown> = {},
  ): Promise<LogEntry> {
    return this.create(LogLevel.DEBUG, message, context, metadata);
  }
}
