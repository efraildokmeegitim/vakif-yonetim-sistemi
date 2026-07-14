import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Users, Plus, ArrowLeft, Search, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import ItemPicker from './components/ItemPicker';
import QuickCreateCurrentAccountModal from './QuickCreateCurrentAccountModal';
import QuickCreatePublicationModal from './QuickCreatePublicationModal';

export default function Subscriptions() {
  const [subs, setSubs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>({ subscriber_ca_id: '', publication_id: '', start_date: '', end_date: '', gift_publication_id: '', payment_status: 'Ödenmedi', amount: 0, wallet_id: '' });
  
  const [cas, setCas] = useState<any[]>([]);
  const [pubs, setPubs] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);

  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [quickCreateSearch, setQuickCreateSearch] = useState('');

  const [isQuickCreatePublicationOpen, setIsQuickCreatePublicationOpen] = useState(false);
  const [quickCreatePublicationSearch, setQuickCreatePublicationSearch] = useState('');
  const [quickCreatePublicationType, setQuickCreatePublicationType] = useState<'Kitap' | 'Dergi'>('Dergi');

  const loadData = async () => {
    try {
      const res = await api.get(`/publications/subscriptions?search=${search}`);
      setSubs(res.data);
    } catch (e) {}
  };

  const loadDependencies = async () => {
    try {
      const [caRes, pubRes, walRes] = await Promise.all([
        api.get('/api/current-accounts'),
        api.get('/publications/catalog'),
        api.get('/api/wallets')
      ]);
      setCas(caRes.data);
      setPubs(pubRes.data);
      setWallets(walRes.data);
    } catch (e) {}
  };

  useEffect(() => { loadData(); }, [search]);
  useEffect(() => { loadDependencies(); }, []);

  const handleSave = async () => {
    try {
      await api.post('/publications/subscriptions', form);
      setShowModal(false);
      loadData();
    } catch (e: any) { alert(e.response?.data?.message || 'Hata oluştu'); }
  };

  const handleDeliver = async (id: number) => {
    try {
      await api.post(`/publications/subscriptions/${id}/deliver`);
      loadData();
    } catch(e: any) { alert(e.response?.data?.message || 'Hata'); }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Link to="/publications" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Yayınlara Dön
      </Link>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3"><Users className="w-8 h-8 text-blue-600" /> Abonelikler</h1>
        <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 font-medium">
          <Plus className="w-5 h-5" /> Yeni Abonelik
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Abone Ara..." className="flex-1 outline-none text-sm" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left py-4 px-6 font-medium text-gray-500">Abone</th>
              <th className="text-left py-4 px-6 font-medium text-gray-500">Yayın / Süre</th>
              <th className="text-left py-4 px-6 font-medium text-gray-500">Ödeme Durumu</th>
              <th className="text-left py-4 px-6 font-medium text-gray-500">Hediye Kitap</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {subs.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="py-4 px-6 font-semibold text-gray-900">{s.subscriber_name}</td>
                <td className="py-4 px-6">
                  <p className="font-medium">{s.publication_title}</p>
                  <p className="text-xs text-gray-500">{new Date(s.start_date).toLocaleDateString()} - {s.end_date ? new Date(s.end_date).toLocaleDateString() : 'Süresiz'}</p>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${s.payment_status === 'Ödendi' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {s.payment_status}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">Ödenen: {s.total_paid} / Kalan: {s.remaining_balance}</div>
                </td>
                <td className="py-4 px-6">
                  {s.gift_publication_id ? (
                    s.gift_delivered_date ? <span className="text-green-600 font-medium flex items-center gap-1"><Gift className="w-4 h-4"/> Teslim Edildi</span> 
                    : <button onClick={() => handleDeliver(s.id)} className="text-blue-600 hover:underline text-xs font-medium">Teslim Et (Stoktan Düş)</button>
                  ) : <span className="text-gray-400">-</span>}
                </td>
              </tr>
            ))}
            {subs.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-gray-500">Kayıt bulunamadı.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Yeni Yayın Aboneliği Oluştur
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh] text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Cari (Abone)</label>
                  <ItemPicker 
                    items={cas} 
                    value={form.subscriber_ca_id} 
                    onChange={v => setForm({...form, subscriber_ca_id: v})} 
                    placeholder="Abone Seçin..." 
                    onAddNew={(s) => {
                      setQuickCreateSearch(s);
                      setIsQuickCreateOpen(true);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Yayın (Dergi)</label>
                  <ItemPicker 
                    items={pubs.filter(p=>p.type==='Dergi')} 
                    value={form.publication_id} 
                    onChange={v => setForm({...form, publication_id: v})} 
                    placeholder="Dergi Seçin..." 
                    displayKey="title" 
                    onAddNew={(search) => {
                      setQuickCreatePublicationType('Dergi');
                      setQuickCreatePublicationSearch(search);
                      setIsQuickCreatePublicationOpen(true);
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Başlangıç Tarihi</label>
                  <input type="date" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium text-gray-700" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Bitiş Tarihi</label>
                  <input type="date" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium text-gray-700" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Hediye Kitap (Stoktan düşer)</label>
                <ItemPicker 
                  items={[{id: '', title: 'İstemiyor'}, ...pubs.filter(p=>p.type==='Kitap')]} 
                  value={form.gift_publication_id} 
                  onChange={v => setForm({...form, gift_publication_id: v})} 
                  placeholder="Hediye Kitap Seçin..." 
                  displayKey="title" 
                  onAddNew={(search) => {
                    setQuickCreatePublicationType('Kitap');
                    setQuickCreatePublicationSearch(search);
                    setIsQuickCreatePublicationOpen(true);
                  }}
                />
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-4">
                <h3 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Ödeme & Finans Bilgileri</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Abonelik Tutarı</label>
                    <input type="number" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-bold text-gray-800" value={form.amount} onChange={e => setForm({...form, amount: +e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Ödeme Durumu</label>
                    <select className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-semibold text-gray-700" value={form.payment_status} onChange={e => setForm({...form, payment_status: e.target.value})}>
                      <option value="Ödenmedi">Ödenmedi (Açık Hesap)</option>
                      <option value="Ödendi">Peşin Ödendi</option>
                    </select>
                  </div>
                </div>
                {form.payment_status === 'Ödendi' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Tahsilat Kasası</label>
                    <select className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium text-gray-700" value={form.wallet_id} onChange={e => setForm({...form, wallet_id: +e.target.value})}>
                      <option value="">Kasa Seç...</option>
                      {wallets.map(w => <option key={w.id} value={w.id}>{w.group_name} - {w.currency}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 p-6 bg-gray-50/30">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
              <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/10 text-sm">
                Aboneliği Başlat
              </button>
            </div>
          </div>
        </div>
      )}

      <QuickCreateCurrentAccountModal
        isOpen={isQuickCreateOpen}
        initialName={quickCreateSearch}
        defaultTypeName="Abone"
        onClose={() => setIsQuickCreateOpen(false)}
        onCreated={(newAccount) => {
          loadData(); // To refresh CAS list
          setForm({ ...form, subscriber_ca_id: newAccount.id });
          setIsQuickCreateOpen(false);
        }}
      />

      <QuickCreatePublicationModal
        isOpen={isQuickCreatePublicationOpen}
        initialTitle={quickCreatePublicationSearch}
        defaultType={quickCreatePublicationType}
        onClose={() => setIsQuickCreatePublicationOpen(false)}
        onCreated={(newPublication) => {
          // Re-fetch publications
          api.get('/publications').then(res => {
            setPubs(res.data.publications || []);
            // Find the newly created publication by matching its title to select it automatically
            const created = res.data.publications?.find((p:any) => p.title === newPublication.title);
            if (created) {
              if (quickCreatePublicationType === 'Dergi') {
                setForm({...form, publication_id: created.id});
              } else {
                setForm({...form, gift_publication_id: created.id});
              }
            }
          }).catch(console.error);
          setIsQuickCreatePublicationOpen(false);
        }}
      />
    </div>
  );
}
