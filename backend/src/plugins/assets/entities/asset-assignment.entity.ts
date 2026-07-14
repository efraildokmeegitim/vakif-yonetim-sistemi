import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('asset_assignments')
export class AssetAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'asset_id' })
  assetId: number;

  @Column({ name: 'personnel_ca_id' })
  personnelCaId: number;

  @Column({ type: 'date', name: 'assignment_date' })
  assignmentDate: string;

  @Column({ type: 'date', name: 'return_date', nullable: true })
  returnDate: string;

  @Column({ default: 1 })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: 'Zimmetli' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
