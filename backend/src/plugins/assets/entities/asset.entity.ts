import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  barcode: string;

  @Column({ name: 'category_id', nullable: true })
  categoryId: number;

  @Column({ name: 'asset_code', unique: true, nullable: true })
  assetCode: string;

  @Column({ name: 'is_countable', default: false })
  isCountable: boolean;

  @Column({ name: 'total_quantity', default: 1 })
  totalQuantity: number;

  @Column({ name: 'stock_quantity', default: 1 })
  stockQuantity: number;

  @Column({ type: 'date', name: 'purchase_date', nullable: true })
  purchaseDate: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'purchase_price', nullable: true })
  purchasePrice: number;

  @Column({ default: 'TRY' })
  currency: string;

  @Column({ name: 'supplier_ca_id', nullable: true })
  supplierCaId: number;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'lodging_id', nullable: true })
  lodgingId: number;

  @Column({ default: 'Stokta' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
