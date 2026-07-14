import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Wallet } from './wallet.entity';
import { CurrentAccount } from '../../current-accounts/entities/current-account.entity';
import { TransactionDocument } from './transaction-document.entity';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'receipt_number', unique: true, nullable: true })
  receiptNumber: string;

  @Column({ name: 'wallet_id' })
  walletId: number;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ default: 'TRY' })
  currency: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ name: 'current_account_id', nullable: true })
  currentAccountId: number;

  @ManyToOne(() => CurrentAccount, { nullable: true })
  @JoinColumn({ name: 'current_account_id' })
  currentAccount: CurrentAccount;

  @OneToMany(() => TransactionDocument, (doc) => doc.transaction)
  documents: TransactionDocument[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  transactionDate: Date;

  // Virman (Transfer) için gerekli alan
  @Column({ name: 'linked_transaction_id', nullable: true })
  linkedTransactionId: number | null;

  @ManyToOne(() => Transaction, { nullable: true })
  @JoinColumn({ name: 'linked_transaction_id' })
  linkedTransaction: Transaction;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
