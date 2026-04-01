import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../../database/entities';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TaskRegistry } from './task-registry';
import { GeminiModule } from '../gemini/gemini.module';
import { GeminiService } from '../gemini/gemini.service';
import { GmailModule } from '../gmail/gmail.module';
import { GmailService } from '../gmail/gmail.service';
import {
  ReadGmailHandler,
  SendGmailHandler,
  GmailMorningPulseHandler,
  CustomHttpHandler,
} from './handlers';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), GeminiModule, GmailModule],
  controllers: [TasksController],
  providers: [TasksService, TaskRegistry],
  exports: [TasksService, TaskRegistry],
})
export class TasksModule implements OnModuleInit {
  constructor(
    private readonly taskRegistry: TaskRegistry,
    private readonly geminiService: GeminiService,
    private readonly gmailService: GmailService,
  ) {}

  onModuleInit() {
    this.taskRegistry.register('read_gmail', new ReadGmailHandler(this.gmailService));
    this.taskRegistry.register('send_gmail', new SendGmailHandler(this.gmailService));
    this.taskRegistry.register(
      'gmail_morning_pulse',
      new GmailMorningPulseHandler(this.geminiService, this.gmailService),
    );
    this.taskRegistry.register('custom_http', new CustomHttpHandler());
  }
}
