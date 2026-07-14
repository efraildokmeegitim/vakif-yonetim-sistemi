import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('settings')
export class Setting {
  @PrimaryColumn({ length: 100 })
  key: string;

  @Column({ type: 'text', nullable: true })
  value: string;
}
