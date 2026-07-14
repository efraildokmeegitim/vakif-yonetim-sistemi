import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly repo: Repository<Warehouse>,
  ) {}

  async create(createDto: any) {
    const existing = await this.repo.findOne({ where: { name: createDto.name } });
    if (existing) {
      throw new BadRequestException(`'${createDto.name}' adında bir depo zaten mevcut.`);
    }
    const warehouse = this.repo.create(createDto as object);
    return this.repo.save(warehouse);
  }

  findAll() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  async update(id: number, updateDto: any) {
    if (updateDto.name) {
      const existing = await this.repo.findOne({ where: { name: updateDto.name } });
      if (existing && existing.id !== id) {
        throw new BadRequestException(`'${updateDto.name}' adında bir depo zaten mevcut.`);
      }
    }
    await this.repo.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    // TODO: When Stock module is ported, check if warehouse has active stock before deleting.
    await this.repo.delete(id);
  }
}
