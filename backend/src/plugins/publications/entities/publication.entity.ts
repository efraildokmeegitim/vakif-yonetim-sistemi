import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('publications')
export class Publication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  author: string;

  @Column({ nullable: true })
  isbn: string;

  @Column()
  type: string; // Kitap, Dergi

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price: number;

  @Column({ default: 'TL' })
  currency: string;

  @Column({ name: 'stock_item_id', nullable: true })
  stockItemId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
