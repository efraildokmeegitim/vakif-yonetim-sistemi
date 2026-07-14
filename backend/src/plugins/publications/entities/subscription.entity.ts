import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'subscriber_ca_id' })
  subscriberCaId: number;

  @Column({ name: 'publication_id' })
  publicationId: number; // Dergi ID

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: string;

  @Column({ name: 'gift_publication_id', nullable: true })
  giftPublicationId: number; // Kitap ID

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'initial_transaction_id', nullable: true })
  initialTransactionId: number;

  @Column({ name: 'payment_status', default: 'Ödenmedi' }) // Ödenmedi, Kısmi Ödendi, Ödendi
  paymentStatus: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  amount: number;

  @Column({ name: 'gift_delivered_date', type: 'date', nullable: true })
  giftDeliveredDate: string;

  @Column({ default: 'Aktif' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
