import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, CreditCard } from 'lucide-react';
import api from './api';

export default function CurrentAccountTransactionsTab({ accountId }: { accountId: string }) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get(`/wallets/transactions/all?currentAccountId=${accountId}`);
        setTransactions(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (accountId) fetchTransactions();
  }, [accountId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Hesap ekstresi yükleniyor...</div>;

  // Calculate overall balance
  let totalIncome = 0;
  let totalExpense = 0;
  transactions.forEach(t => {
    if (t.type === 'INCOME') totalIncome += Number(t.amount);
    else totalExpense += Number(t.amount);
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Toplam Alacak (Giriş)</p>
            <p className="text-xl font-bold text-emerald-700">{totalIncome.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</p>
          </div>
          <ArrowDownRight className="w-8 h-8 text-emerald-500/50" />
        </div>
        <div className="bg-rose-50 rounded-xl p-4 border border-rose-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-rose-600 font-bold uppercase tracking-wider mb-1">Toplam Borç (Çıkış)</p>
            <p className="text-xl font-bold text-rose-700">{totalExpense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</p>
          </div>
          <ArrowUpRight className="w-8 h-8 text-rose-500/50" />
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Net Bakiye</p>
            <p className="text-xl font-bold text-blue-700">{(totalIncome - totalExpense).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</p>
          </div>
          <CreditCard className="w-8 h-8 text-blue-500/50" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-500">Tarih</th>
              <th className="px-4 py-3 font-medium text-gray-500">Fiş No</th>
              <th className="px-4 py-3 font-medium text-gray-500">İşlem / Kasa</th>
              <th className="px-4 py-3 font-medium text-gray-500">Açıklama</th>
              <th className="px-4 py-3 font-medium text-gray-500 text-right">Tutar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Bu cari hesaba ait finansal işlem bulunmamaktadır.</td></tr>
            ) : (
              transactions.map(t => (
                <tr key={t.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-600">{new Date(t.transactionDate).toLocaleDateString('tr-TR')}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{t.receiptNumber || '-'}</td>
                  <td className="px-4 py-3 text-gray-900">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mr-2 ${t.type === 'INCOME' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {t.type === 'INCOME' ? 'GİRİŞ' : 'ÇIKIŞ'}
                    </span>
                    {t.wallet?.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600 truncate max-w-xs" title={t.description}>{t.description}</td>
                  <td className={`px-4 py-3 text-right font-medium ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{Number(t.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {t.currency}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
