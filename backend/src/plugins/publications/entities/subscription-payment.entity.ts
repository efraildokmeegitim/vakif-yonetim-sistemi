import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('subscription_payments')
export class SubscriptionPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'subscription_id' })
  subscriptionId: number;

  @Column({ name: 'transaction_id' })
  transactionId: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ name: 'payment_date', type: 'date' })
  paymentDate: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
