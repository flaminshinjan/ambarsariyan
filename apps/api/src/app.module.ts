import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { LogsModule } from './modules/logs/logs.module';
import { QueueModule } from './modules/queue/queue.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { LlmModule } from './modules/llm/llm.module';
import { GoogleAuthModule } from './modules/google-auth/google-auth.module';
import { GmailModule } from './modules/gmail/gmail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [join(__dirname, '..', '..', '..', '.env'), '.env'],
    }),
    DatabaseModule,
    GoogleAuthModule,
    GmailModule,
    TasksModule,
    WorkflowsModule,
    LogsModule,
    QueueModule,
    MetricsModule,
    LlmModule,
  ],
})
export class AppModule {}
