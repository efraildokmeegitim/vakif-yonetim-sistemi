import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('lodging_accruals')
export class LodgingAccrual {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'lodging_id' })
  lodgingId: number;

  @Column()
  period: string; // e.g. 2026-07

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'TRY' })
  currency: string;

  @Column({ default: 'Ödenmedi' })
  status: string; // Ödenmedi, Eksik Ödeme, Ödendi

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_paid', default: 0 })
  totalPaid: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
