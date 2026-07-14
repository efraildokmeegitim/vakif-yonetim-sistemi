import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { WalletsListener } from './wallets.listener';
import { SacrificeEventsListener } from './listeners/sacrifice-events.listener';
import { Wallet } from './entities/wallet.entity';
import { WalletBalance } from './entities/wallet-balance.entity';
import { Transaction } from './entities/transaction.entity';
import { TransactionDocument } from './entities/transaction-document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, WalletBalance, Transaction, TransactionDocument])],
  controllers: [WalletsController],
  providers: [WalletsService, WalletsListener, SacrificeEventsListener],
  exports: [WalletsService],
})
export class WalletsModule {}
