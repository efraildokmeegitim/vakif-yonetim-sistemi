import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('scholarships')
export class Scholarship {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_ca_id' })
  studentCaId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'TRY' })
  currency: string;

  @Column({ nullable: true })
  period: string;

  @Column({ type: 'date', name: 'start_date', nullable: true })
  startDate: string;

  @Column({ type: 'date', name: 'end_date', nullable: true })
  endDate: string;

  @Column({ name: 'payment_day', nullable: true })
  paymentDay: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: 'Aktif' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
