// create-task.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { TaskPriority } from '../enum/task-priority.enum';
import { TaskStatus } from '../enum/task-status.enum';

export class CreateTaskDto {
  @ApiProperty({ description: 'Task name' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 255)
  taskName: string;

  @ApiProperty({ description: 'Task description' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Task priority (High, Medium, Low)' })
  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @ApiProperty({ description: 'The task start date' })
  @IsOptional()
  @IsDateString()
  startDate: Date;

  @ApiProperty({ description: 'The task end date' })
  @IsOptional()
  @IsDateString()
  endDate: Date;

  @ApiProperty({
    description: 'Task status (Todo, In Progress, Completed, Expired)',
  })
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsBoolean()
  @IsOptional() // Không bắt buộc truyền, mặc định là false
  isScheduled?: boolean = false;
}
