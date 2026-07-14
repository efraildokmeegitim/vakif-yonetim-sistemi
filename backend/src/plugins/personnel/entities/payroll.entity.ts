import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Personnel } from './personnel.entity';

export enum PayrollStatus {
  UNPAID = 'Ödenmedi',
  PARTIAL = 'Kısmen Ödendi',
  PAID = 'Ödendi'
}

@Entity('payrolls')
export class Payroll {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  personnelId: number;

  @ManyToOne(() => Personnel)
  @JoinColumn({ name: 'personnelId' })
  personnel: Personnel;

  @Column({ length: 7 }) // YYYY-MM
  period: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  salaryAmount: number;

  @Column({ default: 'TRY' })
  currency: string;

  @Column({ type: 'enum', enum: PayrollStatus, default: PayrollStatus.UNPAID })
  status: PayrollStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPaid: number;

  @CreateDateColumn()
  createdAt: Date;
}
