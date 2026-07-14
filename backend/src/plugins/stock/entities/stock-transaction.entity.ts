import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { StockItem } from './stock-item.entity';

@Entity('stock_transactions')
export class StockTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'item_id' })
  itemId: number;

  @ManyToOne(() => StockItem)
  @JoinColumn({ name: 'item_id' })
  item: StockItem;

  @Column({ name: 'transaction_type' })
  transactionType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'date', name: 'transaction_date' })
  transactionDate: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'financial_transaction_id', nullable: true })
  financialTransactionId: number;

  @Column({ name: 'current_account_id', nullable: true })
  currentAccountId: number;

  @Column({ name: 'household_id', nullable: true })
  householdId: number;

  @Column({ name: 'project_id', nullable: true })
  projectId: number;

  @Column({ name: 'warehouse_id' })
  warehouseId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
