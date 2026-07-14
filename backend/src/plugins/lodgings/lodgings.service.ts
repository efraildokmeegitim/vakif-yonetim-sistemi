import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Lodging } from './entities/lodging.entity';
import { LodgingAccrual } from './entities/lodging-accrual.entity';
import { LodgingPayment } from './entities/lodging-payment.entity';

@Injectable()
export class LodgingsService {
  constructor(
    @InjectRepository(Lodging) private readonly repo: Repository<Lodging>,
    @InjectRepository(LodgingAccrual) private readonly accrualRepo: Repository<LodgingAccrual>,
    @InjectRepository(LodgingPayment) private readonly paymentRepo: Repository<LodgingPayment>,
    private readonly dataSource: DataSource,
  ) {}

  create(createDto: any) {
    const lodging = this.repo.create(createDto as object);
    return this.repo.save(lodging);
  }

  async findAll(isActive: boolean = true) {
    return this.dataSource.query(`
      SELECT l.*, ca.name as tenantName 
      FROM lodgings l
      LEFT JOIN current_accounts ca ON l.tenant_ca_id = ca.id
      WHERE l.is_active = ?
      ORDER BY l.name ASC
    `, [isActive]);
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  async update(id: number, updateDto: any) {
    await this.repo.update(id, updateDto);
    return this.findOne(id);
  }

  async toggleActive(id: number) {
    const lodging = await this.findOne(id);
    if (lodging) {
      lodging.isActive = !lodging.isActive;
      await this.repo.save(lodging);
    }
    return lodging;
  }

  // --- Accruals ---
  getAccruals(lodgingId: number) {
    return this.accrualRepo.find({ where: { lodgingId }, order: { id: 'DESC' } });
  }

  async generateAccrual(lodgingId: number, data: { period: string; amount: number; currency: string }) {
    const existing = await this.accrualRepo.findOneBy({ lodgingId, period: data.period });
    if (existing) throw new BadRequestException('Bu dönem için zaten tahakkuk oluşturulmuş.');

    const accrual = this.accrualRepo.create({
      lodgingId,
      period: data.period,
      amount: data.amount,
      currency: data.currency,
      status: 'Ödenmedi'
    });
    return this.accrualRepo.save(accrual);
  }

  // --- Payments ---
  getPayments(lodgingId: number) {
    return this.paymentRepo.find({ where: { lodgingId }, order: { id: 'DESC' } });
  }

  async addPayment(lodgingId: number, data: { accrualId: number; amount: number; wallet_id: number; transaction_date: string; notes?: string }) {
    const accrual = await this.accrualRepo.findOneBy({ id: data.accrualId });
    if (!accrual) throw new BadRequestException('Tahakkuk bulunamadı.');

    const amountNum = Number(data.amount);
    if (amountNum <= 0) throw new BadRequestException('Geçerli bir ödeme tutarı giriniz.');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create financial transaction (Income)
      const finResult = await queryRunner.query(
        `INSERT INTO transactions (wallet_id, type, amount, transaction_date, description) 
         VALUES (?, 'income', ?, ?, ?)`,
        [data.wallet_id, amountNum, data.transaction_date, data.notes || `Kira Ödemesi - ${accrual.period}`]
      );
      const financialTxId = finResult.insertId;

      // 2. Update wallet balance
      await queryRunner.query('UPDATE wallets SET balance = balance + ? WHERE id = ?', [amountNum, data.wallet_id]);

      // 3. Create LodgingPayment
      await queryRunner.query(
        `INSERT INTO lodging_payments (lodging_id, transaction_id, amount, payment_date, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [lodgingId, financialTxId, amountNum, data.transaction_date, data.notes]
      );

      // 4. Update Accrual
      const newTotalPaid = Number(accrual.totalPaid) + amountNum;
      const newStatus = newTotalPaid >= Number(accrual.amount) ? 'Ödendi' : 'Eksik Ödeme';
      await queryRunner.query(
        'UPDATE lodging_accruals SET total_paid = ?, status = ? WHERE id = ?',
        [newTotalPaid, newStatus, accrual.id]
      );

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err.message || 'Ödeme işlemi başarısız.');
    } finally {
      await queryRunner.release();
    }
  }
}
