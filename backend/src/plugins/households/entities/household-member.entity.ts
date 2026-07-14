import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('household_members')
export class HouseholdMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'household_id' })
  householdId: number;

  @Column()
  name: string;

  @Column({ name: 'identity_number', nullable: true })
  identityNumber: string;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  relation: string; // Baba, Anne, Çocuk vb.

  @Column({ nullable: true })
  education: string;

  @Column({ nullable: true })
  occupation: string;

  @Column({ name: 'is_orphan', type: 'boolean', default: false })
  isOrphan: boolean;
}
