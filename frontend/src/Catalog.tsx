import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Book, Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Catalog() {
  const [items, setItems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', author: '', isbn: '', type: 'Kitap', price: 0, currency: 'TL' });

  const loadData = async () => {
    try {
      const res = await api.get('/publications/catalog');
      setItems(res.data);
    } catch (e) { alert('Hata oluştu'); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    try {
      await api.post('/publications/catalog', form);
      setShowModal(false);
      loadData();
    } catch (e: any) { alert(e.response?.data?.message || 'Hata oluştu'); }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Link to="/publications" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Yayınlara Dön
      </Link>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3"><Book className="w-8 h-8 text-indigo-600" /> Katalog</h1>
        <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2 font-medium">
          <Plus className="w-5 h-5" /> Yeni Yayın
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left py-4 px-6 font-medium text-gray-500">Yayın Adı</th>
              <th className="text-left py-4 px-6 font-medium text-gray-500">Yazar / ISBN</th>
              <th className="text-left py-4 px-6 font-medium text-gray-500">Tür</th>
              <th className="text-left py-4 px-6 font-medium text-gray-500">Stok (Adet)</th>
              <th className="text-right py-4 px-6 font-medium text-gray-500">Fiyat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="py-4 px-6 font-medium">{i.title}</td>
                <td className="py-4 px-6 text-sm text-gray-600">{i.author || '-'}<br/><span className="text-xs text-gray-400">{i.isbn}</span></td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${i.type === 'Dergi' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>{i.type}</span>
                </td>
                <td className="py-4 px-6 font-semibold">{i.current_stock || 0}</td>
                <td className="py-4 px-6 text-right font-bold text-gray-900">{i.price} {i.currency}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-500">Katalog boş.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Book className="h-5 w-5 text-indigo-600" />
                Kataloğa Yeni Yayın Ekle
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Yayın Başlığı</label>
                <input type="text" placeholder="Örn: Risale-i Nur Külliyatı" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-50/10 focus:border-indigo-600 transition-all text-sm font-medium" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Yazar</label>
                  <input type="text" placeholder="Yazar Adı" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-50/10 focus:border-indigo-600 transition-all text-sm font-medium" value={form.author} onChange={e => setForm({...form, author: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">ISBN</label>
                  <input type="text" placeholder="978-..." className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-50/10 focus:border-indigo-600 transition-all text-sm font-medium font-mono" value={form.isbn} onChange={e => setForm({...form, isbn: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Yayın Türü</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-50/10 focus:border-indigo-600 transition-all text-sm font-medium text-gray-700" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="Kitap">Kitap</option>
                    <option value="Dergi">Dergi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Satış Fiyatı (TL)</label>
                  <input type="number" placeholder="0.00" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-50/10 focus:border-indigo-600 transition-all text-sm font-bold text-gray-800" value={form.price} onChange={e => setForm({...form, price: +e.target.value})} />
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button onClick={handleSave} className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/10 text-sm">
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
