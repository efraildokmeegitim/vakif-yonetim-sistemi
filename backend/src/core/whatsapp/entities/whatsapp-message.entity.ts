import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('whatsapp_messages')
export class WhatsappMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  phone: string;

  @Column('text')
  message: string;

  @Column({ default: 'queued' })
  status: string; // 'queued', 'sent', 'failed'

  @Column({ nullable: true, type: 'text' })
  error: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
