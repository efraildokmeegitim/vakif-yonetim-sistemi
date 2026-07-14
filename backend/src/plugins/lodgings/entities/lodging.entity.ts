import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('lodgings')
export class Lodging {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ name: 'is_rented', default: false })
  isRented: boolean;

  @Column({ name: 'tenant_ca_id', nullable: true })
  tenantCaId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'rent_amount', nullable: true })
  rentAmount: number;

  @Column({ name: 'rent_currency', default: 'TRY' })
  rentCurrency: string;

  @Column({ name: 'rent_payment_day', nullable: true })
  rentPaymentDay: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
