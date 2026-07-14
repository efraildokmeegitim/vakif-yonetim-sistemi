import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from './api';
import { ArrowLeft, Wallet, Receipt, CheckCircle2 } from 'lucide-react';
import ItemPicker from './ItemPicker';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  
  // Advance Form
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [advanceForm, setAdvanceForm] = useState({ wallet_id: '', amount: '', description: '', transaction_date: new Date().toISOString().split('T')[0] });

  // Settle Form
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settleForm, setSettleForm] = useState<any>({
    wallet_id: '', payment_date: new Date().toISOString().split('T')[0],
    expenses: [{ amount: '', desc: '', type_id: '' }],
    advances_to_settle: []
  });

  const loadData = async () => {
    try {
      const [res, walletRes] = await Promise.all([
        api.get(`/tasks/${id}`),
        api.get('/api/wallets').catch(() => ({ data: [] }))
      ]);
      setData(res.data);
      setWallets(walletRes.data);
    } catch (e: any) {
      if (e.response?.status === 404) navigate('/tasks');
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleAdvance = async () => {
    try {
      await api.post(`/tasks/${id}/advance`, advanceForm);
      setShowAdvanceModal(false);
      loadData();
    } catch (e: any) { alert(e.response?.data?.message || 'Hata'); }
  };

  const handleSettle = async () => {
    try {
      // Validate expenses
      const validExpenses = settleForm.expenses.filter((e: any) => e.amount && parseFloat(e.amount) > 0);
      
      await api.post(`/tasks/${id}/settle`, {
        ...settleForm,
        expenses: validExpenses
      });
      setShowSettleModal(false);
      loadData();
    } catch (e: any) { alert(e.response?.data?.message || 'Hata'); }
  };

  if (!data) return <div className="p-8">Yükleniyor...</div>;
  const { task, transactions, totals, openAdvances } = data;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link to="/tasks" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Görevlere Dön
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h1>
            <p className="text-gray-500">{task.description}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
            task.status === 'Hesap Kapatıldı' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {task.status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-gray-100 mb-6">
          <div><p className="text-sm text-gray-500 mb-1">Görevli Personel</p><p className="font-semibold">{task.personnel_name}</p></div>
          <div><p className="text-sm text-gray-500 mb-1">Son Tarih</p><p className="font-semibold">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</p></div>
          <div><p className="text-sm text-gray-500 mb-1">Verilen Avans</p><p className="font-bold text-blue-600">{totals.advance} TL</p></div>
          <div><p className="text-sm text-gray-500 mb-1">Kayıtlı Masraf</p><p className="font-bold text-red-600">{totals.expense} TL</p></div>
        </div>

        {task.status !== 'Hesap Kapatıldı' && (
          <div className="flex gap-4">
            <button onClick={() => setShowAdvanceModal(true)} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2">
              <Wallet className="w-5 h-5" /> İş Avansı Ver
            </button>
            <button onClick={() => setShowSettleModal(true)} className="px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Görevi Bitir ve Hesabı Kapat
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Receipt className="w-6 h-6" /> Görev Hareketleri</h2>
        <div className="space-y-4">
          {transactions.map((t: any) => (
            <div key={t.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <p className="font-medium">{t.description || t.type_name}</p>
                <p className="text-xs text-gray-500">{new Date(t.transaction_date || t.created_at).toLocaleDateString()}</p>
              </div>
              <p className={`font-bold ${t.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                {t.type === 'expense' ? '-' : '+'}{t.amount} {t.currency || 'TL'}
              </p>
            </div>
          ))}
          {transactions.length === 0 && <p className="text-gray-500 text-center py-4">Kayıtlı hareket bulunmuyor.</p>}
        </div>
      </div>

      {showAdvanceModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">İş Avansı Ver</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Kasa Seçin</label>
                <ItemPicker items={wallets.map((w:any) => ({...w, display: `${w.name} (Bakiye: ${w.balance} ${w.currency})`}))} value={advanceForm.wallet_id} onChange={(v) => setAdvanceForm({...advanceForm, wallet_id: v})} displayKey="display" placeholder="Kasa Seçiniz..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tutar (TL)</label>
                <input type="number" className="w-full border p-2 rounded" value={advanceForm.amount} onChange={e => setAdvanceForm({...advanceForm, amount: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowAdvanceModal(false)} className="px-4 py-2 bg-gray-100 rounded">İptal</button>
              <button onClick={handleAdvance} className="px-4 py-2 bg-blue-600 text-white rounded">Avans Ver</button>
            </div>
          </div>
        </div>
      )}

      {showSettleModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-green-700">Hesap Kapatma</h2>
            <div className="mb-6 p-4 bg-gray-50 border rounded-xl">
              <p className="text-sm font-medium text-gray-700 mb-2">Kapatılacak Avansları Seçin</p>
              {openAdvances.map((adv: any) => (
                <label key={adv.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" onChange={e => {
                    const newSet = e.target.checked 
                      ? [...settleForm.advances_to_settle, adv.id] 
                      : settleForm.advances_to_settle.filter((id: number) => id !== adv.id);
                    setSettleForm({...settleForm, advances_to_settle: newSet});
                  }} />
                  {adv.description} - <b>{adv.amount} {adv.currency}</b>
                </label>
              ))}
              {openAdvances.length === 0 && <p className="text-xs text-gray-500">Açık avans bulunmuyor.</p>}
            </div>

            <div className="mb-6 border-t pt-4">
              <h3 className="font-semibold mb-2">Masrafları Girin</h3>
              {settleForm.expenses.map((exp: any, idx: number) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input type="text" placeholder="Açıklama" className="flex-1 border p-2 rounded text-sm" value={exp.desc} onChange={e => {
                    const exps = [...settleForm.expenses];
                    exps[idx].desc = e.target.value;
                    setSettleForm({...settleForm, expenses: exps});
                  }} />
                  <input type="number" placeholder="Tutar" className="w-24 border p-2 rounded text-sm" value={exp.amount} onChange={e => {
                    const exps = [...settleForm.expenses];
                    exps[idx].amount = e.target.value;
                    setSettleForm({...settleForm, expenses: exps});
                  }} />
                </div>
              ))}
              <button onClick={() => setSettleForm({...settleForm, expenses: [...settleForm.expenses, { amount: '', desc: '', type_id: '' }]})} className="text-sm text-teal-600 hover:underline">+ Masraf Ekle</button>
            </div>

            <div className="mb-6 border-t pt-4">
              <p className="text-sm text-gray-500 mb-2">Eğer alınan avans masraftan fazlaysa, para üstü bu kasaya iade edilir. Masraf avanstan büyükse, personelin cebinden ödediği miktar kasadan personele ödenir.</p>
              <label className="block text-sm font-medium mb-1">İşlem Kasası Seçin</label>
              <ItemPicker items={wallets.map((w:any) => ({...w, display: `${w.name} (Bakiye: ${w.balance} ${w.currency})`}))} value={settleForm.wallet_id} onChange={(v) => setSettleForm({...settleForm, wallet_id: v})} displayKey="display" placeholder="Kasa Seçiniz..." />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowSettleModal(false)} className="px-4 py-2 bg-gray-100 rounded">İptal</button>
              <button onClick={handleSettle} className="px-4 py-2 bg-green-600 text-white rounded font-medium">Hesabı Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
