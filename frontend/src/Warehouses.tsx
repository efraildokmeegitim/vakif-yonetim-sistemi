import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Archive, Plus, Save, Edit2, Trash2 } from 'lucide-react';

interface Warehouse {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>({
    id: 0,
    name: '',
    description: ''
  });

  const loadData = async () => {
    try {
      const res = await api.get('/warehouses');
      setWarehouses(res.data);
    } catch (e: any) {
      if (e.response?.status === 403) {
        alert(e.response.data.message);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    try {
      if (form.id) {
        await api.patch(`/warehouses/${form.id}`, form);
      } else {
        await api.post('/warehouses', form);
      }
      setShowModal(false);
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Hata oluştu');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Depoyu silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/warehouses/${id}`);
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
            <Archive className="w-8 h-8 text-amber-600" />
            Depo Yönetimi
          </h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => { 
              setForm({ id: 0, name: '', description: '' }); 
              setShowModal(true); 
            }} 
            className="px-5 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Yeni Depo
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Depo Adı</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Açıklama</th>
              <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {warehouses.map(w => (
              <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="text-sm font-medium text-gray-900">{w.name}</div>
                </td>
                <td className="py-4 px-6">
                  <div className="text-sm text-gray-500">{w.description || '-'}</div>
                </td>
                <td className="py-4 px-6 text-right">
                  <button onClick={() => { setForm({ ...w }); setShowModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(w.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg ml-2"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {warehouses.length === 0 && (
              <tr>
                <td colSpan={3} className="py-8 text-center text-gray-500">
                  Kayıtlı depo bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Archive className="h-5 w-5 text-amber-600" />
                {form.id ? 'Depo Düzenle' : 'Yeni Depo Tanımla'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Depo Adı</label>
                <input type="text" placeholder="Örn: Merkez Depo, Gıda Deposu" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-600 transition-all text-sm font-medium" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Açıklama</label>
                <textarea placeholder="Depo hakkında açıklama veya konum..." className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-600 transition-all text-sm font-medium h-24 resize-none" rows={3} value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              
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
