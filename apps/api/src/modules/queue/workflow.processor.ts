import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bullmq';
import {
  WorkflowRun,
  WorkflowRunStatus,
  TaskRun,
  TaskRunStatus,
} from '../../database/entities';
import { TaskRegistry, TaskResult } from '../tasks/task-registry';
import { LogsService } from '../logs/logs.service';

@Processor('workflow')
export class WorkflowProcessor extends WorkerHost {
  constructor(
    private readonly taskRegistry: TaskRegistry,
    @InjectRepository(WorkflowRun)
    private readonly workflowRunRepo: Repository<WorkflowRun>,
    @InjectRepository(TaskRun)
    private readonly taskRunRepo: Repository<TaskRun>,
    private readonly logsService: LogsService,
  ) {
    super();
  }

  async process(job: Job<{ workflowRunId: string }>): Promise<void> {
    const { workflowRunId } = job.data;

    const workflowRun = await this.workflowRunRepo.findOne({
      where: { id: workflowRunId },
      relations: ['taskRuns', 'taskRuns.task'],
    });

    if (!workflowRun) {
      await this.logsService.error(
        `Workflow run ${workflowRunId} not found`,
        'WorkflowProcessor',
      );
      return;
    }

    workflowRun.status = WorkflowRunStatus.RUNNING;
    workflowRun.startedAt = new Date();
    await this.workflowRunRepo.save(workflowRun);

    const taskRuns = [...workflowRun.taskRuns].sort(
      (a, b) => a.sequence - b.sequence,
    );

    const previousResults: TaskResult[] = [];
    let allSucceeded = true;

    for (const taskRun of taskRuns) {
      taskRun.status = TaskRunStatus.RUNNING;
      taskRun.startedAt = new Date();
      await this.taskRunRepo.save(taskRun);

      const handler = this.taskRegistry.get(taskRun.task.handler);

      if (!handler) {
        taskRun.status = TaskRunStatus.FAILED;
        taskRun.response = { error: `Handler '${taskRun.task.handler}' not found` };
        taskRun.completedAt = new Date();
        await this.taskRunRepo.save(taskRun);

        await this.logsService.error(
          `Handler '${taskRun.task.handler}' not found for task ${taskRun.taskId}`,
          'WorkflowProcessor',
        );

        allSucceeded = false;

        const remaining = taskRuns.filter(
          (tr) => tr.status === TaskRunStatus.PENDING,
        );
        for (const r of remaining) {
          r.status = TaskRunStatus.SKIPPED;
          await this.taskRunRepo.save(r);
        }
        break;
      }

      try {
        const result = await handler.execute({
          taskId: taskRun.taskId,
          workflowRunId,
          config: taskRun.task.config || {},
          previousResults,
        });

        taskRun.response = result;
        taskRun.status = result.success
          ? TaskRunStatus.COMPLETED
          : TaskRunStatus.FAILED;
        taskRun.completedAt = new Date();
        await this.taskRunRepo.save(taskRun);

        previousResults.push(result);

        await this.logsService.info(
          `Task ${taskRun.task.name} ${result.success ? 'completed' : 'failed'} in ${result.executionTimeMs}ms`,
          'WorkflowProcessor',
          { taskId: taskRun.taskId, handler: taskRun.task.handler },
        );

        if (!result.success) {
          allSucceeded = false;

          const remaining = taskRuns.filter(
            (tr) => tr.status === TaskRunStatus.PENDING,
          );
          for (const r of remaining) {
            r.status = TaskRunStatus.SKIPPED;
            await this.taskRunRepo.save(r);
          }
          break;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';

        taskRun.status = TaskRunStatus.FAILED;
        taskRun.response = { error: errorMessage };
        taskRun.completedAt = new Date();
        await this.taskRunRepo.save(taskRun);

        await this.logsService.error(
          `Task ${taskRun.task.name} threw an error: ${errorMessage}`,
          'WorkflowProcessor',
        );

        allSucceeded = false;

        const remaining = taskRuns.filter(
          (tr) => tr.status === TaskRunStatus.PENDING,
        );
        for (const r of remaining) {
          r.status = TaskRunStatus.SKIPPED;
          await this.taskRunRepo.save(r);
        }
        break;
      }
    }

    workflowRun.status = allSucceeded
      ? WorkflowRunStatus.COMPLETED
      : WorkflowRunStatus.FAILED;
    workflowRun.completedAt = new Date();
    await this.workflowRunRepo.save(workflowRun);

    await this.logsService.info(
      `Workflow run ${workflowRunId} ${workflowRun.status}`,
      'WorkflowProcessor',
    );
  }
}
