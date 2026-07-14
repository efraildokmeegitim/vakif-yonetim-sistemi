import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { CurrentAccountType } from './current-account-type.entity';
import { AidLimit } from './aid-limit.entity';

export enum AccountCategory {
  BIREYSEL = 'Bireysel',
  KURUMSAL = 'Kurumsal',
}

@Entity('current_accounts')
export class CurrentAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: AccountCategory, default: AccountCategory.BIREYSEL })
  accountCategory: AccountCategory;

  @ManyToMany(() => CurrentAccountType, { cascade: true })
  @JoinTable({
    name: 'current_account_type_links',
    joinColumn: { name: 'current_account_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'type_id', referencedColumnName: 'id' }
  })
  types: CurrentAccountType[];

  @Column({ nullable: true })
  identityNumber: string;

  @Column({ nullable: true })
  taxOffice: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: true })
  isActive: boolean;

  // Tüm ekstra/esnek veriler (eski projedeki öğrenci notları, hane detayları vb.) JSON olarak tutulacak
  @Column({ type: 'json', nullable: true })
  metadata: any;

  @OneToMany(() => AidLimit, limit => limit.currentAccount)
  aidLimits: AidLimit[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
