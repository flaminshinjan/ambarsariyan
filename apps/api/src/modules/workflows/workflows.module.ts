import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import {
  Workflow,
  WorkflowTask,
  WorkflowRun,
  TaskRun,
} from '../../database/entities';
import { WorkflowsService } from './workflows.service';
import { WorkflowsController } from './workflows.controller';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workflow, WorkflowTask, WorkflowRun, TaskRun]),
    BullModule.registerQueue({ name: 'workflow' }),
    TasksModule,
  ],
  controllers: [WorkflowsController],
  providers: [WorkflowsService],
  exports: [WorkflowsService],
})
export class WorkflowsModule {}
