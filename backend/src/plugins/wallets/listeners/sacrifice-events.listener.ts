import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WalletsService } from '../wallets.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType } from '../entities/transaction.entity';
import { Wallet } from '../entities/wallet.entity';

@Injectable()
export class SacrificeEventsListener {
  private readonly logger = new Logger(SacrificeEventsListener.name);

  constructor(
    private readonly walletsService: WalletsService,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
  ) {}

  @OnEvent('sacrifice.share.paid')
  async handleSacrificeSharePaidEvent(payload: { shareId: number, donorId?: number, amount: number, currency: string, description: string }) {
    try {
      // "Kurban Fonu" kasasını bul veya sistemdeki ilk kasaya ata
      let targetWallet = await this.walletRepo.findOne({ where: { name: 'Kurban Fonu' } });
      if (!targetWallet) {
        targetWallet = await this.walletRepo.findOne({ where: {} });
      }

      if (!targetWallet) {
        this.logger.error('Kurban hissesi tahsilatı için aktif bir kasa bulunamadı.');
        return;
      }

      await this.walletsService.addTransaction({
        walletId: targetWallet.id,
        amount: payload.amount,
        currency: payload.currency,
        type: TransactionType.INCOME,
        description: payload.description,
        transactionDate: new Date().toISOString(),
        currentAccountId: payload.donorId,
      });
      this.logger.log(`Kurban hissesi kasa tahsilatı otomatik oluşturuldu. Hisse ID: ${payload.shareId}`);
    } catch (error) {
      this.logger.error(`Kurban hissesi kasaya eklenemedi: ${error.message}`);
    }
  }

  @OnEvent('sacrifice.share.cancelled')
  async handleSacrificeShareCancelledEvent(payload: { shareId: number }) {
    try {
      const transaction = await this.transactionRepo
        .createQueryBuilder('tx')
        .where('tx.description LIKE :desc', { desc: `%Kurban Hissesi Bağışı%(#${payload.shareId})%` })
        .orWhere('tx.description LIKE :oldDesc', { oldDesc: `%Kurban Hissesi Bağışı - Hisse ID: ${payload.shareId}%` })
        .getOne();

      if (transaction) {
        await this.walletsService.deleteTransaction(transaction.id);
        this.logger.log(`Kurban hissesi iptal edildi, kasa işlemi otomatik silindi. İşlem ID: ${transaction.id}`);
      }
    } catch (error) {
      this.logger.error(`Kurban hissesi iptal edilirken kasa silinemedi: ${error.message}`);
    }
  }

  @OnEvent('sacrifice.share.updated')
  async handleSacrificeShareUpdatedEvent(payload: { shareId: number, amount: number, currency: string, description: string }) {
    try {
      const transaction = await this.transactionRepo
        .createQueryBuilder('tx')
        .where('tx.description LIKE :desc', { desc: `%Kurban Hissesi Bağışı%(#${payload.shareId})%` })
        .orWhere('tx.description LIKE :oldDesc', { oldDesc: `%Kurban Hissesi Bağışı - Hisse ID: ${payload.shareId}%` })
        .getOne();

      if (transaction) {
        await this.walletsService.updateTransaction(transaction.id, {
          amount: payload.amount,
          currency: payload.currency,
          description: payload.description
        });
        this.logger.log(`Kurban hissesi güncellendi, kasa işlemi güncellendi. İşlem ID: ${transaction.id}`);
      }
    } catch (error) {
      this.logger.error(`Kurban hissesi güncellenirken kasa güncellenemedi: ${error.message}`);
    }
  }

  @OnEvent('sacrifice.group.closed')
  async handleSacrificeGroupClosedEvent(payload: { groupId: number, groupName: string, difference: number, currency: string, status?: string, institution?: string }) {
    try {
      let targetWallet = await this.walletRepo.findOne({ where: { name: 'Kurban Fonu' } });
      if (!targetWallet) {
        targetWallet = await this.walletRepo.findOne({ where: {} });
      }

      if (!targetWallet) {
        this.logger.error('Kurban mahsuplaşması için aktif bir kasa bulunamadı.');
        return;
      }

      const type = payload.difference > 0 ? TransactionType.INCOME : TransactionType.EXPENSE;
      let description = '';

      if (payload.status === 'Aktarıldı') {
        const inst = payload.institution || 'Bilinmeyen Kurum';
        description = payload.difference > 0 
          ? `Kurban Aktarım Mahsuplaşması (Kâr) - Kurum: ${inst}, Grup: ${payload.groupName}`
          : `Kurban Aktarım Mahsuplaşması (Zarar) - Kurum: ${inst}, Grup: ${payload.groupName}`;
      } else {
        description = payload.difference > 0 
          ? `Kurban Kesim Mahsuplaşması (Kâr) - Grup: ${payload.groupName}`
          : `Kurban Kesim Mahsuplaşması (Zarar) - Grup: ${payload.groupName}`;
      }

      await this.walletsService.addTransaction({
        walletId: targetWallet.id,
        amount: Math.abs(payload.difference),
        currency: payload.currency,
        type: type,
        description: description,
        transactionDate: new Date().toISOString(),
      });
      this.logger.log(`Kurban mahsuplaşması kasaya işlendi. Grup: ${payload.groupName}`);
    } catch (error) {
      this.logger.error(`Kurban mahsuplaşması kasaya işlenemedi: ${error.message}`);
    }
  }

  @OnEvent('sacrifice.groups.bulk_transferred')
  async handleBulkTransferEvent(payload: { groupCount: number, difference: number, currency: string, institution?: string }) {
    try {
      let targetWallet = await this.walletRepo.findOne({ where: { name: 'Kurban Fonu' } });
      if (!targetWallet) {
        targetWallet = await this.walletRepo.findOne({ where: {} });
      }

      if (!targetWallet) {
        this.logger.error('Kurban mahsuplaşması için aktif bir kasa bulunamadı.');
        return;
      }

      const type = payload.difference > 0 ? TransactionType.INCOME : TransactionType.EXPENSE;
      const inst = payload.institution || 'Bilinmeyen Kurum';
      const description = payload.difference > 0 
        ? `Toplu Kurban Aktarım Mahsuplaşması (Kâr) - Kurum: ${inst}, ${payload.groupCount} Grup`
        : `Toplu Kurban Aktarım Mahsuplaşması (Zarar) - Kurum: ${inst}, ${payload.groupCount} Grup`;

      await this.walletsService.addTransaction({
        walletId: targetWallet.id,
        amount: Math.abs(payload.difference),
        currency: payload.currency,
        type: type,
        description: description,
        transactionDate: new Date().toISOString(),
      });
      this.logger.log(`Toplu kurban mahsuplaşması kasaya işlendi. Grup Sayısı: ${payload.groupCount}`);
    } catch (error) {
      this.logger.error(`Toplu kurban mahsuplaşması kasaya işlenemedi: ${error.message}`);
    }
  }
}
