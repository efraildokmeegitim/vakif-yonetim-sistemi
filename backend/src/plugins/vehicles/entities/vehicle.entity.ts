import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { VehicleMaintenance } from './vehicle-maintenance.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  plate_number: string;

  @Column({ length: 100 })
  brand: string;

  @Column({ length: 100 })
  model: string;

  @Column({ type: 'int', nullable: true })
  year: number;

  @Column({ length: 255, nullable: true })
  assigned_to: string; // Zimmetli kişi

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => VehicleMaintenance, maintenance => maintenance.vehicle)
  maintenances: VehicleMaintenance[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
