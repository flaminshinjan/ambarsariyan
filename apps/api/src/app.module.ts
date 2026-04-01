import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { LogsModule } from './modules/logs/logs.module';
import { QueueModule } from './modules/queue/queue.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { GeminiModule } from './modules/gemini/gemini.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    TasksModule,
    WorkflowsModule,
    LogsModule,
    QueueModule,
    MetricsModule,
    GeminiModule,
  ],
})
export class AppModule {}
