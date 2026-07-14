import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('external_aids')
export class ExternalAid {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'household_id' })
  householdId: number;

  @Column()
  type: string; // Nakdi, Erzak, Giyim, Kömür vb.

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'aid_date' })
  aidDate: Date;
}
