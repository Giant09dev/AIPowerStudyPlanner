import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './entities/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { Request } from 'express'; // Import Request type
import { UpdateTaskDto } from './dto/update-task.dto';
import { UserService } from 'src/user/user.service';
import { TaskStatus } from './enum/task-status.enum';
import { TaskPriority } from './enum/task-priority.enum';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    private readonly userService: UserService,
  ) {}

  async createTask(createTaskDto: CreateTaskDto, req: Request): Promise<Task> {
    // Lấy UID từ token
    const uid = await this.userService.getUID(req);

    if (!uid) {
      throw new Error('Invalid UID or Unable to verify token');
    }

    // Tạo một task mới từ createTaskDto và gán thêm UID
    const newTask = new this.taskModel({
      ...createTaskDto,
      uid: uid, // Liên kết Task với UID của người dùng
    });

    try {
      // Lưu task vào MongoDB
      return await newTask.save();
    } catch (error) {
      // Xử lý lỗi khi lưu task vào MongoDB
      throw new Error('Error creating task: ' + error.message);
    }
  }

  async updateTask(
    id: string, // id của task cần cập nhật
    updateTaskDto: UpdateTaskDto, // Dữ liệu cập nhật
  ): Promise<Task> {
    const { startDate, endDate, isScheduled } = updateTaskDto;

    // Nếu task được cập nhật thời gian và đã lên lịch
    if (isScheduled && startDate && new Date(startDate) < new Date()) {
      updateTaskDto.status = TaskStatus.EXPIRED; // Task hết hạn nếu ở quá khứ
    }

    return this.taskModel.findByIdAndUpdate(id, updateTaskDto, { new: true });
  }

  async deleteTask(id: string): Promise<{ message: string }> {
    const task = await this.taskModel.findByIdAndDelete(id);
    if (!task) {
      throw new Error('Task not found'); // Nếu không tìm thấy task
    }
    return { message: 'Task deleted successfully' }; // Trả về thông báo delete thành công
  }

  // Phương thức để lấy danh sách tasks với các tiêu chí lọc và sắp xếp
  async getTasks(
    req: Request,
    status?: TaskStatus, // Lọc theo trạng thái
    priority?: TaskPriority, // Lọc theo độ ưu tiên
    search?: string, // Tìm kiếm theo tên hoặc mô tả task
    sortBy?: string, // Sắp xếp theo thuộc tính nào
    sortOrder: 'asc' | 'desc' = 'asc', // Thứ tự sắp xếp
  ) {
    const query: any = {};

    const uid = await this.userService.getUID(req);

    if (uid) {
      query.uid = uid;
    }

    // Thêm điều kiện lọc vào query nếu có
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    if (search) {
      query.$or = [
        { taskName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]; // Tìm kiếm trong tên hoặc mô tả task
    }

    // Lọc và sắp xếp tasks
    const sort: any = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1; // Sắp xếp theo trường và thứ tự
    }

    return this.taskModel.find(query).sort(sort);
  }
}
