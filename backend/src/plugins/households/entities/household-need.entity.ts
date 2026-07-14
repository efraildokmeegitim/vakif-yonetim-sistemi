import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('household_needs')
export class HouseholdNeed {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'household_id' })
  householdId: number;

  @Column()
  category: string; // Gıda, Giyim, Eşya, Nakit vb.

  @Column({ type: 'text' })
  description: string;

  @Column({ default: 'Bekliyor' })
  status: string; // Bekliyor, Karşılandı, İptal Edildi

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
