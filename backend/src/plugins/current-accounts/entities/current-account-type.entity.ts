import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('current_account_types')
export class CurrentAccountType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 191 })
  name: string;
}
