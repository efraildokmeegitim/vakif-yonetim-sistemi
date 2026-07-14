import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StockItemCategory } from './entities/stock-item-category.entity';
import { StockItem } from './entities/stock-item.entity';
import { StockLevel } from './entities/stock-level.entity';
import { StockTransaction } from './entities/stock-transaction.entity';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(StockItemCategory) private readonly categoryRepo: Repository<StockItemCategory>,
    @InjectRepository(StockItem) private readonly itemRepo: Repository<StockItem>,
    @InjectRepository(StockLevel) private readonly levelRepo: Repository<StockLevel>,
    @InjectRepository(StockTransaction) private readonly transactionRepo: Repository<StockTransaction>,
    private readonly dataSource: DataSource,
  ) {}

  // --- Categories ---
  getCategories() { return this.categoryRepo.find({ order: { name: 'ASC' } }); }
  
  async createCategory(data: any) {
    const existing = await this.categoryRepo.findOne({ where: { name: data.name } });
    if (existing) throw new BadRequestException('Bu kategori zaten mevcut.');
    const cat = this.categoryRepo.create(data as object);
    return this.categoryRepo.save(cat);
  }

  // --- Items ---
  getItems() { 
    return this.itemRepo.find({ relations: { category: true }, order: { name: 'ASC' } }); 
  }

  async createItem(data: any) {
    const item = this.itemRepo.create(data as object);
    return this.itemRepo.save(item);
  }

  async updateItem(id: number, data: any) {
    await this.itemRepo.update(id, data);
    return this.itemRepo.findOneBy({ id });
  }

  async deleteItem(id: number) {
    await this.itemRepo.delete(id);
  }

  // --- Stock Levels ---
  async getStockLevels() {
    return this.dataSource.query(`
      SELECT 
        sl.warehouse_id as warehouseId, w.name as warehouseName,
        si.id as itemId, si.name as itemName, si.unit, sl.quantity
      FROM stock_levels sl
      JOIN stock_items si ON sl.stock_item_id = si.id
      JOIN warehouses w ON sl.warehouse_id = w.id
      WHERE sl.quantity > 0
      ORDER BY w.name, si.name
    `);
  }

  // --- Transactions ---
  async stockIn(data: any) {
    const { entry_type, transaction_date, notes, items, warehouse_id, wallet_id, transaction_type_id, total_cost, current_account_id } = data;
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let financialTxId = null;

      // If it's a purchase, deduct money from wallet
      if (entry_type === 'purchase') {
        if (!wallet_id || !total_cost) throw new BadRequestException('Satın alma için Kasa ve Tutar zorunludur.');
        
        // Create financial transaction directly
        const finResult = await queryRunner.query(
          `INSERT INTO transactions (wallet_id, current_account_id, type, amount, transaction_date, transaction_type_id, description) 
           VALUES (?, ?, 'expense', ?, ?, ?, ?)`,
          [wallet_id, current_account_id || null, total_cost, transaction_date, transaction_type_id || null, notes || 'Stok Alımı']
        );
        financialTxId = finResult.insertId;

        // Update wallet balance
        await queryRunner.query('UPDATE wallets SET balance = balance - ? WHERE id = ?', [total_cost, wallet_id]);
      }

      // Record stock transactions and levels
      for (const item of items) {
        const qty = parseFloat(item.quantity);
        if (isNaN(qty) || qty <= 0) continue;

        const txType = entry_type === 'purchase' ? 'Giriş (Satın Alma)' : 'Giriş (Bağış)';
        
        await queryRunner.query(
          `INSERT INTO stock_transactions (item_id, transaction_type, quantity, transaction_date, notes, financial_transaction_id, current_account_id, warehouse_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [item.id, txType, qty, transaction_date, notes, financialTxId, entry_type === 'donation' ? current_account_id : null, warehouse_id]
        );

        await queryRunner.query(
          `INSERT INTO stock_levels (stock_item_id, warehouse_id, quantity) VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
          [item.id, warehouse_id, qty, qty]
        );
      }

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err.message || 'Stok girişi başarısız.');
    } finally {
      await queryRunner.release();
    }
  }

  async stockOut(data: any) {
    const { current_account_id, transaction_date, notes, items } = data;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of items) {
        const qty = parseFloat(item.quantity);
        if (isNaN(qty) || qty <= 0) continue;

        // Check stock
        const [level] = await queryRunner.query(
          'SELECT quantity FROM stock_levels WHERE stock_item_id = ? AND warehouse_id = ? FOR UPDATE',
          [item.id, item.warehouse_id]
        );

        if (!level || level.quantity < qty) {
          throw new BadRequestException(`Yetersiz stok: Ürün ID ${item.id}. İstenen: ${qty}, Mevcut: ${level ? level.quantity : 0}`);
        }

        // Output transaction
        await queryRunner.query(
          `INSERT INTO stock_transactions (item_id, transaction_type, quantity, transaction_date, notes, current_account_id, warehouse_id)
           VALUES (?, 'Çıkış (Yardım)', ?, ?, ?, ?, ?)`,
          [item.id, qty, transaction_date, notes, current_account_id, item.warehouse_id]
        );

        // Update stock level
        await queryRunner.query(
          'UPDATE stock_levels SET quantity = quantity - ? WHERE stock_item_id = ? AND warehouse_id = ?',
          [qty, item.id, item.warehouse_id]
        );
      }

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err.message || 'Stok çıkışı başarısız.');
    } finally {
      await queryRunner.release();
    }
  }

  async stockTransfer(data: any) {
    const { from_warehouse_id, to_warehouse_id, transaction_date, notes, items } = data;

    if (from_warehouse_id === to_warehouse_id) {
      throw new BadRequestException('Aynı depoya transfer yapılamaz.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of items) {
        const qty = parseFloat(item.quantity);
        if (isNaN(qty) || qty <= 0) continue;

        // Check stock in source warehouse
        const [level] = await queryRunner.query(
          'SELECT quantity FROM stock_levels WHERE stock_item_id = ? AND warehouse_id = ? FOR UPDATE',
          [item.id, from_warehouse_id]
        );

        if (!level || level.quantity < qty) {
          throw new BadRequestException(`Yetersiz stok: Ürün ID ${item.id}. İstenen: ${qty}, Mevcut: ${level ? level.quantity : 0}`);
        }

        // Output transaction from source
        await queryRunner.query(
          `INSERT INTO stock_transactions (item_id, transaction_type, quantity, transaction_date, notes, warehouse_id)
           VALUES (?, 'Çıkış (Transfer)', ?, ?, ?, ?)`,
          [item.id, qty, transaction_date, notes, from_warehouse_id]
        );

        // Update stock level in source
        await queryRunner.query(
          'UPDATE stock_levels SET quantity = quantity - ? WHERE stock_item_id = ? AND warehouse_id = ?',
          [qty, item.id, from_warehouse_id]
        );

        // Input transaction to destination
        await queryRunner.query(
          `INSERT INTO stock_transactions (item_id, transaction_type, quantity, transaction_date, notes, warehouse_id)
           VALUES (?, 'Giriş (Transfer)', ?, ?, ?, ?)`,
          [item.id, qty, transaction_date, notes, to_warehouse_id]
        );

        // Update stock level in destination
        await queryRunner.query(
          `INSERT INTO stock_levels (stock_item_id, warehouse_id, quantity) VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
          [item.id, to_warehouse_id, qty, qty]
        );
      }

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err.message || 'Stok transferi başarısız.');
    } finally {
      await queryRunner.release();
    }
  }
}
