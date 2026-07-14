import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private readonly todosRepository: Repository<Todo>,
  ) {}

  async findAll(userId: number): Promise<Todo[]> {
    return this.todosRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(userId: number, title: string): Promise<Todo> {
    const todo = this.todosRepository.create({
      userId,
      title,
      isCompleted: false,
    });
    return this.todosRepository.save(todo);
  }

  async toggleComplete(userId: number, id: number): Promise<Todo> {
    const todo = await this.todosRepository.findOne({ where: { id, userId } });
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }
    todo.isCompleted = !todo.isCompleted;
    return this.todosRepository.save(todo);
  }

  async remove(userId: number, id: number): Promise<void> {
    const todo = await this.todosRepository.findOne({ where: { id, userId } });
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }
    await this.todosRepository.remove(todo);
  }
}
