import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('sponsorships')
export class Sponsorship {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'project_id' })
  projectId: number;

  @Column({ name: 'sponsor_ca_id' })
  sponsorCaId: number; // Current Account ID

  @Column({ name: 'sponsorship_type_id', nullable: true })
  sponsorshipTypeId: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: string;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: string;

  @Column({ default: 'Aktif' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
