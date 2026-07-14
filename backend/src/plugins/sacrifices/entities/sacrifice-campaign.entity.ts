import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { SacrificeGroup } from './sacrifice-group.entity';

@Entity('sacrifice_campaigns')
export class SacrificeCampaign {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // Örn: 2026 Afrika Kurban Organizasyonu

  @Column()
  year: number;

  @Column('decimal', { precision: 10, scale: 2 })
  defaultSharePrice: number;

  @Column({ default: 'TRY' })
  currency: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => SacrificeGroup, group => group.campaign, { cascade: true })
  groups: SacrificeGroup[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
