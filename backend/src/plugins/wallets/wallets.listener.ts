import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { WalletBalance } from './entities/wallet-balance.entity';
import { CurrentAccountCreatedEvent } from '../current-accounts/events/current-account.events';
import { SystemAccountTypes } from '../../common/constants/account-types.constant';

@Injectable()
export class WalletsListener {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(WalletBalance)
    private readonly walletBalanceRepository: Repository<WalletBalance>,
  ) {}

  @OnEvent('current-account.created')
  async handleCurrentAccountCreatedEvent(event: CurrentAccountCreatedEvent) {
    const { currentAccount } = event;
    
    // Check if the account has the Mutevelli type
    const isMutevelli = currentAccount.types?.some(t => t.name === SystemAccountTypes.MUTEVELLI);
    
    if (isMutevelli) {
      await this.createTrusteeWallet(currentAccount);
    }
  }

  private async createTrusteeWallet(currentAccount: any) {
    const wallet = this.walletRepository.create({
      name: `${currentAccount.name} Emanet Kasası`,
      groupType: 'Emanet',
      fundType: 'Genel Fon',
      linkedCurrentAccount: currentAccount,
    });
    const savedWallet = await this.walletRepository.save(wallet);

    const defaultCurrencies = ['TRY', 'USD', 'EUR'];
    const balances = defaultCurrencies.map(currency => 
      this.walletBalanceRepository.create({
        walletId: savedWallet.id,
        currency: currency,
        balance: 0
      })
    );
    await this.walletBalanceRepository.save(balances);
  }
}
