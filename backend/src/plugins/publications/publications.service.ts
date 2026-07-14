import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Publication } from './entities/publication.entity';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionPayment } from './entities/subscription-payment.entity';
import { PublicationSale } from './entities/publication-sale.entity';

@Injectable()
export class PublicationsService {
  constructor(
    @InjectRepository(Publication) private publicationRepo: Repository<Publication>,
    @InjectRepository(Subscription) private subscriptionRepo: Repository<Subscription>,
    @InjectRepository(SubscriptionPayment) private subPaymentRepo: Repository<SubscriptionPayment>,
    @InjectRepository(PublicationSale) private saleRepo: Repository<PublicationSale>,
    private dataSource: DataSource
  ) {}

  async getDashboardStats() {
    const [[stats]] = await this.dataSource.query(`
      SELECT
        (SELECT COUNT(*) FROM publications) as totalPublications,
        (SELECT COUNT(*) FROM subscriptions WHERE status = 'Aktif') as activeSubscriptions,
        (SELECT COALESCE(SUM(quantity), 0) FROM publication_sales) as totalBooksSold
    `);
    return stats;
  }

  async getCatalog() {
    const publications = await this.dataSource.query(`
      SELECT p.*,
             (SELECT SUM(sl.quantity) FROM stock_levels sl WHERE sl.stock_item_id = p.stock_item_id) as current_stock
      FROM publications p
      ORDER BY p.type, p.title
    `);
    return publications;
  }

