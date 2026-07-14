import React, { useState, useEffect } from 'react';
import { Plus, Wallet as WalletIcon, ArrowRightLeft, ArrowUpRight, ArrowDownRight, History, FileText, Download, Edit, Trash2, Paperclip } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DocumentsModal from './components/DocumentsModal';
import ItemPicker from './components/ItemPicker';
import type { PickerOption } from './components/ItemPicker';
import QuickCreateCurrentAccountModal from './QuickCreateCurrentAccountModal';
import api from './api';
import { usePluginContext } from './PluginContext';

interface WalletBalance {
  id: number;
  currency: string;
  balance: number;
}

interface Wallet {
  id: number;
  name: string;
  balances: WalletBalance[];
  groupType: string;
  fundType: string;
  linkedCurrentAccount?: { id: number, name: string };
  bankName?: string;
  branchName?: string;
  iban?: string;
  isActive: boolean;
}

interface CurrentAccount {
  id: number;
  name: string;
}

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  description: string;
  receiptNumber?: string;
  transactionDate: string;
  wallet: Wallet;
  currentAccount?: CurrentAccount;
  linkedTransactionId?: number;
}

export default function Wallets() {
  const navigate = useNavigate();
  const { activePlugins } = usePluginContext();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentAccounts, setCurrentAccounts] = useState<CurrentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [editingWalletId, setEditingWalletId] = useState<number | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'income'|'expense'>('income');

  // Forms
  const [walletForm, setWalletForm] = useState({ 
    name: '', groupType: 'Fiziksel', fundType: 'Genel Fon', linkedCurrentAccountId: '',
    bankName: '', branchName: '', iban: ''
  });
  const [transferForm, setTransferForm] = useState({ 
    fromWalletId: '', toWalletId: '', 
    fromCurrency: 'TRY', toCurrency: 'TRY', 
    amountSent: '', exchangeRate: '', amountReceived: '', 
    description: '' 
  });
  
  const todayDate = new Date().toISOString().split('T')[0];
  const [txForm, setTxForm] = useState({ 
    walletId: '', 
    currency: 'TRY', 
    amount: '', 
    description: '',
    transactionDate: todayDate,
    currentAccountId: ''
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState({
    amount: '',
    currency: 'TRY',
    type: 'income',
    description: '',
    transactionDate: todayDate,
    currentAccountId: '',
    walletId: ''
  });

  // Quick Create states
  const [showQuickCreateModal, setShowQuickCreateModal] = useState(false);
  const [quickCreateSearch, setQuickCreateSearch] = useState('');
  const [quickCreateTarget, setQuickCreateTarget] = useState<'wallet' | 'tx' | 'edit'>('tx');

  const [documentModalTxId, setDocumentModalTxId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [walletRes, txRes, caRes] = await Promise.all([
        api.get('/wallets'),
        api.get('/wallets/transactions/all'),
        api.get('/current-accounts')
      ]);
      
      setWallets(walletRes.data);
      setTransactions(txRes.data);
      setCurrentAccounts(caRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload: any = { ...walletForm };
    if (payload.groupType !== 'Emanet') {
      delete payload.linkedCurrentAccountId;
    } else {
      payload.linkedCurrentAccountId = Number(payload.linkedCurrentAccountId);
    }
    if (payload.groupType !== 'Banka') {
      delete payload.bankName;
      delete payload.branchName;
      delete payload.iban;
    }
    
    try {
      if (editingWalletId) {
        await api.patch(`/wallets/${editingWalletId}`, payload);
      } else {
        await api.post('/wallets', payload);
      }
      setIsWalletModalOpen(false);
      setEditingWalletId(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Kasa kaydedilirken bir hata oluştu');
    }
  };

  const handleDeleteWallet = async (walletId: number) => {
    if (!window.confirm('Bu kasayı silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/wallets/${walletId}`);
      fetchData();
    } catch(err: any) {
      alert(err.response?.data?.message || 'Silme işlemi başarısız. Kasanın içinde işlem olmadığından emin olun.');
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/wallets/transfer', {
        fromWalletId: Number(transferForm.fromWalletId),
        toWalletId: Number(transferForm.toWalletId),
        fromCurrency: transferForm.fromCurrency,
        toCurrency: transferForm.toCurrency,
        amountSent: Number(transferForm.amountSent),
        exchangeRate: transferForm.fromCurrency !== transferForm.toCurrency && transferForm.exchangeRate ? Number(transferForm.exchangeRate) : undefined,
        amountReceived: transferForm.fromCurrency !== transferForm.toCurrency ? Number(transferForm.amountReceived) : undefined,
        description: transferForm.description
      });
      setIsTransferModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Transfer başarısız');
    }
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/wallets/transaction', {
        walletId: Number(txForm.walletId),
        type: transactionType,
        currency: txForm.currency,
        amount: Number(txForm.amount),
        description: txForm.description,
        transactionDate: txForm.transactionDate,
        currentAccountId: txForm.currentAccountId ? Number(txForm.currentAccountId) : undefined
      });
      setIsTransactionModalOpen(false);
      
      // Handle local fetch to refresh tables
      fetchData();
      
    } catch (err) {
      console.error(err);
      alert('İşlem başarısız');
    }
  };

  const handleDeleteTx = async (tx: Transaction) => {
    if (!window.confirm('Bu işlemi silmek istediğinize emin misiniz? (Eğer bu bir virman ise, bağlantılı diğer kasa hareketleri de otomatik silinecektir)')) return;
    try {
      await api.delete(`/wallets/transactions/${tx.id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Silme işlemi başarısız');
    }
  };

  const openEditModal = (tx: Transaction) => {
    setSelectedTx(tx);
    setEditForm({
      amount: tx.amount.toString(),
      currency: tx.currency,
      type: tx.type,
      description: tx.description,
      transactionDate: tx.transactionDate ? tx.transactionDate.split('T')[0] : todayDate,
      currentAccountId: tx.currentAccount ? tx.currentAccount.id.toString() : '',
      walletId: tx.wallet.id.toString()
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx) return;
    try {
      await api.patch(`/wallets/transactions/${selectedTx.id}`, {
        amount: Number(editForm.amount),
        currency: editForm.currency,
        type: editForm.type,
        description: editForm.description,
        transactionDate: editForm.transactionDate,
        currentAccountId: editForm.currentAccountId ? Number(editForm.currentAccountId) : undefined,
        walletId: Number(editForm.walletId)
      });
      setIsEditModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Güncelleme başarısız');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <WalletIcon className="h-6 w-6 text-emerald-600" />
            Kasalar & Finans
          </h1>
          <p className="text-gray-500 mt-1">Sistemdeki tüm kasa bakiyeleri ve para transferleri.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setTransactionType('income'); setIsTransactionModalOpen(true); }} className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 flex items-center gap-2 font-medium shadow-sm transition-colors">
            <ArrowDownRight className="h-4 w-4" /> Gelir
          </button>
          <button onClick={() => { setTransactionType('expense'); setIsTransactionModalOpen(true); }} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center gap-2 font-medium shadow-sm transition-colors">
            <ArrowUpRight className="h-4 w-4" /> Gider
          </button>
          <button onClick={() => setIsTransferModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 font-medium shadow-sm transition-colors">
            <ArrowRightLeft className="h-4 w-4" /> Virman
          </button>
          <button
            onClick={() => {
              setEditingWalletId(null);
              setWalletForm({ name: '', groupType: 'Fiziksel', fundType: 'Genel Fon', linkedCurrentAccountId: '', bankName: '', branchName: '', iban: '' });
              setIsWalletModalOpen(true);
            }}
            className="inline-flex items-center justify-center px-4 py-2 bg-white text-emerald-700 border border-emerald-200 rounded-xl font-medium hover:bg-emerald-50 transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5 mr-2" />
            Yeni Kasa
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(() => {
          const physicalWallets = wallets.filter(w => w.groupType === 'Fiziksel');
          const totals = physicalWallets.reduce((acc, wallet) => {
            wallet.balances?.forEach(b => {
              acc[b.currency] = (acc[b.currency] || 0) + Number(b.balance);
            });
            return acc;
          }, {} as Record<string, number>);

          return Object.entries(totals).map(([currency, total]) => (
            <div key={currency} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-gray-50 to-emerald-50 rounded-bl-full -z-0 opacity-50"></div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 relative z-10">Toplam {currency} (Fiziki)</span>
              <span className={`text-xl font-bold relative z-10 ${total < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ));
        })()}
      </div>

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="animate-pulse bg-white rounded-2xl p-6 border border-gray-100 h-32"></div>
        ) : (
          wallets.map(wallet => {
            const totalBalance = wallet.balances?.reduce((acc, b) => acc + Number(b.balance), 0) || 0;
            return (
              <div key={wallet.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-emerald-50 rounded-bl-full -z-0 opacity-50"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2 group/wallet">
                        {wallet.name}
                        {wallet.groupType === 'Emanet' && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Emanet</span>
                        )}
                        {wallet.groupType === 'Banka' && (
                          <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Banka</span>
                        )}
                        <div className="flex items-center gap-1 opacity-0 group-hover/wallet:opacity-100 transition-opacity ml-1">
                          <button onClick={(e) => {
                            e.stopPropagation();
                            setEditingWalletId(wallet.id);
                            setWalletForm({ 
                              name: wallet.name, 
                              groupType: wallet.groupType, 
                              fundType: wallet.fundType, 
                              linkedCurrentAccountId: wallet.linkedCurrentAccount?.id.toString() || '',
                              bankName: wallet.bankName || '',
                              branchName: wallet.branchName || '',
                              iban: wallet.iban || ''
                            });
                            setIsWalletModalOpen(true);
                          }} className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                            <Edit className="w-3 h-3" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteWallet(wallet.id); }} className="p-1 text-red-600 hover:bg-red-100 rounded">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </h3>
                      {wallet.linkedCurrentAccount && (
                        <p className="text-xs text-gray-500 mt-0.5">Emanetçi: {wallet.linkedCurrentAccount.name}</p>
                      )}
                      {wallet.groupType === 'Banka' && (
                        <div className="mt-1">
                          <p className="text-[11px] text-gray-500 font-medium">Banka: <span className="text-gray-900">{wallet.bankName || '-'} {wallet.branchName ? `(${wallet.branchName})` : ''}</span></p>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">{wallet.iban || 'IBAN Yok'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {wallet.balances && wallet.balances.length > 0 ? (
                      wallet.balances.map(b => (
                        <div key={b.id} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                          <span className="text-xs font-medium px-2 py-1 bg-white border border-gray-200 text-gray-700 rounded-md">
                            {b.currency}
                          </span>
                          <div className={`text-lg font-bold ${b.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                            {b.balance < 0 ? '-' : ''}{Math.abs(Number(b.balance)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-400 italic py-2">Bu kasada henüz bakiye yok.</div>
                    )}
                  </div>

                  {wallet.groupType === 'Emanet' && totalBalance < 0 && (
                    <p className="text-xs text-red-500 font-medium mt-3">Vakıf Borçlu (Emanetçinin Alacağı)</p>
                  )}
                  {wallet.groupType === 'Emanet' && totalBalance > 0 && (
                    <p className="text-xs text-emerald-600 font-medium mt-3">Vakfın Emanetteki Parası</p>
                  )}
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-50 text-xs text-gray-400 flex items-center justify-between relative z-10">
                  <span>{wallet.fundType}</span>
                  <button 
                    onClick={() => navigate(`/wallets/${wallet.id}`)}
                    className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline flex items-center gap-1"
                  >
                    Kasa Detayına Gir <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Transactions History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2">
          <History className="h-5 w-5 text-gray-400" />
          <h3 className="font-semibold text-gray-800">Son İşlem Hareketleri</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Fiş No</th>
                <th className="px-6 py-4 font-medium">Tarih</th>
                <th className="px-6 py-4 font-medium">Kasa</th>
                <th className="px-6 py-4 font-medium">İlgili Cari</th>
                <th className="px-6 py-4 font-medium">Açıklama</th>
                <th className="px-6 py-4 font-medium text-right">Tutar</th>
                <th className="px-6 py-4 font-medium text-center">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.slice(0, 10).map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{tx.receiptNumber || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(tx.transactionDate).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{tx.wallet?.name}</td>
                  <td className="px-6 py-4 text-gray-500">{tx.currentAccount ? tx.currentAccount.name : '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{tx.description}</td>
                  <td className={`px-6 py-4 font-medium text-right ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {tx.type === 'income' ? '+' : '-'} {Number(tx.amount).toLocaleString('tr-TR')} {tx.currency}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setDocumentModalTxId(tx.id)} className="p-1.5 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors" title="Dökümanlar (Dekont vb.)">
                        <Paperclip className="h-4 w-4" />
                      </button>
                      <button onClick={() => openEditModal(tx)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors" title="Düzenle">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteTx(tx)} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors" title="Sil">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wallets Modal */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <WalletIcon className="h-5 w-5 text-emerald-600" />
                {editingWalletId ? 'Kasayı Düzenle' : 'Yeni Kasa Tanımla'}
              </h3>
              <button onClick={() => { setIsWalletModalOpen(false); setEditingWalletId(null); }} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            <form onSubmit={handleWalletSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Kasa Adı</label>
                <input required type="text" placeholder="Örn: Merkez Kasa, Vakıf Banka vb." className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium" value={walletForm.name} onChange={e => setWalletForm({...walletForm, name: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Hesap Türü</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium text-gray-700" value={walletForm.groupType} onChange={e => setWalletForm({...walletForm, groupType: e.target.value})}>
                    <option value="Fiziksel">Fiziksel Kasa</option>
                    <option value="Emanet">Emanet Kasası</option>
                    <option value="Banka">Banka Hesabı</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Fon Türü</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium text-gray-700" value={walletForm.fundType} onChange={e => setWalletForm({...walletForm, fundType: e.target.value})}>
                    <option value="Genel Fon">Genel Fon</option>
                    <option value="Zekat Fonu">Zekat Fonu</option>
                    <option value="Sadaka Fonu">Sadaka Fonu</option>
                    <option value="Kurban Fonu">Kurban Fonu</option>
                    <option value="Proje Fonu">Proje Fonu</option>
                  </select>
                </div>
              </div>

              {walletForm.groupType === 'Banka' && (
                <div className="pt-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Banka Adı</label>
                      <input type="text" placeholder="Örn: Ziraat Bankası" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium" value={walletForm.bankName} onChange={e => setWalletForm({...walletForm, bankName: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Şube Adı</label>
                      <input type="text" placeholder="Örn: Kadıköy Şb." className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium" value={walletForm.branchName} onChange={e => setWalletForm({...walletForm, branchName: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">IBAN</label>
                    <input type="text" placeholder="TR00 0000 0000 0000 0000 0000 00" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium font-mono" value={walletForm.iban} onChange={e => setWalletForm({...walletForm, iban: e.target.value})} />
                  </div>
                </div>
              )}

              {walletForm.groupType === 'Emanet' && activePlugins.includes('current-accounts') && (
                <div className="pt-2">
                  <ItemPicker
                    label="Emanetçi (Cari Hesap)"
                    placeholder="Kişi veya Kurum Seçin..."
                    options={currentAccounts.map(ca => ({ id: ca.id, name: ca.name, badge: 'Cari' }))}
                    value={walletForm.linkedCurrentAccountId ? Number(walletForm.linkedCurrentAccountId) : ''}
                    onChange={(val) => setWalletForm({...walletForm, linkedCurrentAccountId: val.toString()})}
                    onAddNew={(search) => {
                      setQuickCreateSearch(search);
                      setQuickCreateTarget('wallet');
                      setShowQuickCreateModal(true);
                    }}
                  />
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button type="button" onClick={() => { setIsWalletModalOpen(false); setEditingWalletId(null); }} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button type="submit" className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/10 text-sm">{editingWalletId ? 'Güncelle' : 'Kaydet'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-900">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-blue-600" /> Kasalar Arası Virman / Döviz Bozdurma
              </h3>
              <button onClick={() => setIsTransferModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            <form onSubmit={handleTransferSubmit} className="p-6 space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Çıkış Yapılacak Kasa</label>
                  <select required className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium text-gray-700" value={transferForm.fromWalletId} onChange={e => setTransferForm({...transferForm, fromWalletId: e.target.value})}>
                    <option value="">Seçiniz...</option>
                    {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Giriş Yapılacak Kasa</label>
                  <select required className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium text-gray-700" value={transferForm.toWalletId} onChange={e => setTransferForm({...transferForm, toWalletId: e.target.value})}>
                    <option value="">Seçiniz...</option>
                    {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-end bg-blue-50/30 p-4 rounded-2xl border border-blue-100/60 shadow-inner">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-blue-700 mb-1.5 uppercase tracking-wider">Çıkış Dövizi</label>
                  <select className="w-full px-4 py-2.5 border border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white text-sm font-semibold text-gray-700" value={transferForm.fromCurrency} onChange={e => setTransferForm({...transferForm, fromCurrency: e.target.value})}>
                    <option value="TRY">TRY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                  <div className="mt-2.5">
                    <label className="block text-xs font-bold text-blue-700 mb-1.5 uppercase tracking-wider">Gönderilen Tutar</label>
                    <input required type="number" placeholder="0.00" step="0.01" className="w-full px-4 py-2.5 border border-blue-200 rounded-xl outline-none focus:border-blue-500 font-bold bg-white text-sm text-gray-800" value={transferForm.amountSent} onChange={e => setTransferForm({...transferForm, amountSent: e.target.value})} />
                  </div>
                </div>

                <div className="flex justify-center items-center py-2 md:py-0 flex-col self-center">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100 shadow-sm mb-1">
                    <ArrowRightLeft className="h-5 w-5 rotate-90 md:rotate-0" />
                  </div>
                  {transferForm.fromCurrency !== transferForm.toCurrency && (
                    <div className="text-center w-full min-w-[120px]">
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider">Döviz Kuru</label>
                      <input type="number" step="0.0001" placeholder="Örn: 32.50" className="w-full mt-1 px-3 py-1.5 text-xs border border-blue-200 rounded-xl outline-none focus:border-blue-500 text-center bg-white font-semibold" value={transferForm.exchangeRate} onChange={e => {
                        const rate = e.target.value;
                        setTransferForm({...transferForm, exchangeRate: rate, amountReceived: rate && transferForm.amountSent ? (Number(transferForm.amountSent) * Number(rate)).toFixed(2) : transferForm.amountReceived});
                      }} />
                    </div>
                  )}
                </div>

                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-emerald-700 mb-1.5 uppercase tracking-wider">Giriş Dövizi</label>
                  <select className="w-full px-4 py-2.5 border border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white text-sm font-semibold text-gray-700" value={transferForm.toCurrency} onChange={e => setTransferForm({...transferForm, toCurrency: e.target.value})}>
                    <option value="TRY">TRY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                  
                  {transferForm.fromCurrency !== transferForm.toCurrency ? (
                    <div className="mt-2.5">
                      <label className="block text-xs font-bold text-emerald-700 mb-1.5 uppercase tracking-wider">Alınan Net Tutar</label>
                      <input required type="number" placeholder="0.00" step="0.01" className="w-full px-4 py-2.5 border border-emerald-200 rounded-xl outline-none focus:border-emerald-500 font-bold bg-emerald-50 text-sm text-emerald-800" value={transferForm.amountReceived} onChange={e => setTransferForm({...transferForm, amountReceived: e.target.value})} />
                      
                      {/* Kur Farkı Uyarısı */}
                      {transferForm.exchangeRate && transferForm.amountSent && transferForm.amountReceived && (
                        (() => {
                          const theoretical = Number(transferForm.amountSent) * Number(transferForm.exchangeRate);
                          const actual = Number(transferForm.amountReceived);
                          const diff = theoretical - actual;
                          if (Math.abs(diff) > 0.01) {
                            return (
                              <div className={`mt-2 text-[10px] font-semibold p-2.5 rounded-xl border ${diff > 0 ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                {diff > 0 ? `Dikkat: ${diff.toFixed(2)} ${transferForm.toCurrency} kur/komisyon zararı oluştu.` : `Bilgi: ${Math.abs(diff).toFixed(2)} ${transferForm.toCurrency} kur farkı karı oluştu.`}
                              </div>
                            );
                          }
                          return null;
                        })()
                      )}
                    </div>
                  ) : (
                    <div className="mt-2.5 opacity-50">
                      <label className="block text-xs font-bold text-emerald-700 mb-1.5 uppercase tracking-wider">Alınan Tutar</label>
                      <input disabled type="text" className="w-full px-4 py-2.5 border border-emerald-200 rounded-xl bg-gray-100 text-sm font-medium text-gray-500" value="Gönderilen ile aynı" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Açıklama</label>
                <input type="text" placeholder="Örn: Kasalar arası virman" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium" value={transferForm.description} onChange={e => setTransferForm({...transferForm, description: e.target.value})} />
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button type="button" onClick={() => setIsTransferModalOpen(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/10 text-sm">Transferi Tamamla</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Income/Expense Modal */}
      {isTransactionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className={`p-6 border-b border-gray-100/80 text-white ${transactionType === 'income' ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-gradient-to-r from-rose-600 to-red-600'} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                {transactionType === 'income' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                <h3 className="text-lg font-bold">{transactionType === 'income' ? 'Gelir Ekle (Tahsilat)' : 'Gider Ekle (Ödeme)'}</h3>
              </div>
              <button onClick={() => setIsTransactionModalOpen(false)} className="p-2 text-white/75 hover:text-white hover:bg-white/10 rounded-full transition-colors">&times;</button>
            </div>
            <form onSubmit={handleTransactionSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">İşlem Yapılacak Kasa</label>
                  <select required className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium text-gray-700" value={txForm.walletId} onChange={e => setTxForm({...txForm, walletId: e.target.value})}>
                    <option value="">Seçiniz...</option>
                    {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Döviz Cinsi</label>
                  <select required className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium text-gray-700" value={txForm.currency} onChange={e => setTxForm({...txForm, currency: e.target.value})}>
                    <option value="TRY">TRY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Tutar</label>
                <input required type="number" step="0.01" placeholder="0.00" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-bold text-gray-800" value={txForm.amount} onChange={e => setTxForm({...txForm, amount: e.target.value})} />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">İşlem Tarihi</label>
                  <input required type="date" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium text-gray-700" value={txForm.transactionDate} onChange={e => setTxForm({...txForm, transactionDate: e.target.value})} />
                </div>

                {activePlugins.includes('current-accounts') && (
                  <div className="col-span-2 pt-1">
                    <ItemPicker
                      label="İlgili Cari Hesap (İsteğe Bağlı)"
                      placeholder="İşlem yapılan kişiyi seçin..."
                      options={currentAccounts.map(ca => ({ id: ca.id, name: ca.name, badge: 'Cari' }))}
                      value={txForm.currentAccountId ? Number(txForm.currentAccountId) : ''}
                      onChange={(val) => setTxForm({...txForm, currentAccountId: val.toString()})}
                      onAddNew={(search) => {
                        setQuickCreateSearch(search);
                        setQuickCreateTarget('tx');
                        setShowQuickCreateModal(true);
                      }}
                    />
                  </div>
                )}

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Açıklama</label>
                  <input required type="text" placeholder="Örn: Bağış tahsilatı" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium" value={txForm.description} onChange={e => setTxForm({...txForm, description: e.target.value})} />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button type="button" onClick={() => setIsTransactionModalOpen(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button type="submit" className={`px-6 py-2.5 text-white font-semibold rounded-xl shadow-md transition-colors text-sm ${transactionType === 'income' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10' : 'bg-red-600 hover:bg-red-700 shadow-red-600/10'}`}>
                  {transactionType === 'income' ? 'Geliri Kaydet' : 'Gideri Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {/* Edit Modal */}
      {isEditModalOpen && selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 text-white bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                <h3 className="text-lg font-bold">Kasa İşlemini Düzenle</h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-white/75 hover:text-white hover:bg-white/10 rounded-full transition-colors">&times;</button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 text-xs text-blue-700 bg-blue-50 p-2.5 rounded-xl border border-blue-100/60">
                  Not: Virman veya kur farkı işlemlerinin tutar ve döviz bilgilerini doğrudan değiştiremezsiniz. Lütfen silip baştan oluşturun.
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Kasa</label>
                  <select required className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium text-gray-700" value={editForm.walletId} onChange={e => setEditForm({...editForm, walletId: e.target.value})}>
                    {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                
                <div className="col-span-2 flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Döviz</label>
                    <select required className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium text-gray-700" value={editForm.currency} onChange={e => setEditForm({...editForm, currency: e.target.value})}>
                      <option value="TRY">TRY</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Tutar</label>
                    <input required type="number" step="0.01" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-bold text-gray-800" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})} />
                  </div>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">İşlem Tarihi</label>
                  <input required type="date" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium text-gray-700" value={editForm.transactionDate} onChange={e => setEditForm({...editForm, transactionDate: e.target.value})} />
                </div>

                {activePlugins.includes('current-accounts') && (
                  <div className="col-span-2 pt-1">
                    <ItemPicker
                      label="İlgili Cari Hesap"
                      placeholder="Değiştirmek için seçin..."
                      options={currentAccounts.map(ca => ({ id: ca.id, name: ca.name, badge: 'Cari' }))}
                      value={editForm.currentAccountId ? Number(editForm.currentAccountId) : ''}
                      onChange={(val) => setEditForm({...editForm, currentAccountId: val.toString()})}
                      onAddNew={(search) => {
                        setQuickCreateSearch(search);
                        setQuickCreateTarget('edit');
                        setShowQuickCreateModal(true);
                      }}
                    />
                  </div>
                )}

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Açıklama</label>
                  <input required type="text" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/10 text-sm">
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Documents Modal */}
      {documentModalTxId && (
        <DocumentsModal 
          transactionId={documentModalTxId} 
          onClose={() => setDocumentModalTxId(null)} 
        />
      )}

      <QuickCreateCurrentAccountModal 
        isOpen={showQuickCreateModal}
        initialName={quickCreateSearch}
        defaultTypeName="Müşteri"
        onClose={() => setShowQuickCreateModal(false)}
        onCreated={(newAccount) => {
          if (quickCreateTarget === 'wallet') {
            setWalletForm({...walletForm, linkedCurrentAccountId: newAccount.id.toString()});
          } else if (quickCreateTarget === 'tx') {
            setTxForm({...txForm, currentAccountId: newAccount.id.toString()});
          } else if (quickCreateTarget === 'edit') {
            setEditForm({...editForm, currentAccountId: newAccount.id.toString()});
          }
          fetchData();
        }}
      />
    </div>
  );
}
