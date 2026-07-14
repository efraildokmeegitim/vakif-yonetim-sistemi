import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SoupKitchenMenu } from './soup-kitchen-menu.entity';
import { Household } from '../../households/entities/household.entity';

@Entity('soup_kitchen_distributions')
export class SoupKitchenDistribution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  menuId: number;

  @ManyToOne(() => SoupKitchenMenu, menu => menu.distributions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menuId' })
  menu: SoupKitchenMenu;

  @Column({ nullable: true })
  householdId: number;

  @ManyToOne(() => Household, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'householdId' })
  household: Household;

  @Column({ type: 'varchar', length: 255, nullable: true })
  anonymousName: string; // Kapıdan gelen kayıtsız kişiler için

  @Column({ type: 'int', default: 1 })
  portionCount: number; // Verilen porsiyon sayısı

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  distributedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
