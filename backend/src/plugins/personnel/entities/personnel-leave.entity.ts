import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Personnel } from './personnel.entity';

export enum LeaveType {
  YILLIK_IZIN = 'Yıllık İzin',
  RAPORLU = 'Raporlu (Mazeretli)',
  UCRETSIZ_IZIN = 'Ücretsiz İzin',
  OZEL_IZIN = 'Özel İzin',
  IDARI_IZIN = 'İdari İzin'
}

@Entity('personnel_leaves')
export class PersonnelLeave {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  personnelId: number;

  @ManyToOne(() => Personnel)
  @JoinColumn({ name: 'personnelId' })
  personnel: Personnel;

  @Column({ type: 'enum', enum: LeaveType })
  leaveType: LeaveType;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column()
  totalDays: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
