import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event) private eventRepo: Repository<Event>,
  ) {}

  create(createEventDto: CreateEventDto) {
    const event = this.eventRepo.create(createEventDto);
    return this.eventRepo.save(event);
  }

  findAll() {
    return this.eventRepo.find();
  }

  async findOne(id: number) {
    const event = await this.eventRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Etkinlik bulunamadı');
    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    await this.eventRepo.update(id, updateEventDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.eventRepo.delete(id);
    return { success: true };
  }
}
