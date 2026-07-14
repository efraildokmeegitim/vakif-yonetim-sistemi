import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('publication_sales')
export class PublicationSale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'transaction_id' })
  transactionId: number;

  @Column({ name: 'publication_id' })
  publicationId: number;

  @Column()
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 15, scale: 2 })
  unitPrice: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
