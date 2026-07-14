import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { CurrentAccount } from '../../current-accounts/entities/current-account.entity';
import { SponsorshipPayment } from './sponsorship-payment.entity';

@Entity('sponsorships')
export class Sponsorship {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CurrentAccount)
  @JoinColumn({ name: 'sponsor_id' })
  sponsor: CurrentAccount;

  @ManyToOne(() => CurrentAccount, { nullable: true })
  @JoinColumn({ name: 'beneficiary_id' })
  beneficiary: CurrentAccount;

  // Proje bazlı sponsorluk da olabilir
  @Column({ nullable: true })
  project_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 50, default: 'monthly' })
  period: string; // 'monthly', 'yearly', 'one_time'

  @Column({ type: 'date' })
  start_date: string;

  @Column({ type: 'date', nullable: true })
  end_date: string;

  @Column({ length: 20, default: 'active' })
  status: string; // 'active', 'cancelled', 'completed'

  @OneToMany(() => SponsorshipPayment, payment => payment.sponsorship, { cascade: true })
  payments: SponsorshipPayment[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
