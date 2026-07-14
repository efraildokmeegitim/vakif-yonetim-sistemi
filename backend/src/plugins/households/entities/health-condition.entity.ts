import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('health_conditions')
export class HealthCondition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'household_id' })
  householdId: number;

  @Column({ name: 'member_id', nullable: true })
  memberId: number;

  @Column()
  condition: string; // Hastalık / Engellilik durumu

  @Column({ nullable: true })
  report: string; // Sağlık raporu var mı?

  @Column({ type: 'text', nullable: true })
  notes: string;
}
