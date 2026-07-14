import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Package, Plus, Save, Trash2, Edit2, Archive } from 'lucide-react';
import { Link } from 'react-router-dom';
import ItemPicker from './components/ItemPicker';
import QuickCreateAssetCategoryModal from './QuickCreateAssetCategoryModal';

interface AssetCategory {
  id: number;
  name: string;
}

interface Asset {
  id: number;
  name: string;
  barcode: string;
  categoryId: number;
  assetCode: string;
  totalQuantity: number;
  stockQuantity: number;
  status: string;
}

export default function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isQuickCreateCategoryOpen, setIsQuickCreateCategoryOpen] = useState(false);
  const [quickCreateCategorySearch, setQuickCreateCategorySearch] = useState('');
  const [form, setForm] = useState<any>({
    id: 0,
    name: '',
    barcode: '',
    categoryId: 0,
    assetCode: '',
    totalQuantity: 1,
    status: 'Stokta'
  });

  const loadData = async () => {
    try {
      const [assetsRes, catsRes] = await Promise.all([
        api.get('/assets'),
        api.get('/assets/categories')
      ]);
      setAssets(assetsRes.data);
      setCategories(catsRes.data);
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
        await api.patch(`/assets/${form.id}`, form);
      } else {
        await api.post('/assets', form);
      }
      setShowModal(false);
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Hata oluştu');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Demirbaşı silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/assets/${id}`);
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
            <Package className="w-8 h-8 text-indigo-600" />
            Demirbaş Yönetimi
          </h1>
        </div>
        <button 
          onClick={() => { 
            setForm({ id: 0, name: '', barcode: '', categoryId: categories[0]?.id || 0, assetCode: '', totalQuantity: 1, status: 'Stokta' }); 
            setShowModal(true); 
          }} 
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Yeni Demirbaş
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Demirbaş Adı</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Barkod / Kod</th>
              <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Stok</th>
              <th className="text-center py-4 px-6 text-sm font-semibold text-gray-600">Durum</th>
              <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {assets.map(a => (
              <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 text-sm font-medium text-gray-900">
                  <Link to={`/assets/${a.id}`} className="hover:text-indigo-600 hover:underline">
                    {a.name}
                  </Link>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">{a.barcode} / {a.assetCode}</td>
                <td className="py-4 px-6 text-sm text-gray-900 text-right">
                  {a.stockQuantity} / {a.totalQuantity}
                </td>
                <td className="py-4 px-6 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    a.status === 'Stokta' ? 'bg-green-100 text-green-800' :
                    a.status === 'Zimmetli' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {a.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button onClick={() => { setForm({ ...a }); setShowModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(a.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg ml-2"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {assets.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">Henüz demirbaş kaydı yok.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-600" />
                {form.id ? 'Demirbaş Düzenle' : 'Yeni Demirbaş Tanımla'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Demirbaş Adı</label>
                <input type="text" placeholder="Örn: Ofis Masası, Yazıcı" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-50/10 focus:border-indigo-600 transition-all text-sm font-medium" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Barkod</label>
                  <input type="text" placeholder="Barkod numarası" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-50/10 focus:border-indigo-600 transition-all text-sm font-medium font-mono" value={form.barcode || ''} onChange={e => setForm({...form, barcode: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Demirbaş Kodu</label>
                  <input type="text" placeholder="DMB-..." className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-50/10 focus:border-indigo-600 transition-all text-sm font-medium font-mono" value={form.assetCode || ''} onChange={e => setForm({...form, assetCode: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Kategori</label>
                <ItemPicker
                  items={categories}
                  value={form.categoryId}
                  onChange={(v) => setForm({...form, categoryId: v})}
                  placeholder="Kategori Seçin..."
                  displayKey="name"
                  onAddNew={(search) => {
                    setQuickCreateCategorySearch(search);
                    setIsQuickCreateCategoryOpen(true);
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Toplam Adet</label>
                  <input type="number" min="1" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-50/10 focus:border-indigo-600 transition-all text-sm font-bold text-gray-800" value={form.totalQuantity} onChange={e => setForm({...form, totalQuantity: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Durum</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-50/10 focus:border-indigo-600 transition-all text-sm font-medium text-gray-700" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="Stokta">Stokta</option>
                    <option value="Hurda">Hurda</option>
                  </select>
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

      <QuickCreateAssetCategoryModal
        isOpen={isQuickCreateCategoryOpen}
        initialName={quickCreateCategorySearch}
        onClose={() => setIsQuickCreateCategoryOpen(false)}
        onCreated={(newCategory) => {
          api.get('/assets/categories').then(res => setCategories(res.data)).catch(console.error);
          if (newCategory && newCategory.id) setForm({ ...form, categoryId: newCategory.id });
          setIsQuickCreateCategoryOpen(false);
        }}
      />
    </div>
  );
}
