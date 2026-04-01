import { Controller, Get, Query } from '@nestjs/common';
import { LogsService } from './logs.service';
import { LogLevel } from '../../database/entities';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  findAll(
    @Query('level') level?: LogLevel,
    @Query('context') context?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.logsService.findAll({
      level,
      context,
      from,
      to,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('stats')
  getStats() {
    return this.logsService.getStats();
  }
}
