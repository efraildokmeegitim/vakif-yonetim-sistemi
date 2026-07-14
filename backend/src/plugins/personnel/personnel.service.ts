import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Personnel } from './entities/personnel.entity';
import { Payroll } from './entities/payroll.entity';
import { PersonnelLeave } from './entities/personnel-leave.entity';
import { PersonnelFile } from './entities/personnel-file.entity';

@Injectable()
export class PersonnelService {
  constructor(
    @InjectRepository(Personnel)
    private readonly repo: Repository<Personnel>,
    @InjectRepository(Payroll)
    private readonly payrollRepo: Repository<Payroll>,
    @InjectRepository(PersonnelLeave)
    private readonly leaveRepo: Repository<PersonnelLeave>,
    @InjectRepository(PersonnelFile)
    private readonly fileRepo: Repository<PersonnelFile>,
  ) {}

  create(createPersonnelDto: any) {
    if (createPersonnelDto.hireDate === '') createPersonnelDto.hireDate = null;
    if (createPersonnelDto.contractEndDate === '') createPersonnelDto.contractEndDate = null;
    const p = this.repo.create(createPersonnelDto);
    return this.repo.save(p);
  }

  findAll() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  update(id: number, updatePersonnelDto: any) {
    if (updatePersonnelDto.hireDate === '') updatePersonnelDto.hireDate = null;
    if (updatePersonnelDto.contractEndDate === '') updatePersonnelDto.contractEndDate = null;
    return this.repo.update(id, updatePersonnelDto);
  }

  remove(id: number) {
    return this.repo.update(id, { isActive: false });
  }

  // --- Payroll ---
  async getPayrolls(personnelId: number) {
    return this.payrollRepo.find({ where: { personnelId }, order: { period: 'DESC' } });
  }
  async addPayroll(personnelId: number, data: any) {
    const p = this.payrollRepo.create({ ...data, personnelId });
    return this.payrollRepo.save(p);
  }
  async removePayroll(id: number) {
    return this.payrollRepo.delete(id);
  }

  // --- Leaves ---
  async getLeaves(personnelId: number) {
    return this.leaveRepo.find({ where: { personnelId }, order: { startDate: 'DESC' } });
  }
  async addLeave(personnelId: number, data: any) {
    const l = this.leaveRepo.create({ ...data, personnelId });
    return this.leaveRepo.save(l);
  }
  async removeLeave(id: number) {
    return this.leaveRepo.delete(id);
  }

  // --- Files ---
  async getFiles(personnelId: number) {
    return this.fileRepo.find({ where: { personnelId }, order: { uploadDate: 'DESC' } });
  }
  async addFile(personnelId: number, data: any) {
    const f = this.fileRepo.create({ ...data, personnelId });
    return this.fileRepo.save(f);
  }
  async removeFile(id: number) {
    return this.fileRepo.delete(id);
  }
}
