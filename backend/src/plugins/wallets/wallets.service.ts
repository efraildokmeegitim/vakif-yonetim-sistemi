import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner, In } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { WalletBalance } from './entities/wallet-balance.entity';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { TransactionDocument } from './entities/transaction-document.entity';
import { CreateWalletDto, UpdateWalletDto } from './dto/wallet.dto';
import { CreateTransactionDto, TransferFundsDto } from './dto/transaction.dto';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionDocument)
    private readonly documentRepository: Repository<TransactionDocument>,
    private readonly dataSource: DataSource,
  ) {}

  // ==================== WALLET METHODS ====================

  async createWallet(createWalletDto: CreateWalletDto): Promise<Wallet> {
    const { linkedCurrentAccountId, ...rest } = createWalletDto;
    const wallet = this.walletRepository.create({
      ...rest,
      linkedCurrentAccount: linkedCurrentAccountId ? { id: linkedCurrentAccountId } as any : null,
    });
    return await this.walletRepository.save(wallet);
  }

  async findAllWallets(): Promise<Wallet[]> {
    return await this.walletRepository.find({ 
      relations: { linkedCurrentAccount: true, balances: true },
      order: { name: 'ASC' } 
    });
  }

  async findOneWallet(id: number): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({ 
      where: { id },
      relations: { linkedCurrentAccount: true, balances: true }
    });
    if (!wallet) throw new NotFoundException('Kasa bulunamadı');
    return wallet;
  }

  async updateWallet(id: number, updateWalletDto: UpdateWalletDto): Promise<Wallet> {
    const wallet = await this.findOneWallet(id);
    const { linkedCurrentAccountId, ...rest } = updateWalletDto;
    
    this.walletRepository.merge(wallet, rest);
    
    if (linkedCurrentAccountId !== undefined) {
      wallet.linkedCurrentAccount = linkedCurrentAccountId ? { id: linkedCurrentAccountId } as any : null;
    }
    
    return await this.walletRepository.save(wallet);
  }
  async deleteWallet(id: number): Promise<void> {
    const wallet = await this.findOneWallet(id);
    await this.walletRepository.remove(wallet);
  }

  // ==================== TRANSACTION METHODS (ACID) ====================

  private async generateReceiptNumber(manager: any): Promise<string> {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
    
    // Sunucunun yerel saati üzerinden saat ve dakikayı alalım (HHMM)
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}${minutes}`;

    const prefix = `FIS-${dateStr}-${timeStr}-`;
    
    // Find the last transaction with this prefix
    const lastTx = await manager.createQueryBuilder(Transaction, 'tx')
      .where('tx.receipt_number LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('tx.receipt_number', 'DESC')
      .getOne();

    let seq = 1;
    if (lastTx && lastTx.receiptNumber) {
      const parts = lastTx.receiptNumber.split('-');
      const lastSeqStr = parts[parts.length - 1];
      if (lastSeqStr) {
        seq = parseInt(lastSeqStr, 10) + 1;
      }
    }

    return `${prefix}${seq.toString().padStart(4, '0')}`;
  }

  async addTransaction(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Kasa ve bakiyeyi kilitleyerek al
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { id: createTransactionDto.walletId },
        relations: { balances: true },
      });

      if (!wallet) {
        throw new NotFoundException('Kasa bulunamadı');
      }

      let walletBalance = await queryRunner.manager.findOne(WalletBalance, {
        where: { walletId: wallet.id, currency: createTransactionDto.currency },
        lock: { mode: 'pessimistic_write' },
      });

      if (!walletBalance) {
        walletBalance = queryRunner.manager.create(WalletBalance, {
          walletId: wallet.id,
          currency: createTransactionDto.currency,
          balance: 0,
        });
      }

      // İşlemi oluştur
      const transaction = queryRunner.manager.create(Transaction, {
        ...createTransactionDto,
        transactionDate: createTransactionDto.transactionDate ? new Date(createTransactionDto.transactionDate) : new Date(),
      });

      // Bakiye güncelle
      const amount = Number(createTransactionDto.amount);
      if (createTransactionDto.type === TransactionType.INCOME) {
        walletBalance.balance = Number(walletBalance.balance) + amount;
      } else {
        walletBalance.balance = Number(walletBalance.balance) - amount;
      }

      transaction.receiptNumber = await this.generateReceiptNumber(queryRunner.manager);

      await queryRunner.manager.save(walletBalance);
      const savedTransaction = await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      return savedTransaction;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err.message || 'İşlem kaydedilirken hata oluştu');
    } finally {
      await queryRunner.release();
    }
  }

  async transferFunds(transferDto: TransferFundsDto): Promise<{ expense: Transaction, income: Transaction }> {
    if (transferDto.fromWalletId === transferDto.toWalletId && transferDto.fromCurrency === transferDto.toCurrency) {
      throw new BadRequestException('Aynı kasa ve aynı döviz cinsine virman yapılamaz');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fromWallet = await queryRunner.manager.findOne(Wallet, { where: { id: transferDto.fromWalletId } });
      const toWallet = await queryRunner.manager.findOne(Wallet, { where: { id: transferDto.toWalletId } });

      if (!fromWallet || !toWallet) throw new NotFoundException('Kasalardan biri bulunamadı');

      let fromBalance = await queryRunner.manager.findOne(WalletBalance, {
        where: { walletId: transferDto.fromWalletId, currency: transferDto.fromCurrency },
        lock: { mode: 'pessimistic_write' },
      });

      if (!fromBalance || Number(fromBalance.balance) < Number(transferDto.amountSent)) {
        throw new BadRequestException(`Kaynak kasada yeterli ${transferDto.fromCurrency} bakiye yok`);
      }

      let toBalance = await queryRunner.manager.findOne(WalletBalance, {
        where: { walletId: transferDto.toWalletId, currency: transferDto.toCurrency },
        lock: { mode: 'pessimistic_write' },
      });

      if (!toBalance) {
        toBalance = queryRunner.manager.create(WalletBalance, {
          walletId: transferDto.toWalletId,
          currency: transferDto.toCurrency,
          balance: 0,
        });
      }

      const amountReceived = transferDto.amountReceived || transferDto.amountSent;
      
      // Otomatik Kur Açıklaması
      let desc = transferDto.description || `Virman: ${fromWallet.name} -> ${toWallet.name}`;
      let kurFarki = 0;

      if (transferDto.fromCurrency !== transferDto.toCurrency) {
         const rate = transferDto.exchangeRate || (Number(amountReceived) / Number(transferDto.amountSent));
         desc += ` (Kur: 1 ${transferDto.fromCurrency} = ${rate.toFixed(4)} ${transferDto.toCurrency})`;
         
         if (transferDto.exchangeRate) {
           const theoreticalAmount = Number(transferDto.amountSent) * Number(transferDto.exchangeRate);
           kurFarki = theoreticalAmount - Number(amountReceived);
         }
      }

      const tDate = new Date();

      // 1. Çıkış İşlemi (Expense)
      const expense = queryRunner.manager.create(Transaction, {
        walletId: transferDto.fromWalletId,
        type: TransactionType.EXPENSE,
        currency: transferDto.fromCurrency,
        amount: transferDto.amountSent,
        description: desc,
        transactionDate: tDate,
      });
      expense.receiptNumber = await this.generateReceiptNumber(queryRunner.manager);
      const savedExpense = await queryRunner.manager.save(expense);

      // 2. Giriş İşlemi (Income) - Gerçekten kasaya giren miktar
      const income = queryRunner.manager.create(Transaction, {
        walletId: transferDto.toWalletId,
        type: TransactionType.INCOME,
        currency: transferDto.toCurrency,
        amount: amountReceived,
        description: desc,
        transactionDate: tDate,
        linkedTransactionId: savedExpense.id,
      });
      income.receiptNumber = await this.generateReceiptNumber(queryRunner.manager);
      const savedIncome = await queryRunner.manager.save(income);

      savedExpense.linkedTransactionId = savedIncome.id;
      await queryRunner.manager.save(savedExpense);

      // 3. Kur Farkı İşlemi (Eğer varsa)
      if (kurFarki !== 0) {
        const diffType = kurFarki > 0 ? TransactionType.EXPENSE : TransactionType.INCOME;
        const diffDesc = kurFarki > 0 ? `Kur Farkı / Komisyon (Zarar)` : `Kur Farkı (Kar)`;
        const diffAmount = Math.abs(kurFarki);

        const diffTransaction = queryRunner.manager.create(Transaction, {
          walletId: transferDto.toWalletId,
          type: diffType,
          currency: transferDto.toCurrency,
          amount: diffAmount,
          description: diffDesc,
          transactionDate: tDate,
          linkedTransactionId: savedIncome.id, // Ana işleme bağla
        });
        diffTransaction.receiptNumber = await this.generateReceiptNumber(queryRunner.manager);
        await queryRunner.manager.save(diffTransaction);

        // Hedef Bakiye hesabına kur farkını yansıt (Sanal değil, zaten kasaya amountReceived girdiği için bakiyeyi amountReceived kadar artırıp farkı ekstraya basıyoruz)
        // Bekle, toBalance.balance'ı zaten amountReceived ile güncelleyeceğiz. Kur farkı sadece ekstrede gözükmeli ama kasa bakiyesini BOZMAMALI.
        // Aslında, Transaction'a attığımızda toBalance'a etkisi olur eğer her işlem tek tek toplanırsa.
        // Muhasebesel olarak doğru olan: Kasaya "Teorik" girer, "Kur Farkı" kadar "Çıkar".
        // Böylece Net Giren = amountReceived olur.
        // Yukarıda `income` işlemini amountReceived olarak kaydettik. O zaman Kur Farkını eklersek kasa YANLIŞ hesaplanır.
        // DÜZELTME:
        // `income` işlemi = theoreticalAmount olmalı!
        // `diffTransaction` = kurFarki (Gider veya Gelir)
        // Böylece net etki = amountReceived olur.
        
        income.amount = Number(transferDto.amountSent) * Number(transferDto.exchangeRate!);
        await queryRunner.manager.save(income);
        // Bu durumda net Bakiye etkisi = income.amount - diffAmount (eğer giderse) = amountReceived.
      }

      // Bakiyeleri güncelle
      fromBalance.balance = Number(fromBalance.balance) - Number(transferDto.amountSent);
      toBalance.balance = Number(toBalance.balance) + Number(amountReceived); // Net giren miktar

      await queryRunner.manager.save(fromBalance);
      await queryRunner.manager.save(toBalance);

      await queryRunner.commitTransaction();
      return { expense: savedExpense, income: savedIncome };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err.message || 'Virman işlemi sırasında hata oluştu');
    } finally {
      await queryRunner.release();
    }
  }

  async getTransaction(id: number): Promise<Transaction> {
    const tx = await this.transactionRepository.findOne({
      where: { id },
      relations: { wallet: true, currentAccount: true }
    });
    if (!tx) throw new NotFoundException('İşlem bulunamadı');
    return tx;
  }

  async updateTransaction(id: number, updateDto: Partial<CreateTransactionDto>): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tx = await queryRunner.manager.findOne(Transaction, { where: { id } });
      if (!tx) throw new NotFoundException('İşlem bulunamadı');

      const isAmountOrCurrencyChanged = (updateDto.amount !== undefined && Number(updateDto.amount) !== Number(tx.amount)) ||
                                        (updateDto.currency !== undefined && updateDto.currency !== tx.currency) ||
                                        (updateDto.type !== undefined && updateDto.type !== tx.type) ||
                                        (updateDto.walletId !== undefined && updateDto.walletId !== tx.walletId);

      if (isAmountOrCurrencyChanged && tx.linkedTransactionId) {
        throw new BadRequestException('Virman veya bağlantılı (kur farkı vb.) işlemlerin tutar/döviz/yön bilgileri doğrudan değiştirilemez. Lütfen işlemi silip yeniden oluşturun.');
      }

      if (!isAmountOrCurrencyChanged) {
        // Just update metadata
        if (updateDto.description !== undefined) tx.description = updateDto.description;
        if (updateDto.currentAccountId !== undefined) tx.currentAccountId = updateDto.currentAccountId;
        if (updateDto.transactionDate !== undefined) tx.transactionDate = new Date(updateDto.transactionDate);
        
        await queryRunner.manager.save(tx);
        await queryRunner.commitTransaction();
        return tx;
      }

      // Revert Old Balance
      let oldBalance = await queryRunner.manager.findOne(WalletBalance, {
        where: { walletId: tx.walletId, currency: tx.currency },
        lock: { mode: 'pessimistic_write' },
      });
      if (oldBalance) {
        if (tx.type === TransactionType.INCOME) oldBalance.balance = Number(oldBalance.balance) - Number(tx.amount);
        else oldBalance.balance = Number(oldBalance.balance) + Number(tx.amount);
        await queryRunner.manager.save(oldBalance);
      }

      // Apply changes to transaction
      tx.amount = updateDto.amount !== undefined ? Number(updateDto.amount) : tx.amount;
      tx.currency = updateDto.currency !== undefined ? updateDto.currency : tx.currency;
      tx.type = updateDto.type !== undefined ? (updateDto.type as TransactionType) : tx.type;
      tx.walletId = updateDto.walletId !== undefined ? updateDto.walletId : tx.walletId;
      if (updateDto.description !== undefined) tx.description = updateDto.description;
      if (updateDto.currentAccountId !== undefined) tx.currentAccountId = updateDto.currentAccountId;
      if (updateDto.transactionDate !== undefined) tx.transactionDate = new Date(updateDto.transactionDate);

      // Apply New Balance
      let newBalance = await queryRunner.manager.findOne(WalletBalance, {
        where: { walletId: tx.walletId, currency: tx.currency },
        lock: { mode: 'pessimistic_write' },
      });
      if (!newBalance) {
        newBalance = queryRunner.manager.create(WalletBalance, {
          walletId: tx.walletId,
          currency: tx.currency,
          balance: 0,
        });
      }
      if (tx.type === TransactionType.INCOME) newBalance.balance = Number(newBalance.balance) + Number(tx.amount);
      else newBalance.balance = Number(newBalance.balance) - Number(tx.amount);
      
      await queryRunner.manager.save(newBalance);
      await queryRunner.manager.save(tx);

      await queryRunner.commitTransaction();
      return tx;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err.message || 'İşlem güncellenirken hata oluştu');
    } finally {
      await queryRunner.release();
    }
  }

  async deleteTransaction(id: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const txIdsToDelete = new Set<number>();
      txIdsToDelete.add(id);

      let foundNew = true;
      while(foundNew) {
        foundNew = false;
        
        // Find all transactions that are in the set or linked to any in the set
        // TypeORM doesn't easily support In() with Set, convert to array
        const idArray = Array.from(txIdsToDelete);
        
        const qb = queryRunner.manager.createQueryBuilder(Transaction, 'tx')
          .where('tx.id IN (:...idArray)', { idArray })
          .orWhere('tx.linked_transaction_id IN (:...idArray)', { idArray });

        const relatedTx = await qb.getMany();

        for (const tx of relatedTx) {
          if (!txIdsToDelete.has(tx.id)) {
            txIdsToDelete.add(tx.id);
            foundNew = true;
          }
          if (tx.linkedTransactionId && !txIdsToDelete.has(tx.linkedTransactionId)) {
            txIdsToDelete.add(tx.linkedTransactionId);
            foundNew = true;
          }
        }
      }

      const allRelatedTx = await queryRunner.manager.createQueryBuilder(Transaction, 'tx')
          .where('tx.id IN (:...ids)', { ids: Array.from(txIdsToDelete) })
          .getMany();

      if (allRelatedTx.length === 0) {
         throw new NotFoundException('Silinecek işlem bulunamadı');
      }

      // SİLME ÖNCESİ LİNK KOPARMA (Foreign Key Constraint hatasını önlemek için)
      for (const t of allRelatedTx) {
        if (t.linkedTransactionId) {
          t.linkedTransactionId = null as any;
          await queryRunner.manager.save(t);
        }
      }

      // REVERT BALANCES
      for (const t of allRelatedTx) {
        let walletBalance = await queryRunner.manager.findOne(WalletBalance, {
          where: { walletId: t.walletId, currency: t.currency },
          lock: { mode: 'pessimistic_write' },
        });

        if (walletBalance) {
          if (t.type === TransactionType.INCOME) {
            walletBalance.balance = Number(walletBalance.balance) - Number(t.amount);
          } else {
            walletBalance.balance = Number(walletBalance.balance) + Number(t.amount);
          }
          await queryRunner.manager.save(walletBalance);
        }
      }

      // DELETE TRANSACTIONS
      await queryRunner.manager.delete(Transaction, { id: In(Array.from(txIdsToDelete)) });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err.message || 'İşlem silinirken hata oluştu');
    } finally {
      await queryRunner.release();
    }
  }

  async getTransactions(params?: { walletId?: number; currentAccountId?: number }): Promise<Transaction[]> {
    const query = this.transactionRepository.createQueryBuilder('t')
      .leftJoinAndSelect('t.wallet', 'w')
      .leftJoinAndSelect('t.currentAccount', 'ca')
      .orderBy('t.transactionDate', 'DESC')
      .addOrderBy('t.id', 'DESC');

    if (params?.walletId) {
      query.andWhere('t.walletId = :walletId', { walletId: params.walletId });
    }
    
    if (params?.currentAccountId) {
      query.andWhere('t.currentAccountId = :currentAccountId', { currentAccountId: params.currentAccountId });
    }

    return await query.getMany();
  }

  // ==================== DOCUMENT METHODS ====================

  async addDocument(transactionId: number, file: Express.Multer.File): Promise<TransactionDocument> {
    const doc = this.documentRepository.create({
      transactionId,
      fileName: file.originalname,
      fileUrl: `/uploads/${file.filename}`
    });
    return await this.documentRepository.save(doc);
  }

  async getDocuments(transactionId: number): Promise<TransactionDocument[]> {
    return await this.documentRepository.find({ where: { transactionId } });
  }

  async deleteDocument(id: number): Promise<void> {
    const doc = await this.documentRepository.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Döküman bulunamadı');
    
    const fs = require('fs');
    const path = require('path');
    try {
      fs.unlinkSync(path.join(process.cwd(), doc.fileUrl));
    } catch(e) {
      // Ignored if file already deleted manually
    }
    await this.documentRepository.remove(doc);
  }
}
