import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('stock_item_categories')
export class StockItemCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ name: 'usage_type', nullable: true })
  usageType: string; // 'Yardım Dağıtımı' veya 'İdari Sarf Malzemesi'
}
