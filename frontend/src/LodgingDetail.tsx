import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from './api';
import { Building2, ArrowLeft, Plus, CheckCircle, Clock, Banknote, Calendar, CreditCard } from 'lucide-react';

export default function LodgingDetail() {
  const { id } = useParams();
  const [lodging, setLodging] = useState<any>(null);
  const [accruals, setAccruals] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('accruals');

  // Modals
  const [showAccrualModal, setShowAccrualModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Forms
  const [accrualForm, setAccrualForm] = useState({ period: '', amount: '', currency: 'TRY' });
  const [paymentForm, setPaymentForm] = useState({ accrualId: 0, amount: '', wallet_id: '', transaction_date: new Date().toISOString().split('T')[0], notes: '' });

  // References
  const [wallets, setWallets] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    loadWallets();
  }, [id]);

  const loadData = async () => {
    try {
      const lRes = await api.get(`/lodgings/${id}`);
      setLodging(lRes.data);
      if (lRes.data) {
        setAccrualForm(prev => ({ ...prev, amount: lRes.data.rentAmount, currency: lRes.data.rentCurrency }));
      }
      
      const accRes = await api.get(`/lodgings/${id}/accruals`);
      setAccruals(accRes.data);
      
      const payRes = await api.get(`/lodgings/${id}/payments`);
      setPayments(payRes.data);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Hata oluştu');
    }
  };

  const loadWallets = async () => {
    try {
      const wRes = await api.get('/wallets');
      setWallets(wRes.data);
      if (wRes.data.length > 0) {
        setPaymentForm(prev => ({ ...prev, wallet_id: wRes.data[0].id }));
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleCreateAccrual = async () => {
    try {
      await api.post(`/lodgings/${id}/accruals`, accrualForm);
      setShowAccrualModal(false);
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Tahakkuk oluşturulamadı.');
    }
  };

  const handleMakePayment = async () => {
    try {
      await api.post(`/lodgings/${id}/payments`, paymentForm);
      setShowPaymentModal(false);
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Ödeme işlemi başarısız.');
    }
  };

  if (!lodging) return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/lodgings" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{lodging.name}</h1>
              <p className="text-gray-500">{lodging.address}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl text-sm font-medium ${lodging.isRented ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {lodging.isRented ? 'Kirada' : 'Boşta'}
          </div>
          {!lodging.isActive && <div className="px-4 py-2 rounded-xl text-sm font-medium bg-red-100 text-red-800">Arşivli</div>}
        </div>
      </div>

      {/* Grid Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500 mb-1">Kira Bedeli</div>
          <div className="text-2xl font-bold text-gray-900">
            {lodging.rentAmount ? `${Number(lodging.rentAmount).toLocaleString('tr-TR')} ${lodging.rentCurrency}` : '-'}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500 mb-1">Kiracı Cari ID</div>
          <div className="text-2xl font-bold text-gray-900">{lodging.tenantCaId || '-'}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500 mb-1">Ödeme Günü</div>
          <div className="text-2xl font-bold text-gray-900">{lodging.rentPaymentDay ? `Ayın ${lodging.rentPaymentDay}. günü` : '-'}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500 mb-1">Toplam Tahakkuk</div>
          <div className="text-2xl font-bold text-amber-600">{accruals.length} Adet</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('accruals')}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'accruals' ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50/30' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            Tahakkuklar (Borçlandırma)
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'payments' ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50/30' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            Ödeme Geçmişi
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'accruals' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Kira Tahakkukları</h3>
                <button
                  onClick={() => setShowAccrualModal(true)}
                  className="px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" /> Yeni Tahakkuk Ekle
                </button>
              </div>
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dönem</th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tutar</th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ödenen</th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Durum</th>
                      <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {accruals.map(a => (
                      <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{a.period}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-900">
                          {Number(a.amount).toLocaleString('tr-TR')} {a.currency}
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-900">
                          {Number(a.totalPaid).toLocaleString('tr-TR')} {a.currency}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            a.status === 'Ödendi' ? 'bg-green-50 text-green-700 border-green-200' :
                            a.status === 'Eksik Ödeme' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {a.status === 'Ödendi' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            {a.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {a.status !== 'Ödendi' && (
                            <button
                              onClick={() => {
                                setPaymentForm(prev => ({
                                  ...prev,
                                  accrualId: a.id,
                                  amount: (Number(a.amount) - Number(a.totalPaid)).toString()
                                }));
                                setShowPaymentModal(true);
                              }}
                              className="text-sm font-medium text-amber-600 hover:text-amber-800"
                            >
                              Ödeme Yap
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {accruals.length === 0 && (
                      <tr><td colSpan={5} className="py-8 text-center text-gray-500">Kayıtlı tahakkuk bulunamadı.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Tahsil Edilen Ödemeler</h3>
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tarih</th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">İşlem No (Finansal)</th>
                      <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Tutar</th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Notlar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {payments.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4 text-sm text-gray-900">{p.paymentDate}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">#{p.transactionId}</td>
                        <td className="py-3 px-4 text-right font-mono text-gray-900">{Number(p.amount).toLocaleString('tr-TR')}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">{p.notes || '-'}</td>
                      </tr>
                    ))}
                    {payments.length === 0 && (
                      <tr><td colSpan={4} className="py-8 text-center text-gray-500">Ödeme kaydı bulunamadı.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Accrual Modal */}
      {showAccrualModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-600" />
                Yeni Kira Tahakkuku Oluştur
              </h2>
              <button onClick={() => setShowAccrualModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Dönem (Örn: 2026-07)</label>
                <input type="text" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-600 transition-all text-sm font-medium font-mono" placeholder="YYYY-MM" value={accrualForm.period} onChange={e => setAccrualForm({...accrualForm, period: e.target.value})} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Tutar</label>
                  <input type="number" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-600 transition-all text-sm font-bold text-gray-800" value={accrualForm.amount} onChange={e => setAccrualForm({...accrualForm, amount: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Para Birimi</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-600 transition-all text-sm font-semibold text-gray-700" value={accrualForm.currency} onChange={e => setAccrualForm({...accrualForm, currency: e.target.value})}>
                    <option value="TRY">TRY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button onClick={() => setShowAccrualModal(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button onClick={handleCreateAccrual} className="px-6 py-2.5 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors shadow-md shadow-amber-600/10 text-sm">Oluştur</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Banknote className="h-5 w-5 text-amber-600" />
                Kira Ödemesi Al
              </h2>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Kasa / Cüzdan (Ödeme Girişi)</label>
                <select className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-600 transition-all text-sm font-medium text-gray-700" value={paymentForm.wallet_id} onChange={e => setPaymentForm({...paymentForm, wallet_id: e.target.value})}>
                  <option value="">Seçiniz</option>
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({Number(w.balance).toLocaleString('tr-TR')} {w.currency})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Ödenen Tutar</label>
                  <input type="number" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-600 transition-all text-sm font-bold text-gray-800 font-mono" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">İşlem Tarihi</label>
                  <input type="date" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-600 transition-all text-sm font-medium text-gray-700" value={paymentForm.transaction_date} onChange={e => setPaymentForm({...paymentForm, transaction_date: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Not (İsteğe bağlı)</label>
                <input type="text" placeholder="Açıklama giriniz..." className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-600 transition-all text-sm font-medium text-gray-700" value={paymentForm.notes} onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})} />
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button onClick={() => setShowPaymentModal(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button onClick={handleMakePayment} className="px-6 py-2.5 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors shadow-md shadow-amber-600/10 text-sm flex items-center gap-2">
                  <Banknote className="w-4 h-4" /> Tahsil Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
