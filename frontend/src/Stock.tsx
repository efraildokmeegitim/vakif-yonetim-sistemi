import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Package, Plus, Save, Edit2, Trash2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export default function Stock() {
  const [activeTab, setActiveTab] = useState<'levels'|'items'|'categories'|'in'|'out'>('levels');
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'category'|'item'|''>('');
  const [form, setForm] = useState<any>({});
  
  // Stock Entry Form
  const [stockEntry, setStockEntry] = useState({
    entry_type: 'purchase',
    transaction_date: new Date().toISOString().split('T')[0],
    warehouse_id: '',
    wallet_id: '',
    total_cost: '',
    notes: '',
    items: [{ id: '', quantity: '' }]
  });

  const loadData = async () => {
    try {
      const [catRes, itemRes, levelRes, whRes, walletRes] = await Promise.all([
        api.get('/stock/categories'),
        api.get('/stock/items'),
        api.get('/stock/levels'),
        api.get('/warehouses').catch(() => ({ data: [] })),
        api.get('/wallets').catch(() => ({ data: [] }))
      ]);
      setCategories(catRes.data);
      setItems(itemRes.data);
      setLevels(levelRes.data);
      setWarehouses(whRes.data);
      setWallets(walletRes.data);
    } catch (e: any) {
      if (e.response?.status === 403) alert(e.response.data.message);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSaveCategory = async () => {
    try {
      await api.post('/stock/categories', form);
      setShowModal(false);
      loadData();
    } catch (e: any) { alert(e.response?.data?.message || 'Hata'); }
  };

  const handleSaveItem = async () => {
    try {
      if (form.id) await api.patch(`/stock/items/${form.id}`, form);
      else await api.post('/stock/items', form);
      setShowModal(false);
      loadData();
    } catch (e: any) { alert(e.response?.data?.message || 'Hata'); }
  };

  const handleStockIn = async () => {
    try {
      await api.post('/stock/transactions/in', stockEntry);
      alert('Stok girişi başarılı');
      setActiveTab('levels');
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Hata');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Package className="w-8 h-8 text-indigo-600" />
          Ayni Yardım ve Stok
        </h1>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[
          { id: 'levels', label: 'Depo Stok Durumu' },
          { id: 'in', label: 'Stok Girişi (Alım/Bağış)' },
          { id: 'out', label: 'Yardım Dağıtımı (Çıkış)' },
          { id: 'transfer', label: 'Depolar Arası Transfer' },
          { id: 'items', label: 'Ürün Kataloğu' },
          { id: 'categories', label: 'Kategoriler' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'levels' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6">Depo</th>
                <th className="text-left py-4 px-6">Ürün</th>
                <th className="text-right py-4 px-6">Miktar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {levels.map((l, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-4 px-6">{l.warehouseName}</td>
                  <td className="py-4 px-6">{l.itemName}</td>
                  <td className="py-4 px-6 text-right font-semibold text-indigo-600">{l.quantity} {l.unit}</td>
                </tr>
              ))}
              {levels.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-gray-500">Stok bulunamadı.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'in' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 max-w-3xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-green-700"><ArrowDownCircle /> Stok Girişi</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Giriş Türü</label>
              <select className="w-full border p-2 rounded" value={stockEntry.entry_type} onChange={e => setStockEntry({...stockEntry, entry_type: e.target.value})}>
                <option value="purchase">Satın Alma</option>
                <option value="donation">Ayni Bağış</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tarih</label>
              <input type="date" className="w-full border p-2 rounded" value={stockEntry.transaction_date} onChange={e => setStockEntry({...stockEntry, transaction_date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hedef Depo</label>
              <select className="w-full border p-2 rounded" value={stockEntry.warehouse_id} onChange={e => setStockEntry({...stockEntry, warehouse_id: e.target.value})}>
                <option value="">Seçiniz...</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            {stockEntry.entry_type === 'purchase' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Ödeme Kasası</label>
                  <select className="w-full border p-2 rounded" value={stockEntry.wallet_id} onChange={e => setStockEntry({...stockEntry, wallet_id: e.target.value})}>
                    <option value="">Seçiniz...</option>
                    {wallets.map(w => <option key={w.id} value={w.id}>{w.name} ({w.balance} {w.currency})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Toplam Maliyet (TL)</label>
                  <input type="number" className="w-full border p-2 rounded" value={stockEntry.total_cost} onChange={e => setStockEntry({...stockEntry, total_cost: e.target.value})} />
                </div>
              </>
            )}
          </div>
          
          <div className="border-t pt-4 mb-4">
            <h3 className="font-semibold mb-2">Ürünler</h3>
            {stockEntry.items.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select className="flex-1 border p-2 rounded" value={item.id} onChange={e => {
                  const newItems = [...stockEntry.items];
                  newItems[idx].id = e.target.value;
                  setStockEntry({...stockEntry, items: newItems});
                }}>
                  <option value="">Ürün Seç...</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
                <input type="number" placeholder="Miktar" className="w-32 border p-2 rounded" value={item.quantity} onChange={e => {
                  const newItems = [...stockEntry.items];
                  newItems[idx].quantity = e.target.value;
                  setStockEntry({...stockEntry, items: newItems});
                }} />
              </div>
            ))}
            <button onClick={() => setStockEntry({...stockEntry, items: [...stockEntry.items, {id:'', quantity:''}]})} className="text-sm text-indigo-600 hover:underline">+ Ürün Ekle</button>
          </div>
          <button onClick={handleStockIn} className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 font-medium">Stok Girişini Kaydet</button>
        </div>
      )}

      {activeTab === 'out' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 max-w-3xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-orange-700"><ArrowUpCircle /> Yardım Dağıtımı (Stok Çıkışı)</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tarih</label>
              <input type="date" className="w-full border p-2 rounded" value={stockEntry.transaction_date} onChange={e => setStockEntry({...stockEntry, transaction_date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Açıklama / Not</label>
              <input type="text" className="w-full border p-2 rounded" value={stockEntry.notes} onChange={e => setStockEntry({...stockEntry, notes: e.target.value})} />
            </div>
          </div>
          <div className="border-t pt-4 mb-4">
            <h3 className="font-semibold mb-2">Çıkış Yapılacak Ürünler</h3>
            {stockEntry.items.map((item: any, idx: number) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select className="flex-1 border p-2 rounded" value={item.warehouse_id || ''} onChange={e => {
                  const newItems = [...stockEntry.items];
                  (newItems[idx] as any).warehouse_id = e.target.value;
                  setStockEntry({...stockEntry, items: newItems});
                }}>
                  <option value="">Depo Seç...</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                <select className="flex-1 border p-2 rounded" value={item.id} onChange={e => {
                  const newItems = [...stockEntry.items];
                  newItems[idx].id = e.target.value;
                  setStockEntry({...stockEntry, items: newItems});
                }}>
                  <option value="">Ürün Seç...</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
                <input type="number" placeholder="Miktar" className="w-32 border p-2 rounded" value={item.quantity} onChange={e => {
                  const newItems = [...stockEntry.items];
                  newItems[idx].quantity = e.target.value;
                  setStockEntry({...stockEntry, items: newItems});
                }} />
              </div>
            ))}
            <button onClick={() => setStockEntry({...stockEntry, items: [...stockEntry.items, {id:'', quantity:'', warehouse_id:''} as any]})} className="text-sm text-indigo-600 hover:underline">+ Ürün Ekle</button>
          </div>
          <button onClick={async () => {
            try {
              await api.post('/stock/transactions/out', stockEntry);
              alert('Stok çıkışı başarılı');
              setActiveTab('levels');
              loadData();
            } catch (e: any) { alert(e.response?.data?.message || 'Hata'); }
          }} className="w-full bg-orange-600 text-white py-2 rounded-xl hover:bg-orange-700 font-medium">Çıkışı Kaydet</button>
        </div>
      )}

      {activeTab === 'transfer' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 max-w-3xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-700"><Package /> Depolar Arası Transfer</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kaynak Depo (Çıkış)</label>
              <select className="w-full border p-2 rounded" value={(stockEntry as any).from_warehouse_id || ''} onChange={e => setStockEntry({...stockEntry, from_warehouse_id: e.target.value} as any)}>
                <option value="">Seçiniz...</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hedef Depo (Giriş)</label>
              <select className="w-full border p-2 rounded" value={(stockEntry as any).to_warehouse_id || ''} onChange={e => setStockEntry({...stockEntry, to_warehouse_id: e.target.value} as any)}>
                <option value="">Seçiniz...</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tarih</label>
              <input type="date" className="w-full border p-2 rounded" value={stockEntry.transaction_date} onChange={e => setStockEntry({...stockEntry, transaction_date: e.target.value})} />
            </div>
          </div>
          <div className="border-t pt-4 mb-4">
            <h3 className="font-semibold mb-2">Transfer Edilecek Ürünler</h3>
            {stockEntry.items.map((item: any, idx: number) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select className="flex-1 border p-2 rounded" value={item.id} onChange={e => {
                  const newItems = [...stockEntry.items];
                  newItems[idx].id = e.target.value;
                  setStockEntry({...stockEntry, items: newItems});
                }}>
                  <option value="">Ürün Seç...</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
                <input type="number" placeholder="Miktar" className="w-32 border p-2 rounded" value={item.quantity} onChange={e => {
                  const newItems = [...stockEntry.items];
                  newItems[idx].quantity = e.target.value;
                  setStockEntry({...stockEntry, items: newItems});
                }} />
              </div>
            ))}
            <button onClick={() => setStockEntry({...stockEntry, items: [...stockEntry.items, {id:'', quantity:''}]})} className="text-sm text-indigo-600 hover:underline">+ Ürün Ekle</button>
          </div>
          <button onClick={async () => {
            try {
              await api.post('/stock/transactions/transfer', stockEntry);
              alert('Transfer başarılı');
              setActiveTab('levels');
              loadData();
            } catch (e: any) { alert(e.response?.data?.message || 'Hata'); }
          }} className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 font-medium">Transferi Gerçekleştir</button>
        </div>
      )}

      {activeTab === 'categories' && (
        <div>
          <button onClick={() => { setForm({ name: '', usageType: 'Yardım Dağıtımı' }); setModalType('category'); setShowModal(true); }} className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2"><Plus className="w-4 h-4"/> Kategori Ekle</button>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr><th className="text-left py-4 px-6">Adı</th><th className="text-left py-4 px-6">Kullanım Türü</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categories.map(c => <tr key={c.id} className="hover:bg-gray-50"><td className="py-4 px-6">{c.name}</td><td className="py-4 px-6">{c.usageType}</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'items' && (
        <div>
          <button onClick={() => { setForm({ id: 0, name: '', categoryId: '', unit: 'Adet', estimatedValue: 0 }); setModalType('item'); setShowModal(true); }} className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2"><Plus className="w-4 h-4"/> Ürün Ekle</button>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr><th className="text-left py-4 px-6">Ürün Adı</th><th className="text-left py-4 px-6">Kategori</th><th className="text-left py-4 px-6">Birim</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(i => <tr key={i.id} className="hover:bg-gray-50"><td className="py-4 px-6">{i.name}</td><td className="py-4 px-6">{i.category?.name}</td><td className="py-4 px-6">{i.unit}</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && modalType === 'category' && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Plus size={20} className="text-indigo-600" />
                Yeni Kategori Ekle
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Kategori Adı</label>
                <input type="text" placeholder="Örn: Gıda, Giyim, Temizlik" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-50/10 focus:border-indigo-600 transition-all text-sm font-medium" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button onClick={handleSaveCategory} className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/10 text-sm">
                  Kategoriyi Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && modalType === 'item' && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Plus size={20} className="text-indigo-600" />
                Kataloğa Yeni Ürün Ekle
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Ürün Adı</label>
                <input type="text" placeholder="Örn: Un (5 kg), Ayçiçek Yağı (2 lt)" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-50/10 focus:border-indigo-600 transition-all text-sm font-medium" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Kategori</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-50/10 focus:border-indigo-600 transition-all text-sm font-medium text-gray-700" value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}>
                    <option value="">Seç...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Birim</label>
                  <input type="text" placeholder="Örn: Adet, Çuval" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-50/10 focus:border-indigo-600 transition-all text-sm font-medium" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} />
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button onClick={handleSaveItem} className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/10 text-sm">
                  Ürünü Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
