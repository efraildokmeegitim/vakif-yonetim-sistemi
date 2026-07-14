import { CurrentAccount } from '../entities/current-account.entity';

export class CurrentAccountCreatedEvent {
  constructor(public readonly currentAccount: CurrentAccount) {}
}
