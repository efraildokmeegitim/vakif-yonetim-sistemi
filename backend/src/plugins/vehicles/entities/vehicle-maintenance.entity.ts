import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Vehicle } from './vehicle.entity';

@Entity('vehicle_maintenances')
export class VehicleMaintenance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'vehicle_id' })
  vehicleId: number;

  @ManyToOne(() => Vehicle, v => v.maintenances, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ length: 100 })
  type: string; // Bakım, Kasko, Trafik Sigortası, Muayene vs.

  @Column({ type: 'date' })
  date: string; // İşlem tarihi

  @Column({ type: 'date', nullable: true })
  next_due_date: string; // Bir sonraki işlem tarihi

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  cost: number; // Tutar

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
