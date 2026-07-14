import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('project_files')
export class ProjectFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'project_id' })
  projectId: number;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ name: 'original_name', nullable: true })
  originalName: string;

  @Column({ nullable: true })
  category: string;

  @Column({ name: 'uploaded_by_user_id', nullable: true })
  uploadedByUserId: number;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;
}
