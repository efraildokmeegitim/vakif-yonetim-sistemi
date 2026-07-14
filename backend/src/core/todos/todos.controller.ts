import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TodosService } from './todos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.todosService.findAll(req.user.id);
  }

  @Post()
  create(@Request() req: any, @Body() body: { title: string }) {
    return this.todosService.create(req.user.id, body.title);
  }

  @Patch(':id/toggle')
  toggleComplete(@Request() req: any, @Param('id') id: string) {
    return this.todosService.toggleComplete(req.user.id, +id);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.todosService.remove(req.user.id, +id);
  }
}
