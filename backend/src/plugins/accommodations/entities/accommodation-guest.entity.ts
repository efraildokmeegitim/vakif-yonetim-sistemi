import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Reservation } from './reservation.entity';

@Entity('accommodation_guests')
export class AccommodationGuest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'reservation_id' })
  reservationId: number;

  @ManyToOne(() => Reservation, reservation => reservation.guests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;

  @Column({ length: 11, nullable: true })
  tc_no: string;

  @Column({ length: 255 })
  ad_soyad: string;

  @Column({ type: 'date', nullable: true })
  dogum_tarihi: string;

  @Column({ length: 50, default: 'Belirtilmemiş' })
  cinsiyet: string;

  @Column({ length: 50, nullable: true })
  telefon: string;

  @Column({ type: 'text', nullable: true })
  adres: string;

  @Column({ type: 'text', nullable: true })
  notlar: string;
}
