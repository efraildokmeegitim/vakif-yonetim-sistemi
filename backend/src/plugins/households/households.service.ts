import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Household } from './entities/household.entity';
import { HouseholdMember } from './entities/household-member.entity';
import { HouseholdFinancial } from './entities/household-financial.entity';
import { HealthCondition } from './entities/health-condition.entity';
import { HouseholdNeed } from './entities/household-need.entity';
import { ExternalAid } from './entities/external-aid.entity';

@Injectable()
export class HouseholdsService {
  constructor(
    @InjectRepository(Household) private householdRepo: Repository<Household>,
    @InjectRepository(HouseholdMember) private memberRepo: Repository<HouseholdMember>,
    @InjectRepository(HouseholdFinancial) private financialRepo: Repository<HouseholdFinancial>,
    @InjectRepository(HealthCondition) private healthRepo: Repository<HealthCondition>,
    @InjectRepository(HouseholdNeed) private needRepo: Repository<HouseholdNeed>,
    @InjectRepository(ExternalAid) private aidRepo: Repository<ExternalAid>,
    private dataSource: DataSource
  ) {}

  async findAll(query: any) {
    const qb = this.householdRepo.createQueryBuilder('h')
      .where('h.is_active = :isActive', { isActive: query.archived === 'true' ? false : true });

    if (query.search) {
      qb.andWhere('h.family_name LIKE :search', { search: `%${query.search}%` });
    }

    qb.orderBy('h.created_at', 'DESC');
    const households = await qb.getMany();

    const statsResult = await this.dataSource.query(`
      SELECT
        COUNT(*) as total_households,
        SUM(CASE WHEN status = 'İncelemede' AND is_active = 1 THEN 1 ELSE 0 END) as pending_households,
        SUM(CASE WHEN status = 'Onaylandı' AND is_active = 1 THEN 1 ELSE 0 END) as approved_households
      FROM households
    `);

    return { households, stats: statsResult[0] };
  }

  async create(data: any) {
    const household = this.householdRepo.create(data);
    return this.householdRepo.save(household);
  }

  async findOne(id: number) {
    const household = await this.householdRepo.findOneBy({ id });
    if (!household) throw new NotFoundException('Hane bulunamadı');

    const members = await this.memberRepo.find({ where: { householdId: id } });
    const financials = await this.financialRepo.find({ where: { householdId: id } });
    const healthConditions = await this.healthRepo.find({ where: { householdId: id } });
    const needs = await this.needRepo.find({ where: { householdId: id } });
    const aids = await this.aidRepo.find({ where: { householdId: id } });

    return { household, members, financials, healthConditions, needs, aids };
  }

  async getByCurrentAccount(caId: number) {
    // 1. Fetch current account social fields directly from current_accounts table
    const [[accountData]] = await this.dataSource.query(`
      SELECT job, work_status, education_status, housing_type, housing_status, social_security_status, nationality, marital_status
      FROM current_accounts 
      WHERE id = ?
    `, [caId]);

    // 2. Fetch all related tables using beneficiary_ca_id
    const members = await this.dataSource.query('SELECT * FROM household_members WHERE beneficiary_ca_id = ?', [caId]);
    const financials = await this.dataSource.query('SELECT * FROM household_financials WHERE beneficiary_ca_id = ?', [caId]);
    const healthConditions = await this.dataSource.query('SELECT * FROM health_conditions WHERE beneficiary_ca_id = ?', [caId]);
    const needs = await this.dataSource.query('SELECT * FROM household_needs WHERE beneficiary_ca_id = ?', [caId]);
    const aids = await this.dataSource.query('SELECT * FROM external_aids WHERE beneficiary_ca_id = ?', [caId]);

    return { 
      socialData: accountData || {}, 
      members, 
      financials, 
      healthConditions, 
      needs, 
      aids 
    };
  }

  async updateStatus(id: number, status: string) {
    await this.householdRepo.update(id, { status });
    return { success: true };
  }

  async archive(id: number) {
    await this.householdRepo.update(id, { isActive: false });
    return { success: true };
  }

  async updatePersonalInfo(id: number, data: any) {
    // Sadece Household entity'sine ait alanları güncelliyoruz.
    const allowedFields = [
      'familyName', 'fatherName', 'motherName', 'birthPlace', 'birthDate',
      'gender', 'nationality', 'maritalStatus', 'educationStatus', 'job',
      'workStatus', 'housingType', 'socialSecurityStatus', 'isZakatEligible',
      'contactNumber', 'address', 'city', 'district', 'notes'
    ];
    
    const updateData: any = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        updateData[key] = data[key] === '' ? null : data[key];
        // Boolean conversion for checkbox
        if (key === 'isZakatEligible') {
          updateData[key] = data[key] === true || data[key] === 'true' || data[key] === '1';
        }
      }
    }
    
    await this.householdRepo.update(id, updateData);
    return this.findOne(id);
  }

  async getAidHistory(householdId: number) {
    const history = await this.dataSource.query(`
      SELECT st.transaction_date, st.quantity, 
             si.name as item_name, si.unit,
             w.name as warehouse_name
      FROM stock_transactions st
      LEFT JOIN stock_items si ON st.item_id = si.id
      LEFT JOIN warehouses w ON st.warehouse_id = w.id
      WHERE st.household_id = ? AND st.transaction_type = 'Çıkış (Yardım)'
      ORDER BY st.transaction_date DESC
    `, [householdId]);
    return history;
  }

  // --- Members ---
  async addMember(householdId: number, data: any) {
    const member = this.memberRepo.create({ ...data, householdId });
    return this.memberRepo.save(member);
  }
  async removeMember(id: number) {
    return this.memberRepo.delete(id);
  }

  // --- Financials ---
  async addFinancial(householdId: number, data: any) {
    const fin = this.financialRepo.create({ ...data, householdId });
    return this.financialRepo.save(fin);
  }
  async removeFinancial(id: number) {
    return this.financialRepo.delete(id);
  }

  // --- Needs ---
  async addNeed(householdId: number, data: any) {
    const need = this.needRepo.create({ ...data, householdId });
    return this.needRepo.save(need);
  }
  async removeNeed(id: number) {
    return this.needRepo.delete(id);
  }

  // --- External Aids ---
  async addExternalAid(householdId: number, data: any) {
    const aid = this.aidRepo.create({ ...data, householdId });
    return this.aidRepo.save(aid);
  }
  async removeExternalAid(id: number) {
    return this.aidRepo.delete(id);
  }
}
