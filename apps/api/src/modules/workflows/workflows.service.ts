import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  Workflow,
  WorkflowTask,
  WorkflowRun,
  WorkflowRunStatus,
  TaskRun,
  TaskRunStatus,
} from '../../database/entities';
import { CreateWorkflowDto, UpdateWorkflowDto } from './dto/create-workflow.dto';

@Injectable()
export class WorkflowsService {
  constructor(
    @InjectRepository(Workflow)
    private readonly workflowRepo: Repository<Workflow>,
    @InjectRepository(WorkflowTask)
    private readonly workflowTaskRepo: Repository<WorkflowTask>,
    @InjectRepository(WorkflowRun)
    private readonly workflowRunRepo: Repository<WorkflowRun>,
    @InjectRepository(TaskRun)
    private readonly taskRunRepo: Repository<TaskRun>,
    @InjectQueue('workflow')
    private readonly workflowQueue: Queue,
  ) {}

  async findAll(): Promise<Workflow[]> {
    return this.workflowRepo.find({
      relations: ['tasks', 'tasks.task'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Workflow> {
    const workflow = await this.workflowRepo.findOne({
      where: { id },
      relations: ['tasks', 'tasks.task'],
    });
    if (!workflow) {
      throw new NotFoundException(`Workflow ${id} not found`);
    }
    return workflow;
  }

  async create(dto: CreateWorkflowDto): Promise<Workflow> {
    const workflow = this.workflowRepo.create({
      name: dto.name,
      description: dto.description || '',
    });
    const saved = await this.workflowRepo.save(workflow);

    const workflowTasks = dto.taskIds.map((taskId, index) =>
      this.workflowTaskRepo.create({
        workflowId: saved.id,
        taskId,
        sequence: index,
      }),
    );
    await this.workflowTaskRepo.save(workflowTasks);

    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdateWorkflowDto): Promise<Workflow> {
    const workflow = await this.findOne(id);

    if (dto.name !== undefined) workflow.name = dto.name;
    if (dto.description !== undefined) workflow.description = dto.description;
    await this.workflowRepo.save(workflow);

    if (dto.taskIds) {
      await this.workflowTaskRepo.delete({ workflowId: id });
      const workflowTasks = dto.taskIds.map((taskId, index) =>
        this.workflowTaskRepo.create({
          workflowId: id,
          taskId,
          sequence: index,
        }),
      );
      await this.workflowTaskRepo.save(workflowTasks);
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const workflow = await this.findOne(id);
    await this.workflowRepo.remove(workflow);
  }

  async run(id: string): Promise<WorkflowRun> {
    const workflow = await this.findOne(id);

    const workflowRun = this.workflowRunRepo.create({
      workflowId: workflow.id,
      status: WorkflowRunStatus.PENDING,
    });
    const savedRun = await this.workflowRunRepo.save(workflowRun);

    const sortedTasks = [...workflow.tasks].sort(
      (a, b) => a.sequence - b.sequence,
    );

    const taskRuns = sortedTasks.map((wt) =>
      this.taskRunRepo.create({
        workflowRunId: savedRun.id,
        taskId: wt.taskId,
        sequence: wt.sequence,
        status: TaskRunStatus.PENDING,
      }),
    );
    await this.taskRunRepo.save(taskRuns);

    await this.workflowQueue.add('execute', {
      workflowRunId: savedRun.id,
    });

    return this.getRunStatus(savedRun.id);
  }

  async getRunStatus(runId: string): Promise<WorkflowRun> {
    const run = await this.workflowRunRepo.findOne({
      where: { id: runId },
      relations: ['workflow', 'taskRuns', 'taskRuns.task'],
    });
    if (!run) {
      throw new NotFoundException(`Workflow run ${runId} not found`);
    }
    return run;
  }

  async getRunsByWorkflow(workflowId: string): Promise<WorkflowRun[]> {
    return this.workflowRunRepo.find({
      where: { workflowId },
      relations: ['taskRuns', 'taskRuns.task'],
      order: { createdAt: 'DESC' },
    });
  }
}
