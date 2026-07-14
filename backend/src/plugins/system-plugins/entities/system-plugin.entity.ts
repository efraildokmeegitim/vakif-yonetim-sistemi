import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('system_plugins')
export class SystemPlugin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  identifier: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: '1.0.0' })
  version: string;

  @Column({ default: false })
  isCore: boolean; // Core modules cannot be disabled (e.g. CurrentAccounts)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
