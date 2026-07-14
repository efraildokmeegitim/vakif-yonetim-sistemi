import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CurrentAccount } from './entities/current-account.entity';
import { CurrentAccountType } from './entities/current-account-type.entity';
import { CurrentAccountDocument } from './entities/current-account-document.entity';
import { AidLimit } from './entities/aid-limit.entity';
import { CurrentAccountCreatedEvent } from './events/current-account.events';
import { SystemAccountTypes } from '../../common/constants/account-types.constant';
import { CreateCurrentAccountDto, UpdateCurrentAccountDto } from './dto/current-account.dto';

@Injectable()
export class CurrentAccountsService implements OnModuleInit {
  constructor(
    @InjectRepository(CurrentAccount)
    private readonly currentAccountRepository: Repository<CurrentAccount>,
    @InjectRepository(CurrentAccountType)
    private readonly currentAccountTypeRepository: Repository<CurrentAccountType>,
    @InjectRepository(CurrentAccountDocument)
    private readonly docRepo: Repository<CurrentAccountDocument>,
    @InjectRepository(AidLimit)
    private readonly aidLimitRepo: Repository<AidLimit>,
    private eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit() {
    const defaultTypes = Object.values(SystemAccountTypes);
    for (const name of defaultTypes) {
      const exists = await this.currentAccountTypeRepository.findOne({ where: { name } });
      if (!exists) {
        await this.currentAccountTypeRepository.save({ name });
      }
    }
  }

  async create(createCurrentAccountDto: CreateCurrentAccountDto): Promise<CurrentAccount> {
    console.log('--- DEBUG CREATE ACCOUNT DTO ---', createCurrentAccountDto);
    const { typeIds, ...rest } = createCurrentAccountDto;
    const currentAccount = this.currentAccountRepository.create(rest);
    
    if (typeIds && typeIds.length > 0) {
      currentAccount.types = await this.currentAccountTypeRepository.findBy({ id: In(typeIds) });
    }
    
    const savedAccount = await this.currentAccountRepository.save(currentAccount);

    // Emit event for professional decoupling
    this.eventEmitter.emit(
      'current-account.created',
      new CurrentAccountCreatedEvent(savedAccount)
    );

    return savedAccount;
  }

  async findAll(type?: string, isActive?: boolean): Promise<CurrentAccount[]> {
    const query = this.currentAccountRepository.createQueryBuilder('ca');
    
    if (type) {
      query.andWhere('ca.type = :type', { type });
    }
    
    if (isActive !== undefined) {
      query.andWhere('ca.isActive = :isActive', { isActive });
    }
    
    
    query.leftJoinAndSelect('ca.types', 'type');
    query.orderBy('ca.name', 'ASC');
    
    return await query.getMany();
  }

  async findOne(id: number): Promise<CurrentAccount> {
    const account = await this.currentAccountRepository.findOne({ 
      where: { id },
      relations: { types: true, aidLimits: true }
    });
    if (!account) {
      throw new NotFoundException(`Cari Hesap #${id} bulunamadı`);
    }
    return account;
  }

  async update(id: number, updateCurrentAccountDto: UpdateCurrentAccountDto): Promise<CurrentAccount> {
    const account = await this.findOne(id);
    const { typeIds, ...rest } = updateCurrentAccountDto;
    
    this.currentAccountRepository.merge(account, rest);
    
    if (typeIds !== undefined) {
      if (typeIds.length > 0) {
        account.types = await this.currentAccountTypeRepository.findBy({ id: In(typeIds) });
      } else {
        account.types = [];
      }
    }
    
    return await this.currentAccountRepository.save(account);
  }

  async remove(id: number): Promise<void> {
    const account = await this.findOne(id);
    await this.currentAccountRepository.remove(account);
  }

  // --- Documents ---
  async getDocuments(currentAccountId: number) {
    return this.docRepo.find({ where: { currentAccountId }, order: { uploadDate: 'DESC' } });
  }

  async addDocument(currentAccountId: number, data: any) {
    const doc = this.docRepo.create({ ...data, currentAccountId });
    return this.docRepo.save(doc);
  }

  async removeDocument(id: number) {
    return this.docRepo.delete(id);
  }

  // --- Aid Limits ---
  async getAidLimits(currentAccountId: number) {
    return this.aidLimitRepo.find({ where: { currentAccountId } });
  }

  async addAidLimit(currentAccountId: number, data: any) {
    const limit = this.aidLimitRepo.create({ ...data, currentAccountId });
    return this.aidLimitRepo.save(limit);
  }

  async updateAidLimit(id: number, data: any) {
    await this.aidLimitRepo.update(id, data);
    return this.aidLimitRepo.findOneBy({ id });
  }

  async removeAidLimit(id: number) {
    return this.aidLimitRepo.delete(id);
  }
}
