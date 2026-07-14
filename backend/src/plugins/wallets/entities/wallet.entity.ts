import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { CurrentAccount } from '../../current-accounts/entities/current-account.entity';
import { WalletBalance } from './wallet-balance.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // Kasa adı

  @OneToMany(() => WalletBalance, balance => balance.wallet, { cascade: true })
  balances: WalletBalance[];

  @Column({ type: 'enum', enum: ['Fiziksel', 'Emanet'], default: 'Fiziksel' })
  groupType: 'Fiziksel' | 'Emanet';

  @Column({ default: 'Genel Fon' })
  fundType: string;

  @ManyToOne(() => CurrentAccount, { nullable: true })
  @JoinColumn({ name: 'linked_current_account_id' })
  linkedCurrentAccount: CurrentAccount;

  @Column({ default: true })
  isActive: boolean; // Arşivleme için

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
