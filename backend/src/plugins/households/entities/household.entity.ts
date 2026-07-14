import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('households')
export class Household {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'family_name' })
  familyName: string;

  @Column({ name: 'father_name', nullable: true })
  fatherName: string;

  @Column({ name: 'mother_name', nullable: true })
  motherName: string;

  @Column({ name: 'birth_place', nullable: true })
  birthPlace: string;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  nationality: string;

  @Column({ name: 'marital_status', nullable: true })
  maritalStatus: string;

  @Column({ name: 'education_status', nullable: true })
  educationStatus: string;

  @Column({ nullable: true })
  job: string;

  @Column({ name: 'work_status', nullable: true })
  workStatus: string;

  @Column({ name: 'housing_type', nullable: true })
  housingType: string;

  @Column({ name: 'social_security_status', nullable: true })
  socialSecurityStatus: string;

  @Column({ name: 'is_zakat_eligible', type: 'boolean', default: false })
  isZakatEligible: boolean;

  @Column({ name: 'contact_number', nullable: true })
  contactNumber: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  district: string;

  @Column({ name: 'application_date', type: 'date', nullable: true })
  applicationDate: string;

  @Column({ default: 'İncelemede' })
  status: string; // İncelemede, Onaylandı, Reddedildi

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
