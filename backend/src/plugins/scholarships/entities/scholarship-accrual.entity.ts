import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('scholarship_accruals')
export class ScholarshipAccrual {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'scholarship_id' })
  scholarshipId: number;

  @Column()
  period: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'TRY' })
  currency: string;

  @Column({ default: 'Ödenmedi' })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_paid', default: 0 })
  totalPaid: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
