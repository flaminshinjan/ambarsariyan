import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowRun, TaskRun } from '../../database/entities';
import { WorkflowProcessor } from './workflow.processor';
import { TasksModule } from '../tasks/tasks.module';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        },
      }),
    }),
    TypeOrmModule.forFeature([WorkflowRun, TaskRun]),
    TasksModule,
    LogsModule,
  ],
  providers: [WorkflowProcessor],
})
export class QueueModule {}
