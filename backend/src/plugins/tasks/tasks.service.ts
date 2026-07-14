import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Task } from './entities/task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
    private readonly dataSource: DataSource,
  ) {}

  async getTasks() {
    return this.dataSource.query(`
      SELECT t.*, p.name as personnel_name 
      FROM tasks t 
      JOIN personnel p ON t.personnel_id = p.id 
      ORDER BY t.created_at DESC
    `);
  }

  async getTaskStats() {
    const [[stats]] = await this.dataSource.query(`
      SELECT 
        SUM(CASE WHEN status IN ('Oluşturuldu', 'Devam Ediyor') THEN 1 ELSE 0 END) as activeTasks,
        SUM(CASE WHEN status IN ('Tamamlandı', 'Hesap Kapatıldı') THEN 1 ELSE 0 END) as completedTasks
      FROM tasks
    `);
    return {
      activeTasks: parseInt(stats?.activeTasks || '0'),
      completedTasks: parseInt(stats?.completedTasks || '0')
    };
  }

  async createTask(data: any) {
    const task = this.taskRepo.create({
      title: data.title,
      description: data.description,
      personnelId: data.personnel_id,
      projectId: data.project_id || null,
      currentAccountId: data.current_account_id || null,
      costCenterId: data.cost_center_id || null,
      dueDate: data.due_date || null
    });
    return this.taskRepo.save(task);
  }

  async getTaskDetail(id: number) {
    const [[task]] = await this.dataSource.query(`
      SELECT t.*, p.name as personnel_name, ca.name as current_account_name
      FROM tasks t 
      JOIN personnel p ON t.personnel_id = p.id
      LEFT JOIN current_accounts ca ON t.current_account_id = ca.id
      WHERE t.id = ?
    `, [id]);

    if (!task) throw new NotFoundException('Görev bulunamadı');

    const [transactions] = await this.dataSource.query(`
      SELECT t.*, w.currency, tt.name as type_name
      FROM transactions t
      LEFT JOIN wallets w ON t.wallet_id = w.id
      LEFT JOIN transaction_types tt ON t.transaction_type_id = tt.id
      WHERE t.task_id = ? 
      ORDER BY t.created_at DESC
    `, [id]);

    const [[totals]] = await this.dataSource.query(`
      SELECT
        COALESCE(SUM(CASE WHEN tt.name = 'İş Avansı' THEN t.amount ELSE 0 END), 0) as advance,
        COALESCE(SUM(CASE WHEN t.type = 'expense' AND tt.name != 'İş Avansı' AND tt.name != 'Görev Fark Ödemesi' THEN t.amount ELSE 0 END), 0) as expense
      FROM transactions t
      LEFT JOIN transaction_types tt ON t.transaction_type_id = tt.id
      WHERE t.task_id = ?
    `, [id]);
    
    totals.balance = (parseFloat(totals.advance) || 0) - (parseFloat(totals.expense) || 0);

    const [[personnelCari]] = await this.dataSource.query('SELECT id FROM current_accounts WHERE personnel_id = ?', [task.personnel_id]);
    
    let openAdvances = [];
    if (personnelCari) {
      const [advances] = await this.dataSource.query(`
        SELECT t.id, t.amount, w.currency, t.description 
        FROM transactions t 
        JOIN wallets w ON t.wallet_id = w.id 
        JOIN transaction_types tt ON t.transaction_type_id = tt.id
        WHERE t.current_account_id = ? AND tt.name = 'İş Avansı' AND t.settled_by_transaction_id IS NULL
      `, [personnelCari.id]);
      openAdvances = advances;
    }

    return { task, transactions, totals, openAdvances };
  }

  async addAdvance(id: number, data: any) {
    const { wallet_id, amount, description, transaction_date } = data;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const task = await this.taskRepo.findOneBy({ id });
      if (!task) throw new NotFoundException('Görev bulunamadı');

      const [[personnelCari]] = await queryRunner.query('SELECT id FROM current_accounts WHERE personnel_id = ?', [task.personnelId]);
      if (!personnelCari) throw new BadRequestException('Personelin cari hesabı bulunamadı. Lütfen personele cari hesap tanımlayın.');

      let [[isAvansiTipi]] = await queryRunner.query("SELECT id FROM transaction_types WHERE name = 'İş Avansı'");
      if (!isAvansiTipi) {
        // Fallback: create İş Avansı type if not exists
        const result = await queryRunner.query("INSERT INTO transaction_types (name, type) VALUES ('İş Avansı', 'expense')");
        isAvansiTipi = { id: result.insertId };
      }

      await queryRunner.query(
        `INSERT INTO transactions (wallet_id, current_account_id, project_id, task_id, transaction_type_id, type, amount, description, transaction_date, cost_center_id)
         VALUES (?, ?, ?, ?, ?, 'expense', ?, ?, ?, ?)`,
        [wallet_id, personnelCari.id, task.projectId, id, isAvansiTipi.id, amount, description || 'İş Avansı', transaction_date, task.costCenterId]
      );
      
      await queryRunner.query('UPDATE wallets SET balance = balance - ? WHERE id = ?', [amount, wallet_id]);
      
      if (task.status === 'Oluşturuldu') {
        await queryRunner.query("UPDATE tasks SET status = 'Devam Ediyor' WHERE id = ?", [id]);
      }

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err.message || 'Avans verme başarısız');
    } finally {
      await queryRunner.release();
    }
  }

  async settleTask(id: number, data: any) {
    const { expenses, advances_to_settle, wallet_id, payment_date } = data;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const task = await this.taskRepo.findOneBy({ id });
      if (!task) throw new NotFoundException('Görev bulunamadı');

      const [[personnelCari]] = await queryRunner.query('SELECT id FROM current_accounts WHERE personnel_id = ?', [task.personnelId]);
      
      const parsedExpenses = expenses || [];
      const advanceIds = advances_to_settle ? (Array.isArray(advances_to_settle) ? advances_to_settle : [advances_to_settle]) : [];

      const totalExpenseAmount = parsedExpenses.reduce((sum: number, exp: any) => sum + parseFloat(exp.amount), 0);
      let totalAdvanceAmount = 0;
      
      if (advanceIds.length > 0) {
        const [advances] = await queryRunner.query('SELECT amount FROM transactions WHERE id IN (?)', [advanceIds]);
        totalAdvanceAmount = advances.reduce((sum: number, adv: any) => sum + parseFloat(adv.amount), 0);
      }
      
      const balance = totalAdvanceAmount - totalExpenseAmount;

      for (const expense of parsedExpenses) {
        await queryRunner.query(
          `INSERT INTO transactions (current_account_id, project_id, task_id, transaction_type_id, type, amount, description, transaction_date, cost_center_id)
           VALUES (?, ?, ?, ?, 'expense', ?, ?, ?, ?)`,
          [personnelCari.id, task.projectId, id, expense.type_id, expense.amount, expense.desc, payment_date, task.costCenterId]
        );
      }

      const [lastTransaction] = await queryRunner.query('SELECT LAST_INSERT_ID() as id');
      const settlementId = lastTransaction ? lastTransaction[0]?.id : Date.now();

      for (const advanceId of advanceIds) {
        await queryRunner.query('UPDATE transactions SET settled_by_transaction_id = ? WHERE id = ?', [settlementId, advanceId]);
      }

      if (balance > 0) { // Personel para iade edecek
        let [[iadeTipi]] = await queryRunner.query("SELECT id FROM transaction_types WHERE name = 'İş Avansı İadesi'");
        if(!iadeTipi) {
            const res = await queryRunner.query("INSERT INTO transaction_types (name, type) VALUES ('İş Avansı İadesi', 'income')");
            iadeTipi = { id: res.insertId };
        }
        await queryRunner.query(
          `INSERT INTO transactions (wallet_id, current_account_id, task_id, transaction_type_id, type, amount, transaction_date, description)
           VALUES (?, ?, ?, ?, 'income', ?, ?, 'Avans Artanı İadesi')`,
          [wallet_id, personnelCari.id, id, iadeTipi.id, balance, payment_date]
        );
        await queryRunner.query('UPDATE wallets SET balance = balance + ? WHERE id = ?', [balance, wallet_id]);
      } else if (balance < 0) { // Personele ek ödeme yapılacak
        if (!wallet_id) throw new Error("Ek ödeme için cüzdan seçilmelidir.");
        const paymentAmount = Math.abs(balance);
        let [[farkTipi]] = await queryRunner.query("SELECT id FROM transaction_types WHERE name = 'Görev Fark Ödemesi'");
        if(!farkTipi) {
            const res = await queryRunner.query("INSERT INTO transaction_types (name, type) VALUES ('Görev Fark Ödemesi', 'expense')");
            farkTipi = { id: res.insertId };
        }
        await queryRunner.query(
          `INSERT INTO transactions (wallet_id, current_account_id, task_id, transaction_type_id, type, amount, transaction_date, description)
           VALUES (?, ?, ?, ?, 'expense', ?, ?, 'Görev Masraf Fark Ödemesi')`,
          [wallet_id, personnelCari.id, id, farkTipi.id, paymentAmount, payment_date]
        );
        await queryRunner.query('UPDATE wallets SET balance = balance - ? WHERE id = ?', [paymentAmount, wallet_id]);
      }

      await queryRunner.query("UPDATE tasks SET status = 'Hesap Kapatıldı' WHERE id = ?", [id]);
      await queryRunner.commitTransaction();
      return { success: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err.message || 'Görev kapatılırken hata oluştu');
    } finally {
      await queryRunner.release();
    }
  }
}
