import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity('transaction_documents')
export class TransactionDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'transaction_id' })
  transactionId: number;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_url' })
  fileUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Transaction, (transaction) => transaction.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;
}
