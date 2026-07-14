import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Building2, Plus, Save, Edit2, Archive, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Lodging {
  id: number;
  name: string;
  address: string;
  isRented: boolean;
  tenantCaId?: number;
  tenantName?: string;
  rentAmount: number;
  rentCurrency: string;
  rentPaymentDay: number;
  isActive: boolean;
}

export default function Lodgings() {
  const [lodgings, setLodgings] = useState<Lodging[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [form, setForm] = useState<any>({
    id: 0,
    name: '',
    address: '',
    isRented: false,
    tenantCaId: '',
    rentAmount: '',
    rentCurrency: 'TRY',
    rentPaymentDay: ''
  });

  const loadData = async () => {
    try {
      const res = await api.get(`/lodgings?status=${showArchived ? 'archived' : 'active'}`);
      setLodgings(res.data);
    } catch (e: any) {
      if (e.response?.status === 403) {
        alert(e.response.data.message);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [showArchived]);

  const handleSave = async () => {
    try {
      const payload = { ...form };
      if (payload.tenantCaId === '') payload.tenantCaId = null;
      if (payload.id) {
        await api.patch(`/lodgings/${payload.id}`, payload);
      } else {
        await api.post('/lodgings', payload);
      }
      setShowModal(false);
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Hata oluştu');
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    if (!confirm(`Lojmanı ${currentStatus ? 'arşivlemek' : 'aktif etmek'} istediğinize emin misiniz?`)) return;
    try {
      await api.patch(`/lodgings/${id}/toggle`);
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Hata oluştu');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-amber-600" />
            Lojman Yönetimi
          </h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2.5 rounded-xl transition-colors font-medium border ${showArchived ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
          >
            {showArchived ? 'Aktif Kayıtları Göster' : 'Arşivlenmiş Kayıtları Göster'}
          </button>
          {!showArchived && (
            <button 
              onClick={() => { 
                setForm({ id: 0, name: '', address: '', isRented: false, tenantCaId: '', rentAmount: '', rentCurrency: 'TRY', rentPaymentDay: '' }); 
                setShowModal(true); 
              }} 
              className="px-5 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Yeni Lojman
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Lojman Adı</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Kira Durumu</th>
              <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Kira Bedeli</th>
              <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {lodgings.map(l => (
              <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="text-sm font-medium text-gray-900">
                    <Link to={`/lodgings/${l.id}`} className="hover:text-amber-600 hover:underline">
                      {l.name}
                    </Link>
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-xs">{l.address}</div>
                </td>
                <td className="py-4 px-6">
                  {l.isRented ? (
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Kirada</span>
                      {l.tenantCaId && <div className="text-xs text-gray-500 mt-1">{l.tenantName || `Cari #${l.tenantCaId}`}</div>}
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Boşta</span>
                  )}
                </td>
                <td className="py-4 px-6 text-right">
                  {l.isRented && l.rentAmount ? (
                    <div className="text-sm font-mono text-gray-900">
                      {Number(l.rentAmount).toLocaleString('tr-TR')} {l.rentCurrency}
                      <div className="text-xs text-gray-500 font-sans">Her ayın {l.rentPaymentDay}. günü</div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="py-4 px-6 text-right">
                  <button onClick={() => { setForm({ ...l }); setShowModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleToggleActive(l.id, l.isActive)} className={`p-2 rounded-lg ml-2 ${l.isActive ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}>
                    {l.isActive ? <Archive className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
            ))}
            {lodgings.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500">
                  {showArchived ? 'Arşivlenmiş lojman kaydı yok.' : 'Kayıtlı lojman bulunamadı.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-600" />
                {form.id ? 'Lojman Düzenle' : 'Yeni Lojman Ekle'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Lojman Adı / No</label>
                <input type="text" placeholder="Örn: Blok A - Daire 4" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-600 transition-all text-sm font-medium" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Adres</label>
                <textarea placeholder="Lojmanın detaylı adresi..." className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-600 transition-all text-sm font-medium h-20 resize-none" rows={3} value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})} />
              </div>
              
              <label className="flex items-center gap-3 p-3 bg-amber-50/30 border border-amber-100/60 rounded-xl cursor-pointer hover:bg-amber-50/60 transition-colors">
                <input type="checkbox" id="isRented" className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500/20" checked={form.isRented} onChange={e => setForm({...form, isRented: e.target.checked})} />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-amber-900">Kirada mı?</p>
                  <p className="text-[10px] text-gray-500">Lojmanın aktif bir kiracısı varsa işaretleyin.</p>
                </div>
              </label>

              {form.isRented && (
                <div className="p-4 bg-gray-50/50 rounded-2xl space-y-4 border border-gray-200/80 shadow-inner">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Kiracı Cari ID</label>
                    <input type="number" placeholder="Cari kart ID numarası" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-600 transition-all text-sm font-medium" value={form.tenantCaId || ''} onChange={e => setForm({...form, tenantCaId: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Kira Bedeli</label>
                      <input type="number" placeholder="0.00" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-600 transition-all text-sm font-bold text-gray-800" value={form.rentAmount || ''} onChange={e => setForm({...form, rentAmount: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Para Birimi</label>
                      <select className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-600 transition-all text-sm font-semibold text-gray-700" value={form.rentCurrency} onChange={e => setForm({...form, rentCurrency: e.target.value})}>
                        <option value="TRY">TRY</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Ödeme Günü (Ayın kaçıncı günü)</label>
                    <input type="number" min="1" max="31" placeholder="Örn: 15" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-600 transition-all text-sm font-medium" value={form.rentPaymentDay || ''} onChange={e => setForm({...form, rentPaymentDay: e.target.value})} />
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button onClick={handleSave} className="px-6 py-2.5 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors shadow-md shadow-amber-600/10 text-sm">
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
