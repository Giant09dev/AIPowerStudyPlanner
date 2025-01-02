import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TaskStatus } from '../enum/task-status.enum'; // Giả sử TaskStatus đã được khai báo
import { TaskPriority } from '../enum/task-priority.enum'; // Giả sử TaskStatus đã được khai báo

@Schema()
export class Task extends Document {
  @Prop({ required: true })
  taskName: string;

  @Prop()
  description: string;

  @Prop({ enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ enum: TaskPriority, default: TaskPriority.LOW })
  priority: TaskPriority;

  // trường uid để lưu ID của người dùng từ Firebase
  @Prop({ required: true })
  uid: string;

  // trường boolean để chỉ trạng thái trên calendar
  @Prop({ default: false }) // Mặc định là chưa có trên calendar
  isScheduled: boolean;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
