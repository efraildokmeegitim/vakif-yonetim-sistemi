import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Scholarship } from './scholarship.entity';

@Entity('student_family_info')
export class StudentFamilyInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'scholarship_id' })
  scholarshipId: number;

  @ManyToOne(() => Scholarship, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scholarship_id' })
  scholarship: Scholarship;

  @Column({ name: 'sibling_count', type: 'int', nullable: true })
  siblingCount: number;

  @Column({ name: 'studying_sibling_count', type: 'int', nullable: true })
  studyingSiblingCount: number;

  @Column({ name: 'father_profession', nullable: true })
  fatherProfession: string;

  @Column({ name: 'mother_profession', nullable: true })
  motherProfession: string;

  @Column({ name: 'family_income', type: 'decimal', precision: 10, scale: 2, nullable: true })
  familyIncome: number;

  @Column({ name: 'housing_status', nullable: true })
  housingStatus: string;
}
