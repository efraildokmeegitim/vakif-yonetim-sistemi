import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { CreateTaskDto, CreateTaskAdvanceDto, SettleTaskDto } from './dto/tasks.dto';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll() {
    const tasks = await this.tasksService.getTasks();
    const stats = await this.tasksService.getTaskStats();
    return { tasks, stats };
  }

  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.createTask(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.getTaskDetail(+id);
  }

  @Post(':id/advance')
  advance(@Param('id') id: string, @Body() dto: CreateTaskAdvanceDto) {
    return this.tasksService.addAdvance(+id, dto);
  }

  @Post(':id/settle')
  settle(@Param('id') id: string, @Body() dto: SettleTaskDto) {
    return this.tasksService.settleTask(+id, dto);
  }
}
