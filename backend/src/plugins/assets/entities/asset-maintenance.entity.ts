import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('asset_maintenance')
export class AssetMaintenance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'asset_id' })
  assetId: number;

  @Column()
  type: string; // 'Periyodik Bakım', 'Arıza Onarımı', 'Kalibrasyon'

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'maintenance_date', type: 'date' })
  maintenanceDate: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number;

  @Column({ nullable: true })
  vendor: string; // Bakımı yapan firma/kişi

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
