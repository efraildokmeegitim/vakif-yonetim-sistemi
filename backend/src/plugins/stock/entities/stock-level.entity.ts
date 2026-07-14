import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { StockItem } from './stock-item.entity';

@Entity('stock_levels')
export class StockLevel {
  @PrimaryColumn({ name: 'stock_item_id' })
  stockItemId: number;

  @PrimaryColumn({ name: 'warehouse_id' })
  warehouseId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  quantity: number;

  @ManyToOne(() => StockItem)
  @JoinColumn({ name: 'stock_item_id' })
  item: StockItem;
}
