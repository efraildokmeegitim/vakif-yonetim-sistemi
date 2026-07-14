import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { StockItemCategory } from './stock-item-category.entity';

@Entity('stock_items')
export class StockItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  barcode: string;

  @Column({ name: 'category_id', nullable: true })
  categoryId: number;

  @ManyToOne(() => StockItemCategory, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: StockItemCategory;

  @Column()
  unit: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'estimated_value', default: 0 })
  estimatedValue: number;

  @Column({ name: 'value_currency', default: 'TRY' })
  valueCurrency: string;
}
