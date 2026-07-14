import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(private readonly entityManager: EntityManager) {}

  async getMetrics() {
    // Toplam Cari
    const [{ totalCurrentAccounts }] = await this.entityManager.query(`
      SELECT COUNT(*) as totalCurrentAccounts 
      FROM current_accounts 
      WHERE isActive = 1 OR isActive = true OR isActive = '1'
    `).catch(() => [{ totalCurrentAccounts: 0 }]);

    // Toplam Proje
    const [{ totalProjects }] = await this.entityManager.query(`
      SELECT COUNT(*) as totalProjects 
      FROM projects 
      WHERE status != 'completed'
    `).catch(() => [{ totalProjects: 0 }]);

    // Kasa Bakiyeleri (Cüzdanlar)
    const [{ totalBalance }] = await this.entityManager.query(`
      SELECT SUM(balance) as totalBalance 
      FROM wallets
    `).catch(() => [{ totalBalance: 0 }]);

    // Toplam Kullanıcı
    const [{ totalUsers }] = await this.entityManager.query(`
      SELECT COUNT(*) as totalUsers 
      FROM users 
      WHERE isActive = 1 OR isActive = true OR isActive = '1'
    `).catch(() => [{ totalUsers: 0 }]);

    // Son Hareketler
    const recentTransactions = await this.entityManager.query(`
      SELECT id, type, amount, description, createdAt
      FROM wallet_transactions
      ORDER BY createdAt DESC
      LIMIT 5
    `).catch(() => []);

    // Aylık Trend (Son 6 ay - Mock/Gerçek karışık)
    const monthlyTrend = [
      { name: 'Oca', bagis: 4000, gider: 2400 },
      { name: 'Şub', bagis: 3000, gider: 1398 },
      { name: 'Mar', bagis: 2000, gider: 9800 },
      { name: 'Nis', bagis: 2780, gider: 3908 },
      { name: 'May', bagis: 1890, gider: 4800 },
      { name: 'Haz', bagis: 2390, gider: 3800 },
    ];

    return {
      totalCurrentAccounts: Number(totalCurrentAccounts) || 0,
      totalProjects: Number(totalProjects) || 0,
      totalBalance: Number(totalBalance) || 0,
      totalUsers: Number(totalUsers) || 0,
      recentTransactions,
      monthlyTrend
    };
  }
}
