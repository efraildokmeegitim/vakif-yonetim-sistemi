import React, { useState, useEffect } from 'react';
import { Building2, Plus, Save, Trash2, Edit2 } from 'lucide-react';
import api from './api';

interface CostCenter {
  id: number;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

export default function CostCenters() {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ id: 0, name: '', code: '', description: '', isActive: true });
  const [loading, setLoading] = useState(true);

  const fetchCostCenters = async () => {
    try {
      const res = await api.get('/cost-centers');
      setCostCenters(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCostCenters();
  }, []);

  const handleSave = async () => {
    try {
      if (form.id) {
        await api.patch(`/cost-centers/${form.id}`, form);
      } else {
        await api.post('/cost-centers', form);
      }
      setShowModal(false);
      fetchCostCenters();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/cost-centers/${id}`);
      fetchCostCenters();
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (cc?: CostCenter) => {
    if (cc) {
      setForm(cc);
    } else {
      setForm({ id: 0, name: '', code: '', description: '', isActive: true });
    }
    setShowModal(true);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-blue-600" /> Masraf Merkezleri
        </h1>
        <button onClick={() => openModal()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Yeni Masraf Merkezi
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3">Adı</th>
              <th className="px-4 py-3">Kodu</th>
              <th className="px-4 py-3">Açıklama</th>
              <th className="px-4 py-3 text-center">Durum</th>
              <th className="px-4 py-3 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {costCenters.map(cc => (
              <tr key={cc.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{cc.name}</td>
                <td className="px-4 py-3 text-gray-500">{cc.code}</td>
                <td className="px-4 py-3 text-gray-500">{cc.description}</td>
                <td className="px-4 py-3 text-center">
                  {cc.isActive ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Aktif</span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Pasif</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openModal(cc)} className="text-blue-600 hover:text-blue-800 mr-3"><Edit2 className="w-4 h-4 inline" /></button>
                  <button onClick={() => handleDelete(cc.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4 inline" /></button>
                </td>
              </tr>
            ))}
            {costCenters.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">Kayıt bulunamadı.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                {form.id ? 'Masraf Merkezini Düzenle' : 'Yeni Masraf Merkezi Ekle'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Masraf Merkezi Adı</label>
                <input type="text" placeholder="Örn: Eğitim Giderleri, Genel Yönetim" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Kodu</label>
                <input type="text" placeholder="Örn: MM-100" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium font-mono" value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Açıklama</label>
                <textarea placeholder="Masraf merkezine ait açıklama..." className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium h-20 resize-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              
              <label className="flex items-center gap-3 p-3 bg-blue-50/30 border border-blue-100/60 rounded-xl cursor-pointer hover:bg-blue-50/60 transition-colors">
                <input type="checkbox" id="isActive" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-blue-900">Aktif</p>
                </div>
              </label>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/10 text-sm flex items-center gap-2">
                  <Save className="w-4 h-4" /> Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
