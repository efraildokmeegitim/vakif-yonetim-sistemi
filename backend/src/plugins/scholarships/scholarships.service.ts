import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Scholarship } from './entities/scholarship.entity';
import { ScholarshipAccrual } from './entities/scholarship-accrual.entity';
import { ScholarshipPayment } from './entities/scholarship-payment.entity';
import { StudentDetails } from './entities/student-details.entity';
import { StudentFamilyInfo } from './entities/student-family-info.entity';

@Injectable()
export class ScholarshipsService {
  constructor(
    @InjectRepository(Scholarship) private readonly repo: Repository<Scholarship>,
    @InjectRepository(ScholarshipAccrual) private readonly accrualRepo: Repository<ScholarshipAccrual>,
    @InjectRepository(ScholarshipPayment) private readonly paymentRepo: Repository<ScholarshipPayment>,
    @InjectRepository(StudentDetails) private readonly studentDetailsRepo: Repository<StudentDetails>,
    @InjectRepository(StudentFamilyInfo) private readonly studentFamilyInfoRepo: Repository<StudentFamilyInfo>,
    private readonly dataSource: DataSource,
  ) {}

  create(createDto: any) {
    const scholarship = this.repo.create(createDto);
    return this.repo.save(scholarship);
  }

  async findAll(studentCaId?: number) {
    if (studentCaId) {
      return this.dataSource.query(`
        SELECT s.*, ca.name as studentName 
        FROM scholarships s
        LEFT JOIN current_accounts ca ON s.student_ca_id = ca.id
        WHERE s.student_ca_id = ?
        ORDER BY s.id DESC
      `, [studentCaId]);
    }
    return this.dataSource.query(`
      SELECT s.*, ca.name as studentName 
      FROM scholarships s
      LEFT JOIN current_accounts ca ON s.student_ca_id = ca.id
      ORDER BY s.id DESC
    `);
  }

  async findOne(id: number) {
    const scholarship = await this.repo.findOneBy({ id });
    const studentDetails = await this.studentDetailsRepo.findOneBy({ scholarshipId: id });
    const studentFamilyInfo = await this.studentFamilyInfoRepo.findOneBy({ scholarshipId: id });
    return { scholarship, studentDetails, studentFamilyInfo };
  }

  update(id: number, updateDto: any) {
    return this.repo.update(id, updateDto);
  }

  remove(id: number) {
    return this.repo.update(id, { status: 'Pasif' });
  }

  // --- Accruals ---
  getAccruals(scholarshipId: number) {
    return this.accrualRepo.find({ where: { scholarshipId }, order: { id: 'DESC' } });
  }

  async generateAccrual(scholarshipId: number, data: { period: string; amount: number; currency: string }) {
    const existing = await this.accrualRepo.findOneBy({ scholarshipId, period: data.period });
    if (existing) throw new BadRequestException('Bu dönem için zaten tahakkuk oluşturulmuş.');

    const accrual = this.accrualRepo.create({
      scholarshipId,
      period: data.period,
      amount: data.amount,
      currency: data.currency,
      status: 'Ödenmedi'
    });
    return this.accrualRepo.save(accrual);
  }

  // --- Payments ---
  getPayments(scholarshipId: number) {
    return this.paymentRepo.find({ where: { scholarshipId }, order: { id: 'DESC' } });
  }

  async addPayment(scholarshipId: number, data: { accrualId: number; amount: number; wallet_id: number; transaction_date: string; notes?: string }) {
    const accrual = await this.accrualRepo.findOneBy({ id: data.accrualId });
    if (!accrual) throw new BadRequestException('Tahakkuk bulunamadı.');

    const amountNum = Number(data.amount);
    if (amountNum <= 0) throw new BadRequestException('Geçerli bir ödeme tutarı giriniz.');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create financial transaction
      const finResult = await queryRunner.query(
        `INSERT INTO transactions (wallet_id, type, amount, transaction_date, description) 
         VALUES (?, 'expense', ?, ?, ?)`,
        [data.wallet_id, amountNum, data.transaction_date, data.notes || `Burs Ödemesi - ${accrual.period}`]
      );
      const financialTxId = finResult.insertId;

      // 2. Update wallet balance
      await queryRunner.query('UPDATE wallets SET balance = balance - ? WHERE id = ?', [amountNum, data.wallet_id]);

      // 3. Create ScholarshipPayment
      await queryRunner.query(
        `INSERT INTO scholarship_payments (scholarship_id, transaction_id, amount, payment_date, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [scholarshipId, financialTxId, amountNum, data.transaction_date, data.notes]
      );

      // 4. Update Accrual
      const newTotalPaid = Number(accrual.totalPaid) + amountNum;
      const newStatus = newTotalPaid >= Number(accrual.amount) ? 'Ödendi' : 'Eksik Ödeme';
      await queryRunner.query(
        'UPDATE scholarship_accruals SET total_paid = ?, status = ? WHERE id = ?',
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

  // --- Student Details & Family Info ---
  async updateStudentDetails(scholarshipId: number, data: any) {
    let details = await this.studentDetailsRepo.findOneBy({ scholarshipId });
    if (!details) {
      details = this.studentDetailsRepo.create({ scholarshipId });
    }
    
    if (data.school_name !== undefined) details.school_name = data.school_name;
    if (data.department !== undefined) details.department = data.department;
    if (data.grade_level !== undefined) details.grade_level = data.grade_level;
    if (data.gpa !== undefined) details.gpa = data.gpa;
    if (data.student_number !== undefined) details.student_number = data.student_number;

    return this.studentDetailsRepo.save(details);
  }

  async updateStudentFamilyInfo(scholarshipId: number, data: any) {
    let info = await this.studentFamilyInfoRepo.findOneBy({ scholarshipId });
    if (!info) {
      info = this.studentFamilyInfoRepo.create({ scholarshipId });
    }
    
    if (data.sibling_count !== undefined) info.siblingCount = data.sibling_count;
    if (data.studying_sibling_count !== undefined) info.studyingSiblingCount = data.studying_sibling_count;
    if (data.father_profession !== undefined) info.fatherProfession = data.father_profession;
    if (data.mother_profession !== undefined) info.motherProfession = data.mother_profession;
    if (data.family_income !== undefined) info.familyIncome = data.family_income;
    if (data.housing_status !== undefined) info.housingStatus = data.housing_status;

    return this.studentFamilyInfoRepo.save(info);
  }
}
