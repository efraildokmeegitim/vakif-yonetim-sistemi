import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('household_financials')
export class HouseholdFinancial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'household_id' })
  householdId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  income: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  expense: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  debt: number;

  @Column({ name: 'housing_status', nullable: true })
  housingStatus: string; // Kira, Kendi Evi vb.

  @Column({ type: 'text', nullable: true })
  notes: string;
}
