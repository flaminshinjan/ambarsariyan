import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskCategory, TaskType } from '../../database/entities';
import { CreateTaskDto, UpdateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService implements OnModuleInit {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async findAll(): Promise<Task[]> {
    return this.taskRepo.find();
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepo.findOneBy({ id });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return task;
  }

  async create(dto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepo.create(dto);
    return this.taskRepo.save(task);
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    Object.assign(task, dto);
    return this.taskRepo.save(task);
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepo.remove(task);
  }

  private async seed(): Promise<void> {
    const builtinTasks = [
      {
        name: 'Read Gmail',
        handler: 'read_gmail',
        category: TaskCategory.GMAIL,
        type: TaskType.BUILTIN,
        description: '',
      },
      {
        name: 'Send Gmail',
        handler: 'send_gmail',
        category: TaskCategory.GMAIL,
        type: TaskType.BUILTIN,
        description: '',
      },
      {
        name: 'Gmail Morning Pulse',
        handler: 'gmail_morning_pulse',
        category: TaskCategory.GMAIL,
        type: TaskType.BUILTIN,
        description: '',
      },
    ];

    for (const taskData of builtinTasks) {
      const exists = await this.taskRepo.findOneBy({ handler: taskData.handler });
      if (!exists) {
        await this.taskRepo.save(this.taskRepo.create(taskData));
      }
    }
  }
}
