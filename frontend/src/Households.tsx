import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Users, Plus, Search, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Households() {
  const [households, setHouseholds] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_households: 0, pending_households: 0, approved_households: 0 });
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ familyName: '', contactNumber: '', address: '', city: '', district: '' });

  const loadData = async () => {
    try {
      const res = await api.get(`/households?search=${search}`);
      setHouseholds(res.data.households);
      setStats(res.data.stats || { total_households: 0, pending_households: 0, approved_households: 0 });
    } catch (e: any) {
      if (e.response?.status === 403) alert(e.response.data.message);
    }
  };

  useEffect(() => { loadData(); }, [search]);

  const handleSave = async () => {
    try {
      await api.post('/households', form);
      setShowModal(false);
      setForm({ familyName: '', contactNumber: '', address: '', city: '', district: '' });
      loadData();
    } catch (e) {
      alert('Hata oluştu');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Home className="w-8 h-8 text-blue-600" />
          Aile, Yetim ve Yardım Modülü
        </h1>
        <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 font-medium">
          <Plus className="w-5 h-5" /> Yeni Hane Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-xl"><Users className="w-8 h-8 text-blue-600" /></div>
          <div><p className="text-sm font-medium text-gray-500">Toplam Hane</p><p className="text-3xl font-bold text-gray-900">{stats.total_households}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-4 bg-yellow-50 rounded-xl"><Users className="w-8 h-8 text-yellow-600" /></div>
          <div><p className="text-sm font-medium text-gray-500">İncelemede</p><p className="text-3xl font-bold text-gray-900">{stats.pending_households}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-4 bg-green-50 rounded-xl"><Users className="w-8 h-8 text-green-600" /></div>
          <div><p className="text-sm font-medium text-gray-500">Onaylandı (Yardım Alabilir)</p><p className="text-3xl font-bold text-gray-900">{stats.approved_households}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            type="text" placeholder="Aile Ara..." className="flex-1 outline-none text-sm"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Aile (Soyadı)</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Telefon</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">İlçe / İl</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {households.map(h => (
              <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <Link to={`/households/${h.id}`} className="font-semibold text-gray-900 hover:text-blue-600">
                    {h.familyName} Ailesi
                  </Link>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">{h.contactNumber || '-'}</td>
                <td className="py-4 px-6 text-sm text-gray-600">{h.district} / {h.city}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    h.status === 'Onaylandı' ? 'bg-green-100 text-green-800' : 
                    h.status === 'Reddedildi' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {h.status}
                  </span>
                </td>
              </tr>
            ))}
            {households.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-gray-500">Kayıt bulunamadı.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Home className="h-5 w-5 text-blue-600" />
                Yeni Hane / Aile Kaydı Ekle
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Aile Soyadı</label>
                <input type="text" placeholder="Örn: Yılmaz" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium" value={form.familyName} onChange={e => setForm({...form, familyName: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">İletişim Telefonu</label>
                <input type="text" placeholder="0555..." className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium font-mono" value={form.contactNumber} onChange={e => setForm({...form, contactNumber: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">İl</label>
                  <input type="text" placeholder="İstanbul" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">İlçe</label>
                  <input type="text" placeholder="Üsküdar" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium" value={form.district} onChange={e => setForm({...form, district: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Açık Adres Detayı</label>
                <textarea placeholder="Mahalle, sokak, daire no..." className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium h-20 resize-none" value={form.address} onChange={e => setForm({...form, address: e.target.value})}></textarea>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/10 text-sm">Kaydet</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