  async addCatalog(data: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let stockItemId = null;
      let [[category]] = await queryRunner.query('SELECT id FROM stock_item_categories WHERE name = ?', [data.type === 'Dergi' ? 'Diğer' : 'Kitap']);
      
      if (!category) {
         const res = await queryRunner.query("INSERT INTO stock_item_categories (name, description) VALUES (?, 'Otomatik Kategori')", [data.type === 'Dergi' ? 'Diğer' : 'Kitap']);
         category = { id: res.insertId };
      }

      const [stockRes] = await queryRunner.query(
        'INSERT INTO stock_items (name, unit, estimated_value, value_currency, category_id) VALUES (?, ?, ?, ?, ?)',
        [data.title, 'Adet', data.price, data.currency, category.id]
      );
      stockItemId = stockRes.insertId;

      await queryRunner.query(
        'INSERT INTO publications (title, author, isbn, type, price, currency, stock_item_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [data.title, data.author, data.isbn || null, data.type, data.price, data.currency, stockItemId]
      );

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err.message || 'Kataloğa eklenirken hata oluştu');
    } finally {
      await queryRunner.release();
    }
  }

  async getSubscriptions(query: any) {
    let sql = `
      SELECT s.*, ca.name as subscriber_name, p.title as publication_title,
             COALESCE((SELECT SUM(amount) FROM subscription_payments WHERE subscription_id = s.id), 0) as total_paid
      FROM subscriptions s
      JOIN current_accounts ca ON s.subscriber_ca_id = ca.id
      JOIN publications p ON s.publication_id = p.id
    `;
    const params = [];
    const where = [];

    if (query.search) { where.push('ca.name LIKE ?'); params.push(`%${query.search}%`); }
    if (query.publication_id) { where.push('s.publication_id = ?'); params.push(query.publication_id); }
    if (query.status) { where.push('s.status = ?'); params.push(query.status); }
    
    if (where.length > 0) sql += ' WHERE ' + where.join(' AND ');
    sql += ' ORDER BY s.end_date DESC';

    const subscriptions = await this.dataSource.query(sql, params);
    subscriptions.forEach((s: any) => {
      s.remaining_balance = parseFloat(s.amount) - parseFloat(s.total_paid);
    });
    return subscriptions;
  }

  async addSubscription(data: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let transactionId = null;

      if (data.payment_status === 'Ödendi' && data.wallet_id && data.amount > 0) {
        let [[type]] = await queryRunner.query("SELECT id FROM transaction_types WHERE name = 'Abonelik Geliri'");
        if (!type) {
            const res = await queryRunner.query("INSERT INTO transaction_types (name, type) VALUES ('Abonelik Geliri', 'income')");
            type = { id: res.insertId };
        }

        const [tx] = await queryRunner.query(
          "INSERT INTO transactions (wallet_id, current_account_id, transaction_type_id, type, amount, description, transaction_date) VALUES (?, ?, ?, 'income', ?, ?, ?)",
          [data.wallet_id, data.subscriber_ca_id, type.id, data.amount, 'Yıllık Dergi Aboneliği', data.start_date]
        );
        transactionId = tx.insertId;
        await queryRunner.query('UPDATE wallets SET balance = balance + ? WHERE id = ?', [data.amount, data.wallet_id]);
      }

      const [sub] = await queryRunner.query(
        `INSERT INTO subscriptions 
         (subscriber_ca_id, publication_id, start_date, end_date, gift_publication_id, notes, initial_transaction_id, payment_status, amount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.subscriber_ca_id, data.publication_id, data.start_date, data.end_date, data.gift_publication_id || null, data.notes, transactionId, data.payment_status, data.amount || 0]
      );

      if (transactionId) {
          await queryRunner.query("INSERT INTO subscription_payments (subscription_id, transaction_id, amount, payment_date) VALUES (?, ?, ?, ?)", 
          [sub.insertId, transactionId, data.amount, data.start_date]);
      }

      if (data.gift_publication_id) {
        const [[giftBook]] = await queryRunner.query("SELECT stock_item_id FROM publications WHERE id = ?", [data.gift_publication_id]);
        if (giftBook && giftBook.stock_item_id) {
          await queryRunner.query('UPDATE stock_levels SET quantity = quantity - 1 WHERE stock_item_id = ? AND quantity > 0', [giftBook.stock_item_id]);
        }
      }

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err.message || 'Abonelik eklenirken hata oluştu');
    } finally {
      await queryRunner.release();
    }
  }

  async markGiftDelivered(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const [[sub]] = await queryRunner.query("SELECT gift_publication_id FROM subscriptions WHERE id = ?", [id]);
      if (!sub?.gift_publication_id) throw new BadRequestException('Hediye kitap bulunmuyor');
      
      const [[gift]] = await queryRunner.query("SELECT stock_item_id FROM publications WHERE id = ?", [sub.gift_publication_id]);
      if (gift?.stock_item_id) {
        await queryRunner.query('UPDATE stock_levels SET quantity = quantity - 1 WHERE stock_item_id = ? AND quantity > 0', [gift.stock_item_id]);
      }
      
      await queryRunner.query("UPDATE subscriptions SET gift_delivered_date = CURDATE() WHERE id = ?", [id]);
      
      await queryRunner.commitTransaction();
      return { success: true };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(e.message);
    } finally {
      await queryRunner.release();
    }
  }

  async processSale(data: any) {
    const { wallet_id, transaction_date, items } = data;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const parsedItems = items;
      if (!parsedItems || parsedItems.length === 0) throw new BadRequestException('Sepet boş');

      let totalAmount = 0;
      let totalQty = 0;
      parsedItems.forEach((i: any) => {
        totalAmount += (parseFloat(i.price) * parseInt(i.quantity));
        totalQty += parseInt(i.quantity);
      });

      let [[satisTipi]] = await queryRunner.query("SELECT id FROM transaction_types WHERE name = 'Kitap Satış Geliri'");
      if (!satisTipi) {
        const res = await queryRunner.query("INSERT INTO transaction_types (name, type) VALUES ('Kitap Satış Geliri', 'income')");
        satisTipi = { id: res.insertId };
      }

      const [tx] = await queryRunner.query(
        "INSERT INTO transactions (wallet_id, transaction_type_id, type, amount, description, transaction_date) VALUES (?, ?, 'income', ?, ?, ?)",
        [wallet_id, satisTipi.id, totalAmount, `${totalQty} adet kitap satışı`, transaction_date]
      );

      for (const item of parsedItems) {
        const [[pub]] = await queryRunner.query("SELECT stock_item_id FROM publications WHERE id = ?", [item.id]);
        await queryRunner.query(
          'INSERT INTO publication_sales (transaction_id, publication_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
          [tx.insertId, item.id, item.quantity, item.price]
        );
        await queryRunner.query(
          'UPDATE stock_levels SET quantity = quantity - ? WHERE stock_item_id = ?',
          [item.quantity, pub.stock_item_id]
        );
      }

      await queryRunner.query('UPDATE wallets SET balance = balance + ? WHERE id = ?', [totalAmount, wallet_id]);

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err.message || 'Satış kaydedilemedi');
    } finally {
      await queryRunner.release();
    }
  }
}
