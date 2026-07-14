import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('scholarship_payments')
export class ScholarshipPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'scholarship_id' })
  scholarshipId: number;

  @Column({ name: 'transaction_id' })
  transactionId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date', name: 'payment_date', nullable: true })
  paymentDate: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
