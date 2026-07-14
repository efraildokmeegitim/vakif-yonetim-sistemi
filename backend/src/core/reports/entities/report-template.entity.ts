import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('report_templates')
export class ReportTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ name: 'table_name', length: 100 })
  tableName: string;

  @Column({ type: 'json', nullable: true })
  columns: any;

  @Column({ type: 'json', nullable: true })
  filters: any;

  @Column({ type: 'json', nullable: true, name: 'sort_by' })
  sortBy: any;

  @Column({ type: 'int', default: 1000 })
  limit: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
