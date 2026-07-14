import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from './project.entity';

@Entity('project_metadata')
export class ProjectMetadata {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'project_id' })
  projectId: number;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'beneficiary_count', type: 'int', nullable: true })
  beneficiaryCount: number;

  @Column({ name: 'region_population', type: 'int', nullable: true })
  regionPopulation: number;

  @Column({ name: 'muslim_population_percent', type: 'int', nullable: true })
  muslimPopulationPercent: number;

  @Column({ name: 'muslim_population', type: 'int', nullable: true })
  muslimPopulation: number;

  @Column({ name: 'notes_on_region', type: 'text', nullable: true })
  notesOnRegion: string;

  @Column({ name: 'similar_projects_nearby', type: 'text', nullable: true })
  similarProjectsNearby: string;

  @Column({ name: 'technical_details', type: 'json', nullable: true })
  technicalDetails: any;
}
