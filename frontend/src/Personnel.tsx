import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './api';
import { Users, Plus, Save, Trash2, Edit2 } from 'lucide-react';

interface PersonnelItem {
  id: number;
  name: string;
  position: string;
  hireDate: string;
  monthlySalary: string;
  salaryCurrency: string;
}

export default function Personnel() {
  const navigate = useNavigate();
  const [personnel, setPersonnel] = useState<PersonnelItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ id: 0, name: '', position: '', hireDate: '', monthlySalary: '', salaryCurrency: 'TRY' });

  const loadPersonnel = async () => {
    try {
      const res = await api.get('/personnel');
      setPersonnel(res.data);
    } catch (e: any) {
      if (e.response?.status === 403) {
        alert(e.response.data.message);
      }
    }
  };

  useEffect(() => {
    loadPersonnel();
  }, []);

  const handleSave = async () => {
    try {
      if (form.id) {
        await api.patch(`/personnel/${form.id}`, form);
      } else {
        await api.post('/personnel', form);
      }
      setShowModal(false);
      loadPersonnel();
    } catch (e) {
      alert('Hata oluştu');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Emin misiniz?')) return;
    try {
      await api.delete(`/personnel/${id}`);
      loadPersonnel();
    } catch (e) {
      alert('Hata oluştu');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-600" />
            Personel Yönetimi
          </h1>
        </div>
        <button onClick={() => { setForm({ id: 0, name: '', position: '', hireDate: '', monthlySalary: '', salaryCurrency: 'TRY' }); setShowModal(true); }} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" /> Yeni Personel
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Personel Adı</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Pozisyon</th>
              <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Maaş</th>
              <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {personnel.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 text-sm font-medium text-emerald-600 cursor-pointer hover:underline" onClick={() => navigate(`/personnel/${p.id}`)}>{p.name}</td>
                <td className="py-4 px-6 text-sm text-gray-600">{p.position}</td>
                <td className="py-4 px-6 text-sm text-gray-900 text-right font-mono">
                  {Number(p.monthlySalary).toLocaleString('tr-TR')} {p.salaryCurrency}
                </td>
                <td className="py-4 px-6 text-right">
                  <button onClick={() => { setForm({ ...p }); setShowModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg ml-2"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                {form.id ? 'Personel Düzenle' : 'Yeni Personel Ekle'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Ad Soyad</label>
                <input type="text" placeholder="Örn: Ahmet Yılmaz" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Pozisyon</label>
                <input type="text" placeholder="Örn: Muhasebe Sorumlusu" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium" value={form.position} onChange={e => setForm({...form, position: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Aylık Maaş</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="0.00" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-bold text-gray-800" value={form.monthlySalary} onChange={e => setForm({...form, monthlySalary: e.target.value})} />
                  <select className="px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-semibold text-gray-700" value={form.salaryCurrency} onChange={e => setForm({...form, salaryCurrency: e.target.value})}>
                    <option value="TRY">TRY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button onClick={handleSave} className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/10 text-sm">
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
