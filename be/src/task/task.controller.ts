import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import { Request } from 'express';
import { TaskStatus } from './enum/task-status.enum';
import { TaskPriority } from './enum/task-priority.enum';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  //CREATE
  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createTaskDto: CreateTaskDto, @Req() req: Request) {
    return this.taskService.createTask(createTaskDto, req);
  }

  //EDIT
  @Patch(':id') // Sử dụng PATCH để cập nhật task
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  update(
    @Param('id') id: string, // Nhận id của task từ URL
    @Body() updateTaskDto: UpdateTaskDto, // Nhận dữ liệu cần cập nhật từ body
  ) {
    return this.taskService.updateTask(id, updateTaskDto); // Gọi service để cập nhật task
  }

  //DELETE
  @Delete(':id') // Sử dụng DELETE để xóa task
  @UseGuards(AuthGuard) // Xác thực người dùng
  @ApiBearerAuth()
  async delete(@Param('id') id: string) {
    return this.taskService.deleteTask(id); // Gọi service để xóa task
  }

  // GET LIST OF TASKS
  @Get()
  @UseGuards(AuthGuard) // Kiểm tra quyền truy cập
  @ApiBearerAuth() // Đảm bảo API có token xác thực
  async getTasks(
    @Req() req: Request,
    @Query('status') status?: TaskStatus, // Lọc theo status
    @Query('priority') priority?: TaskPriority, // Lọc theo priority
    @Query('search') search?: string, // Tìm kiếm task
    @Query('sortBy') sortBy?: string, // Sắp xếp theo trường
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc', // Thứ tự sắp xếp
  ) {
    return this.taskService.getTasks(
      req,
      status,
      priority,
      search,
      sortBy,
      sortOrder,
    );
  }
}
