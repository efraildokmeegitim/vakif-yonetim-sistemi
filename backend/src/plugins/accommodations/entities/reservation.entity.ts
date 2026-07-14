import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { CurrentAccount } from '../../current-accounts/entities/current-account.entity';
import { Room } from './room.entity';
import { AccommodationGuest } from './accommodation-guest.entity';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'guest_ca_id' })
  guestCaId: number;

  @ManyToOne(() => CurrentAccount)
  @JoinColumn({ name: 'guest_ca_id' })
  guestAccount: CurrentAccount;

  @Column({ name: 'room_id' })
  roomId: number;

  @ManyToOne(() => Room)
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @Column({ type: 'date' })
  check_in_date: string;

  @Column({ type: 'date' })
  check_out_date: string;

  @Column({ type: 'int', default: 1 })
  guest_count: number;

  @Column({
    type: 'enum',
    enum: ['Aktif', 'Tamamlandı', 'İptal Edildi'],
    default: 'Aktif',
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'tinyint', default: 0 })
  reserves_entire_room: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => AccommodationGuest, guest => guest.reservation)
  guests: AccommodationGuest[];
}
