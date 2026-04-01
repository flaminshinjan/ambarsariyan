import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsObject,
} from 'class-validator';
import { TaskCategory, TaskType } from '../../../database/entities';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskCategory)
  category: TaskCategory;

  @IsEnum(TaskType)
  @IsOptional()
  type?: TaskType;

  @IsString()
  @IsNotEmpty()
  handler: string;

  @IsObject()
  @IsOptional()
  config?: Record<string, unknown>;
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskCategory)
  @IsOptional()
  category?: TaskCategory;

  @IsEnum(TaskType)
  @IsOptional()
  type?: TaskType;

  @IsString()
  @IsOptional()
  handler?: string;

  @IsObject()
  @IsOptional()
  config?: Record<string, unknown>;
}
