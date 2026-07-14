import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Scholarship } from './scholarship.entity';

@Entity('student_details')
export class StudentDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'scholarship_id' })
  scholarshipId: number;

  @ManyToOne(() => Scholarship, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scholarship_id' })
  scholarship: Scholarship;

  @Column({ nullable: true })
  school_name: string;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  grade_level: string;

  @Column({ nullable: true })
  gpa: string;

  @Column({ nullable: true })
  student_number: string;
}
