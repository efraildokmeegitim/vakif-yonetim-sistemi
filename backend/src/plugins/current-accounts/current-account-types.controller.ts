import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrentAccountType } from './entities/current-account-type.entity';

@Controller('current-account-types')
export class CurrentAccountTypesController {
  constructor(
    @InjectRepository(CurrentAccountType)
    private readonly currentAccountTypeRepository: Repository<CurrentAccountType>,
  ) {}

  @Get()
  async findAll() {
    return await this.currentAccountTypeRepository.find({ order: { name: 'ASC' } });
  }
}
