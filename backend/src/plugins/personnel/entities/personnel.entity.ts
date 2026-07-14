import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('personnel')
export class Personnel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  position: string;

  @Column({ type: 'date', nullable: true })
  hireDate: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  monthlySalary: number;

  @Column({ default: 'TRY' })
  salaryCurrency: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'date', nullable: true })
  contractEndDate: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  costCenterId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
