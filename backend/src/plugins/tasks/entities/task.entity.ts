import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'personnel_id' })
  personnelId: number;

  @Column({ name: 'project_id', nullable: true })
  projectId: number;

  @Column({ name: 'current_account_id', nullable: true })
  currentAccountId: number;

  @Column({ name: 'cost_center_id', nullable: true })
  costCenterId: number;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: string;

  @Column({ default: 'Oluşturuldu' })
  status: string; // 'Oluşturuldu', 'Devam Ediyor', 'Tamamlandı', 'Hesap Kapatıldı'

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
