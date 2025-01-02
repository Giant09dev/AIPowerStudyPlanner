// task.module.ts
import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { UserModule } from 'src/user/user.module'; // Import UserModule
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './entities/task.schema';

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
  ], // Đảm bảo UserModule được import
  providers: [TaskService],
  controllers: [TaskController],
})
export class TaskModule {}
