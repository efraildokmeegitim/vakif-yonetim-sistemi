import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('lodging_payments')
export class LodgingPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'lodging_id' })
  lodgingId: number;

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
