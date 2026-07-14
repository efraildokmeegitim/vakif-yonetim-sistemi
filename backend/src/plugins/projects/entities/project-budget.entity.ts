import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('project_budgets')
export class ProjectBudget {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'project_id' })
  projectId: number;

  @Column()
  description: string;

  @Column()
  type: string; // income, expense

  @Column({ name: 'estimated_amount', type: 'decimal', precision: 15, scale: 2 })
  estimatedAmount: number;

  @Column()
  currency: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
