import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(private dataSource: DataSource) {}

  async getMetrics() {
    const [{ totalCurrentAccounts }] = await this.dataSource.query(`SELECT COUNT(*) as totalCurrentAccounts FROM current_accounts`);
    const [{ totalProjects }] = await this.dataSource.query(`SELECT COUNT(*) as totalProjects FROM projects WHERE is_active = 1`);
    const [{ totalUsers }] = await this.dataSource.query(`SELECT COUNT(*) as totalUsers FROM users`);
    const [{ totalHouseholds }] = await this.dataSource.query(`SELECT COUNT(*) as totalHouseholds FROM households`);
    
    // Total Balance across all wallets (simplified, assuming TRY or ignoring currency for dashboard overall)
    const [{ totalIncome }] = await this.dataSource.query(`SELECT SUM(amount) as totalIncome FROM transactions WHERE type = 'income'`);
    const [{ totalExpense }] = await this.dataSource.query(`SELECT SUM(amount) as totalExpense FROM transactions WHERE type = 'expense'`);
    const totalBalance = (Number(totalIncome) || 0) - (Number(totalExpense) || 0);

    // Monthly Trend (Last 6 months)
    const monthlyTrend = [];
    const monthNames = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = monthNames[d.getMonth()];
      const year = d.getFullYear();
      const monthNum = d.getMonth() + 1; // 1-12
      
      // SQLite syntax: strftime('%Y-%m', transaction_date)
      // Since it's SQLite, transaction_date is stored as ISO string typically, but let's just do a naive query
      const monthPrefix = `${year}-${monthNum.toString().padStart(2, '0')}`;
      
      const [{ income }] = await this.dataSource.query(`SELECT SUM(amount) as income FROM transactions WHERE type = 'income' AND transactionDate LIKE ?`, [`${monthPrefix}%`]);
      const [{ expense }] = await this.dataSource.query(`SELECT SUM(amount) as expense FROM transactions WHERE type = 'expense' AND transactionDate LIKE ?`, [`${monthPrefix}%`]);
      
      monthlyTrend.push({
        name: monthStr,
        bagis: Number(income) || 0,
        gider: Number(expense) || 0
      });
    }

    // Recent Transactions
    const recentTransactions = await this.dataSource.query(`
      SELECT id, type as typeRaw, description, transactionDate as createdAt, amount 
      FROM transactions 
      ORDER BY transactionDate DESC 
      LIMIT 5
    `);
    
    const mappedTransactions = recentTransactions.map((t: any) => ({
      ...t,
      type: t.typeRaw === 'income' ? 'in' : 'out'
    }));

    return {
      totalCurrentAccounts: Number(totalCurrentAccounts) || 0,
      totalProjects: Number(totalProjects) || 0,
      totalBalance: totalBalance || 0,
      totalUsers: Number(totalUsers) || 0,
      totalHouseholds: Number(totalHouseholds) || 0,
      monthlyTrend,
      recentTransactions: mappedTransactions
    };
  }
}
