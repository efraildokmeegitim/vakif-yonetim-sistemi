import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Wallet } from './wallet.entity';

@Entity('wallet_balances')
export class WalletBalance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'wallet_id' })
  walletId: number;

  @ManyToOne(() => Wallet, wallet => wallet.balances, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @Column()
  currency: string; // TRY, USD, EUR vb.

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
