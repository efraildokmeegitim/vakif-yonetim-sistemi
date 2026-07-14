import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CostCenter } from './entities/cost-center.entity';

@Injectable()
export class CostCentersService {
  constructor(
    @InjectRepository(CostCenter)
    private readonly repo: Repository<CostCenter>,
  ) {}

  async create(data: Partial<CostCenter>): Promise<CostCenter> {
    const costCenter = this.repo.create(data);
    return this.repo.save(costCenter);
  }

  async findAll(): Promise<CostCenter[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<CostCenter> {
    const costCenter = await this.repo.findOne({ where: { id } });
    if (!costCenter) throw new NotFoundException('Cost Center not found');
    return costCenter;
  }

  async update(id: number, data: any): Promise<CostCenter> {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const costCenter = await this.findOne(id);
    await this.repo.remove(costCenter);
  }
}
