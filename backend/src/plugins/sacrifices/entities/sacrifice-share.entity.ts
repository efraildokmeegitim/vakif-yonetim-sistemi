import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SacrificeGroup } from './sacrifice-group.entity';
import { CurrentAccount } from '../../current-accounts/entities/current-account.entity';

export enum ShareType {
  VACIP = 'Vacip',
  ADAK = 'Adak',
  AKIKA = 'Akika',
  SUKUR = 'Şükür',
  SIFA = 'Şifa'
}

@Entity('sacrifice_shares')
export class SacrificeShare {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CurrentAccount, { eager: true, onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'current_account_id' })
  donor: CurrentAccount;

  @Column({ name: 'current_account_id', nullable: true })
  donorId: number | null;

  @ManyToOne(() => CurrentAccount, { eager: true, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'partner_id' })
  partner: CurrentAccount;

  @Column({ name: 'partner_id', nullable: true })
  partnerId: number | null;

  @ManyToOne(() => SacrificeGroup, group => group.shares, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: SacrificeGroup;

  @Column({ name: 'group_id' })
  groupId: number;

  @Column({
    type: 'enum',
    enum: ShareType,
    default: ShareType.VACIP
  })
  shareType: ShareType;

  @Column({ default: false })
  isProxyGiven: boolean; // Vekalet Alındı mı?

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  expectedAmount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amountPaid: number;

  @Column({ default: 'TRY' })
  currency: string;

  @Column({ nullable: true })
  mediaUrl: string; // Video veya Fotoğraf Linki

  @Column({ default: false })
  isMediaSent: boolean;

  @Column({ default: false })
  isSmsSent: boolean; // Mock SMS state

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
