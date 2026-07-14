import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CurrentAccount } from './current-account.entity';

@Entity('current_account_documents')
export class CurrentAccountDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  currentAccountId: number;

  @ManyToOne(() => CurrentAccount)
  @JoinColumn({ name: 'currentAccountId' })
  currentAccount: CurrentAccount;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 512 })
  filePath: string;

  @CreateDateColumn()
  uploadDate: Date;
}
