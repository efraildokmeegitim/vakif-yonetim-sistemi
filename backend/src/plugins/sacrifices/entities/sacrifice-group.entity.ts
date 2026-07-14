import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { SacrificeCampaign } from './sacrifice-campaign.entity';
import { SacrificeShare } from './sacrifice-share.entity';

export enum SacrificeAnimalType {
  BUYUKBAS = 'Büyükbaş',
  KUCUKBAS = 'Küçükbaş'
}

export enum SacrificeGroupStatus {
  BEKLIYOR = 'Bekliyor',
  KESILDI = 'Kesildi',
  DAGITILDI = 'Dağıtıldı',
  AKTARILDI = 'Aktarıldı'
}

@Entity('sacrifice_groups')
export class SacrificeGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // Grup No/Küpe No (Örn: AF-001)

  @Column({
    type: 'enum',
    enum: SacrificeAnimalType,
    default: SacrificeAnimalType.BUYUKBAS
  })
  animalType: SacrificeAnimalType;

  @Column()
  capacity: number; // Büyükbaş: 7, Küçükbaş: 1

  @Column({
    type: 'enum',
    enum: SacrificeGroupStatus,
    default: SacrificeGroupStatus.BEKLIYOR
  })
  status: SacrificeGroupStatus;

  @Column({ type: 'json', nullable: true })
  purchaseCosts: Record<string, number>;

  @Column({ type: 'json', nullable: true })
  slaughterCosts: Record<string, number>;

  @Column({ default: false })
  isFinanciallyClosed: boolean;

  @Column({ nullable: true })
  distributionLocation: string; // Etlerin nerede dağıtıldığı (Bölge/Ülke/Şehir vb)

  @Column({ nullable: true })
  beneficiaryCount: number; // Bu gruptan yararlanan tahmini kişi sayısı

  @Column({ nullable: true })
  transferredInstitution: string;

  @ManyToOne(() => SacrificeCampaign, campaign => campaign.groups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign: SacrificeCampaign;

  @Column({ name: 'campaign_id' })
  campaignId: number;

  @OneToMany(() => SacrificeShare, share => share.group, { cascade: true })
  shares: SacrificeShare[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
