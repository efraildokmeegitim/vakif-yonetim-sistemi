import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CurrentAccount } from './current-account.entity';

@Entity('aid_limits')
export class AidLimit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'current_account_id' })
  currentAccountId: number;

  @ManyToOne(() => CurrentAccount, ca => ca.aidLimits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'current_account_id' })
  currentAccount: CurrentAccount;

  @Column({ length: 100 })
  category: string; // e.g. Gıda, Giyim, Eğitim vs.

  @Column('decimal', { precision: 12, scale: 2 })
  max_amount: number; // Yıllık veya dönemsel kota miktarı

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  used_amount: number; // Kullanılan kota miktarı

  @Column({ length: 50, default: 'Yıllık' })
  period: string; // Yıllık, Aylık, Tek Seferlik vs.

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
