import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { SoupKitchenDistribution } from './soup-kitchen-distribution.entity';

@Entity('soup_kitchen_menus')
export class SoupKitchenMenu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: string; // YYYY-MM-DD

  @Column({ type: 'text' })
  meals: string; // "Mercimek Çorbası, Tas Kebabı, Pilav" vs.

  @Column({ type: 'int', default: 0 })
  totalPortions: number; // Günlük hedeflenen/çıkartılan toplam porsiyon

  @Column({ type: 'int', default: 0 })
  distributedPortions: number; // Dağıtılan toplam porsiyon (Otomatik hesaplanabilir veya tetikleyici ile)

  @OneToMany(() => SoupKitchenDistribution, dist => dist.menu)
  distributions: SoupKitchenDistribution[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
