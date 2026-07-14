import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'int', default: 1 })
  capacity: number;

  @Column({
    type: 'enum',
    enum: ['Erkek', 'Kadın', 'Aile', 'Karma'],
    default: 'Karma',
  })
  room_type: string;

  @Column({
    type: 'enum',
    enum: ['Kullanılabilir', 'Bakımda', 'Kapalı'],
    default: 'Kullanılabilir',
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['Temiz', 'Kirli', 'Temizleniyor'],
    default: 'Temiz',
  })
  cleaning_status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'tinyint', default: 1 })
  is_active: number;
}
