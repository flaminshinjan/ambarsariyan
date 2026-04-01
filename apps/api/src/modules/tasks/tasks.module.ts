import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../../database/entities';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TaskRegistry } from './task-registry';
import { GeminiModule } from '../gemini/gemini.module';
import { GeminiService } from '../gemini/gemini.service';
import {
  ReadGmailHandler,
  SendGmailHandler,
  GmailMorningPulseHandler,
  CustomHttpHandler,
} from './handlers';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), GeminiModule],
  controllers: [TasksController],
  providers: [TasksService, TaskRegistry],
  exports: [TasksService, TaskRegistry],
})
export class TasksModule implements OnModuleInit {
  constructor(
    private readonly taskRegistry: TaskRegistry,
    private readonly geminiService: GeminiService,
  ) {}

  onModuleInit() {
    this.taskRegistry.register('read_gmail', new ReadGmailHandler());
    this.taskRegistry.register('send_gmail', new SendGmailHandler());
    this.taskRegistry.register(
      'gmail_morning_pulse',
      new GmailMorningPulseHandler(this.geminiService),
    );
    this.taskRegistry.register('custom_http', new CustomHttpHandler());
  }
}
