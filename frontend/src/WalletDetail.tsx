import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Wallet as WalletIcon, ArrowDownRight, ArrowUpRight, FileText, Download, ArrowLeft, Edit, Trash2, Paperclip } from 'lucide-react';
import api from './api';
import ItemPicker from './components/ItemPicker';
import DocumentsModal from './components/DocumentsModal';
import QuickCreateCurrentAccountModal from './QuickCreateCurrentAccountModal';
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

export default function WalletDetail() {
  const { id } = useParams<{ id: string }>();
  const { activePlugins } = usePluginContext();
  const navigate = useNavigate();
  
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentAccounts, setCurrentAccounts] = useState<CurrentAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'income'|'expense'>('income');
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [quickCreateSearch, setQuickCreateSearch] = useState('');
  
  // Track context for QuickCreateModal
  const [quickCreateContext, setQuickCreateContext] = useState<'tx' | 'edit'>('tx');
  
  const todayDate = new Date().toISOString().split('T')[0];
  const [txForm, setTxForm] = useState({ 
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

  const [documentModalTxId, setDocumentModalTxId] = useState<number | null>(null);
  const [settings, setSettings] = useState<any>({
    vakif_adi: 'İlim ve Hizmet Vakfı',
    telefon: '',
    email: '',
    adres: ''
  });

  const fetchData = async () => {
    try {
      const [walletRes, txRes, caRes, settingsRes] = await Promise.all([
        api.get(`/wallets/${id}`),
        api.get(`/wallets/transactions/all?walletId=${id}`),
        api.get('/current-accounts'),
        api.get('/settings').catch(() => null)
      ]);
      setWallet(walletRes.data);
      setTransactions(txRes.data);
      setCurrentAccounts(caRes.data);
      if (settingsRes && settingsRes.data) {
        setSettings(settingsRes.data);
      }
    } catch (err) {
      console.error(err);
      alert('Veri yüklenirken hata oluştu.');
      navigate('/wallets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handlePrintReceipt = async (tx: Transaction) => {
    // Gider/Ödeme işlemlerinde eğer yüklenmiş bir fatura/dekont dosyası varsa onu göster
    if (tx.type === 'expense') {
      try {
        const docRes = await api.get(`/wallets/transactions/${tx.id}/documents`);
        if (docRes.data && docRes.data.length > 0) {
          const firstDoc = docRes.data[0];
          window.open(`http://localhost:3000${firstDoc.fileUrl}`, '_blank');
          return;
        }
      } catch (err) {
        console.error('Dökümanlar yüklenirken hata oluştu:', err);
      }
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up engelleyiciyi devre dışı bırakarak tekrar deneyin.');
      return;
    }
    
    const dateStr = new Date(tx.transactionDate || todayDate).toLocaleString('tr-TR');
    const caName = tx.currentAccount?.name || currentAccounts.find(ca => ca.id === Number((tx as any).currentAccountId))?.name || 'Genel Cari';
    
    const isExpense = tx.type === 'expense';
    const mainTitle = isExpense ? 'Ödeme Makbuzu' : 'Tahsilat Makbuzu';
    const subtitle = isExpense ? 'ÖDEME MAKBUZU / TEDİYE FİŞİ' : 'TAHSİLAT MAKBUZU / DEKONT';
    const amountLabel = isExpense ? 'ÖDENEN TUTAR' : 'ÖDEME TUTARI';

    printWindow.document.write(`
      <html>
        <head>
          <title>${mainTitle} - ${tx.receiptNumber || 'Makbuz'}</title>
          <style>
            @page { size: A5 landscape; margin: 5mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 10px; color: #1f2937; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .receipt-box { border: 2px solid #10b981; border-radius: 16px; padding: 15px 20px; width: 190mm; height: 128mm; box-sizing: border-box; margin: 0 auto; display: flex; flex-direction: column; justify-content: space-between; background-color: #ffffff; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #10b981; padding-bottom: 8px; margin-bottom: 12px; }
            .title { font-size: 18px; font-weight: 800; margin: 0; color: #111827; letter-spacing: -0.5px; }
            .subtitle { font-size: 11px; color: #10b981; margin: 3px 0 0 0; font-weight: 700; text-transform: uppercase; tracking-wider; }
            .receipt-no { font-family: monospace; font-size: 13px; font-weight: 700; color: #10b981; background-color: #f0fdf4; padding: 4px 8px; border-radius: 8px; border: 1px solid #bbf7d0; }
            .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .row { display: flex; align-items: baseline; font-size: 12px; }
            .col-span-2 { grid-column: span 2; }
            .label { font-weight: 600; color: #4b5563; width: 100px; flex-shrink: 0; }
            .value { border-bottom: 1px dashed #d1d5db; flex-grow: 1; margin-left: 8px; text-align: left; color: #111827; font-weight: 500; padding-bottom: 1px; }
            .amount-section { display: flex; justify-content: space-between; align-items: center; background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 8px 12px; border-radius: 10px; margin-top: 10px; }
            .amount-label { font-size: 13px; font-weight: 700; color: #15803d; }
            .amount-val { font-size: 20px; font-weight: 900; color: #15803d; }
            .footer { display: flex; justify-content: space-between; font-size: 11px; margin-top: 10px; }
            .signature-box { border-top: 1px solid #d1d5db; width: 150px; text-align: center; padding-top: 4px; margin-top: 20px; color: #6b7280; font-weight: 500; }
            .contact-info { border-top: 1px solid #f3f4f6; padding-top: 6px; margin-top: 10px; font-size: 10px; color: #9ca3af; text-align: center; }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            <div class="header">
              <div>
                <h1 class="title">${settings.vakif_adi || 'İlim ve Hizmet Vakfı'}</h1>
                <p class="subtitle">${subtitle}</p>
                ${settings.vergi_dairesi || settings.vergi_no ? `
                  <p style="margin: 2px 0 0 0; font-size: 10px; color: #6b7280; font-weight: 500;">
                    ${settings.vergi_dairesi ? settings.vergi_dairesi + ' V.D.' : ''} 
                    ${settings.vergi_no ? ' • VKN: ' + settings.vergi_no : ''}
                  </p>
                ` : ''}
              </div>
              <div class="receipt-no">
                No: ${tx.receiptNumber || '-'}
              </div>
            </div>
            
            <div class="content-grid">
              <div class="row">
                <span class="label">Tarih:</span>
                <span class="value">${dateStr}</span>
              </div>
              <div class="row">
                <span class="label">Kasa / Hesap:</span>
                <span class="value">${wallet?.name || '-'}</span>
              </div>
              <div class="row col-span-2">
                <span class="label">İlgili Cari:</span>
                <span class="value" style="font-weight: 700;">${caName}</span>
              </div>
              <div class="row col-span-2">
                <span class="label">Açıklama:</span>
                <span class="value">${tx.description || '-'}</span>
              </div>
            </div>

            ${settings.izin_no || settings.izin_tarihi ? `
              <div style="font-size: 10px; color: #15803d; background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 5px 10px; border-radius: 8px; margin-top: 5px; text-align: left; line-height: 1.2;">
                <strong>Bağış Kabul İzin Bilgisi:</strong>
                ${settings.izin_tarihi ? ' Tarih: ' + new Date(settings.izin_tarihi).toLocaleDateString('tr-TR') : ''}
                ${settings.izin_no ? ' • Sayı/No: ' + settings.izin_no : ''}
              </div>
            ` : ''}
            
            <div class="amount-section">
              <span class="amount-label">${amountLabel}</span>
              <span class="amount-val">${Number(tx.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${tx.currency}</span>
            </div>
            
            <div class="footer">
              <div>
                <p style="margin: 0;">Tahsil Eden (Yetkili)</p>
                <div class="signature-box">İmza</div>
              </div>
              <div>
                <p style="margin: 0;">Ödeyen / Teslim Eden</p>
                <div class="signature-box">İmza</div>
              </div>
            </div>
            
            <div class="contact-info">
              ${settings.adres || ''} ${settings.telefon ? ' • Tel: ' + settings.telefon : ''} ${settings.email ? ' • E-Posta: ' + settings.email : ''}
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 1000);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/wallets/transaction', {
        walletId: Number(id),
        type: transactionType,
        currency: txForm.currency,
        amount: Number(txForm.amount),
        description: txForm.description,
        transactionDate: txForm.transactionDate,
        currentAccountId: txForm.currentAccountId ? Number(txForm.currentAccountId) : undefined
      });
      setIsTransactionModalOpen(false);
      setTxForm({ ...txForm, amount: '', description: '' });
      fetchData();
      
      if (transactionType === 'income' && res.data) {
        setTimeout(() => {
          if (window.confirm('Gelir kaydı başarıyla oluşturuldu. Tahsilat makbuzu yazdırmak ister misiniz?')) {
            handlePrintReceipt(res.data);
          }
        }, 100);
      }
    } catch (err) {
      console.error(err);
      alert('İşlem başarısız');
    }
  };

  const handleDeleteTx = async (tx: Transaction) => {
    if (!window.confirm('Bu işlemi silmek istediğinize emin misiniz? (Bağlantılı işlemler de otomatik silinecektir)')) return;
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
      walletId: wallet ? wallet.id.toString() : ''
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

  const getWalletStats = () => {
    const stats: Record<string, { income: number, expense: number }> = {};
    transactions.forEach(t => {
      if (!stats[t.currency]) stats[t.currency] = { income: 0, expense: 0 };
      if (t.type === 'income') stats[t.currency].income += Number(t.amount);
      if (t.type === 'expense') stats[t.currency].expense += Number(t.amount);
    });
    return stats;
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;
  }

  if (!wallet) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Back Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <button 
            onClick={() => navigate('/wallets')}
            className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 mb-2 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" /> Kasalara Dön
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <WalletIcon className="h-6 w-6 text-emerald-600" />
            {wallet.name} 
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {wallet.groupType} - {wallet.fundType} {wallet.linkedCurrentAccount ? `(Emanetçi: ${wallet.linkedCurrentAccount.name})` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => {
              setTransactionType('income');
              setIsTransactionModalOpen(true);
            }}
            className="px-4 py-2 bg-emerald-50 text-emerald-700 font-medium rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1 border border-emerald-100"
          >
            <ArrowDownRight className="h-4 w-4" /> Tahsilat
          </button>
          <button onClick={() => {
              setTransactionType('expense');
              setIsTransactionModalOpen(true);
            }}
            className="px-4 py-2 bg-red-50 text-red-700 font-medium rounded-xl hover:bg-red-100 transition-colors flex items-center gap-1 border border-red-100"
          >
            <ArrowUpRight className="h-4 w-4" /> Ödeme
          </button>
          <button onClick={() => window.print()} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-1 shadow-sm">
            <Download className="h-4 w-4" /> Ekstre İndir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Balances Section */}
        <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h4 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider flex items-center gap-2">
            Cüzdanlar (Anlık Bakiyeler)
          </h4>
          <div className="flex gap-4 flex-wrap">
            {wallet.balances && wallet.balances.length > 0 ? (
              wallet.balances.map(b => (
                <div key={b.id} className={`flex-1 min-w-[150px] px-5 py-4 rounded-xl border relative overflow-hidden ${Number(b.balance) < 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                  <div className={`text-xs font-semibold mb-1 ${Number(b.balance) < 0 ? 'text-red-600' : 'text-emerald-700'}`}>{b.currency} Cüzdanı</div>
                  <div className={`text-3xl font-black ${Number(b.balance) < 0 ? 'text-red-700' : 'text-emerald-800'}`}>
                    {Number(b.balance).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="absolute -right-4 -bottom-4 opacity-10">
                    <WalletIcon className="h-20 w-20" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 py-6 px-4 w-full text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                Kasa tamamen boş. Yeni işlem (tahsilat/ödeme) yapıldığında ilgili döviz cüzdanı otomatik olarak oluşacaktır.
              </div>
            )}
          </div>
        </div>

        {/* Aggregate Stats */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
          <h4 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Toplam Nakit Akışı</h4>
          <div className="space-y-4">
            {Object.entries(getWalletStats()).map(([curr, stats]) => (
              <div key={curr} className="flex justify-between items-center text-sm border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <span className="font-bold text-gray-700 text-lg">{curr}</span>
                <div className="text-right">
                  <div className="text-emerald-600 font-bold flex items-center gap-1 justify-end"><ArrowDownRight className="h-3 w-3"/> +{stats.income.toLocaleString('tr-TR')}</div>
                  <div className="text-red-600 font-bold flex items-center gap-1 justify-end mt-0.5"><ArrowUpRight className="h-3 w-3"/> -{stats.expense.toLocaleString('tr-TR')}</div>
                </div>
              </div>
            ))}
            {Object.keys(getWalletStats()).length === 0 && (
              <div className="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-lg">İşlem verisi yok</div>
            )}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-white flex justify-between items-center">
          <h4 className="font-bold text-gray-900 text-lg">Kasa Hareketleri (Döküm)</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold border-b border-gray-100">Fiş No</th>
                <th className="px-6 py-4 font-semibold border-b border-gray-100">Tarih</th>
                <th className="px-6 py-4 font-semibold border-b border-gray-100">Döviz</th>
                <th className="px-6 py-4 font-semibold border-b border-gray-100">Açıklama / İlgili Cari</th>
                <th className="px-6 py-4 font-semibold border-b border-gray-100 text-right">Gelir (+)</th>
                <th className="px-6 py-4 font-semibold border-b border-gray-100 text-right">Gider (-)</th>
                <th className="px-6 py-4 font-semibold border-b border-gray-100 text-center">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 bg-white">Bu kasada gösterilecek bir işlem dökümü bulunmuyor.</td>
                </tr>
              ) : (
                transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-emerald-50/30 transition-colors bg-white group">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{tx.receiptNumber || '-'}</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{new Date(tx.transactionDate).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td className="px-6 py-4 text-gray-700 font-medium">
                      <span className="bg-gray-100 px-2.5 py-1 rounded-md text-xs border border-gray-200">{tx.currency}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">{tx.description}</div>
                      {tx.currentAccount && (
                        <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                          Cari: <span className="font-bold">{tx.currentAccount.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {tx.type === 'income' ? (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                          {Number(tx.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </span>
                      ) : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {tx.type === 'expense' ? (
                        <span className="text-red-700 font-bold bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                          {Number(tx.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </span>
                      ) : <span className="text-gray-300">-</span>}
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
                        <button onClick={() => handlePrintReceipt(tx)} className="p-1.5 text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-emerald-600 rounded-md transition-colors" title="Dekont Yazdır">
                          <FileText className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Income/Expense Modal */}
      {isTransactionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsTransactionModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className={`px-6 py-4 border-b border-gray-100 text-white ${transactionType === 'income' ? 'bg-emerald-600' : 'bg-red-600'} flex items-center gap-2`}>
              {transactionType === 'income' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
              <h3 className="text-lg font-bold">{transactionType === 'income' ? 'Gelir Ekle (Tahsilat)' : 'Gider Ekle (Ödeme)'}</h3>
            </div>
            <form onSubmit={handleTransactionSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Döviz Cinsi</label>
                  <select required className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 bg-gray-50" value={txForm.currency} onChange={e => setTxForm({...txForm, currency: e.target.value})}>
                    <option value="TRY">TRY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tutar</label>
                  <input required type="number" step="0.01" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 font-bold text-gray-800" value={txForm.amount} onChange={e => setTxForm({...txForm, amount: e.target.value})} />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">İşlem Tarihi</label>
                  <input required type="date" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-emerald-500" value={txForm.transactionDate} onChange={e => setTxForm({...txForm, transactionDate: e.target.value})} />
                </div>

                {activePlugins.includes('current-accounts') && (
                  <div className="col-span-2">
                    <ItemPicker
                      label="İlgili Kişi / Cari Hesap (İsteğe Bağlı)"
                      placeholder="İşlem yapılan kişiyi seçin..."
                      options={currentAccounts.map(ca => ({ id: ca.id, name: ca.name, badge: 'Cari' }))}
                      value={txForm.currentAccountId ? Number(txForm.currentAccountId) : ''}
                      onChange={(val) => setTxForm({...txForm, currentAccountId: val.toString()})}
                      onAddNew={(search) => {
                        setQuickCreateContext('tx');
                        setQuickCreateSearch(search);
                        setIsQuickCreateOpen(true);
                      }}
                    />
                  </div>
                )}

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                  <input required type="text" placeholder="Örn: Bağış Tahsilatı" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-emerald-500" value={txForm.description} onChange={e => setTxForm({...txForm, description: e.target.value})} />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsTransactionModalOpen(false)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors">İptal</button>
                <button type="submit" className={`px-6 py-2 text-white font-medium rounded-xl shadow-sm transition-colors ${transactionType === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
                  {transactionType === 'income' ? 'Geliri Kaydet' : 'Gideri Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className={`px-6 py-4 border-b border-gray-100 text-white bg-blue-600 flex items-center gap-2`}>
              <Edit className="h-5 w-5" />
              <h3 className="text-lg font-bold">İşlemi Düzenle</h3>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 text-xs text-blue-700 bg-blue-50 p-2 rounded-lg mb-2">
                  Not: Virman veya kur farkı işlemlerinin tutar ve döviz bilgilerini doğrudan değiştiremezsiniz.
                </div>
                
                <div className="col-span-2 flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Döviz</label>
                    <select required className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500" value={editForm.currency} onChange={e => setEditForm({...editForm, currency: e.target.value})}>
                      <option value="TRY">TRY</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tutar</label>
                    <input required type="number" step="0.01" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 font-bold" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})} />
                  </div>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">İşlem Tarihi</label>
                  <input required type="date" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500" value={editForm.transactionDate} onChange={e => setEditForm({...editForm, transactionDate: e.target.value})} />
                </div>

                {activePlugins.includes('current-accounts') && (
                  <div className="col-span-2">
                    <ItemPicker
                      label="İlgili Cari Hesap"
                      placeholder="Değiştirmek için seçin..."
                      options={currentAccounts.map(ca => ({ id: ca.id, name: ca.name, badge: 'Cari' }))}
                      value={editForm.currentAccountId ? Number(editForm.currentAccountId) : ''}
                      onChange={(val) => setEditForm({...editForm, currentAccountId: val.toString()})}
                      onAddNew={(search) => {
                        setQuickCreateContext('edit');
                        setQuickCreateSearch(search);
                        setIsQuickCreateOpen(true);
                      }}
                    />
                  </div>
                )}

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                  <input required type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors">İptal</button>
                <button type="submit" className={`px-6 py-2 text-white font-medium rounded-xl shadow-sm transition-colors bg-blue-600 hover:bg-blue-700`}>
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
        isOpen={isQuickCreateOpen}
        initialName={quickCreateSearch}
        defaultTypeName="Genel Cari"
        onClose={() => setIsQuickCreateOpen(false)}
        onCreated={(newAccount) => {
          fetchData(); // We need to ensure we have this function or use api.get
          if (quickCreateContext === 'tx') {
            setTxForm(prev => ({...prev, currentAccountId: newAccount.id.toString()}));
          } else if (quickCreateContext === 'edit') {
            setEditForm(prev => ({...prev, currentAccountId: newAccount.id.toString()}));
          }
          setIsQuickCreateOpen(false);
        }}
      />
    </div>
  );
}
