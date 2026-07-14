import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Sponsorship } from './sponsorship.entity';

@Entity('sponsorship_payments')
export class SponsorshipPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Sponsorship, sponsorship => sponsorship.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sponsorship_id' })
  sponsorship: Sponsorship;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  payment_date: string;

  @Column({ length: 50, nullable: true })
  receipt_no: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;
}
