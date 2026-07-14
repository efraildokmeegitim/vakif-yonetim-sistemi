import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'project_category_id', nullable: true })
  projectCategoryId: number;

  @Column({ name: 'is_campaign', type: 'boolean', default: false })
  isCampaign: boolean;

  @Column({ name: 'campaign_goal_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  campaignGoalAmount: number;

  @Column({ name: 'campaign_goal_description', nullable: true })
  campaignGoalDescription: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: string;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: string;

  @Column({ name: 'application_date', type: 'date', nullable: true })
  applicationDate: string;

  @Column({ name: 'approval_date', type: 'date', nullable: true })
  approvalDate: string;

  @Column({ default: 'Planlanıyor' })
  status: string; // Planlanıyor, Devam Ediyor, Tamamlandı, İptal Edildi vb.

  @Column({ nullable: true })
  location: string;

  @Column({ name: 'partner_current_account_id', nullable: true })
  partnerCurrentAccountId: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // Metadata Columns (Combined into Project table for simplicity in new architecture)
  @Column({ name: 'beneficiary_count', nullable: true })
  beneficiaryCount: number;

  @Column({ name: 'region_population', nullable: true })
  regionPopulation: number;

  @Column({ name: 'muslim_population_percent', type: 'decimal', precision: 5, scale: 2, nullable: true })
  muslimPopulationPercent: number;

  @Column({ name: 'notes_on_region', type: 'text', nullable: true })
  notesOnRegion: string;

  @Column({ name: 'similar_projects_nearby', type: 'text', nullable: true })
  similarProjectsNearby: string;

  @Column({ name: 'technical_details', type: 'json', nullable: true })
  technicalDetails: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
