import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Personnel } from './personnel.entity';

@Entity('personnel_files')
export class PersonnelFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  personnelId: number;

  @ManyToOne(() => Personnel)
  @JoinColumn({ name: 'personnelId' })
  personnel: Personnel;

  @Column()
  filePath: string;

  @Column()
  originalName: string;

  @Column()
  fileCategory: string; // Sözleşme, Kimlik vb.

  @Column({ type: 'date' })
  uploadDate: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
