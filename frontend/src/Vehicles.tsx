import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Car, Trash2 } from 'lucide-react';
import api from './api';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ plate_number: '', brand: '', model: '', year: new Date().getFullYear(), assigned_to: '', is_active: true });
  const navigate = useNavigate();

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vehicles');
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSave = async () => {
    await api.post('/vehicles', form);
    setShowModal(false);
    setForm({ plate_number: '', brand: '', model: '', year: new Date().getFullYear(), assigned_to: '', is_active: true });
    fetchVehicles();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Emin misiniz?')) return;
    await api.delete(`/vehicles/${id}`);
    fetchVehicles();
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Araç Yönetimi</h1>
          <p className="text-gray-500 text-sm mt-1">Vakfa ait araçların takibi ve zimmet durumları</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          Yeni Araç Ekle
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50 text-gray-500">
            <tr>
              <th className="px-6 py-4 font-medium">Plaka</th>
              <th className="px-6 py-4 font-medium">Marka / Model</th>
              <th className="px-6 py-4 font-medium">Zimmetli Kişi</th>
              <th className="px-6 py-4 font-medium">Durum</th>
              <th className="px-6 py-4 font-medium text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vehicles.map(v => (
              <tr key={v.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/vehicles/${v.id}`)}>
                <td className="px-6 py-4 font-bold text-gray-900">{v.plate_number}</td>
                <td className="px-6 py-4 text-gray-600">{v.brand} {v.model} ({v.year})</td>
                <td className="px-6 py-4 text-gray-600">{v.assigned_to || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${v.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {v.is_active ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(v.id); }} className="text-red-500 hover:text-red-700 p-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {vehicles.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Kayıtlı araç bulunmamaktadır.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Car className="h-5 w-5 text-blue-600" />
                Yeni Araç Kaydı
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Plaka</label>
                <input type="text" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-bold uppercase" value={form.plate_number} onChange={e => setForm({...form, plate_number: e.target.value})} placeholder="34 ABC 123" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Marka</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} placeholder="Toyota" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Model</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium" value={form.model} onChange={e => setForm({...form, model: e.target.value})} placeholder="Corolla" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Model Yılı</label>
                  <input type="number" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium" value={form.year} onChange={e => setForm({...form, year: +e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Zimmetli Kişi</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium" value={form.assigned_to} onChange={e => setForm({...form, assigned_to: e.target.value})} placeholder="Ad Soyad" />
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/10 text-sm">
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
