import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import ItemPicker from './ItemPicker';
import QuickCreateCurrentAccountModal from './QuickCreateCurrentAccountModal';

interface Sponsorship {
  id: number;
  sponsor: { id: number; name: string };
  beneficiary?: { id: number; name: string };
  project_id?: number;
  amount: number;
  period: string;
  start_date: string;
  status: string;
}

export default function Sponsorships() {
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ sponsor_id: '', beneficiary_id: '', amount: '', period: 'monthly', start_date: new Date().toISOString().split('T')[0], status: 'active' });
  const [accounts, setAccounts] = useState<any[]>([]);

  // Quick Create States
  const [showQuickCreateModal, setShowQuickCreateModal] = useState(false);
  const [quickCreateSearch, setQuickCreateSearch] = useState('');
  const [quickCreateTargetField, setQuickCreateTargetField] = useState<'sponsor' | 'beneficiary'>('sponsor');

  useEffect(() => {
    fetchSponsorships();
    fetchAccounts();
  }, []);

  const fetchSponsorships = async () => {
    try {
      const res = await api.get('/sponsorships');
      setSponsorships(res.data);
    } catch (error) {
      console.error('Error fetching sponsorships', error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/current-accounts');
      setAccounts(res.data);
    } catch (error) {
      console.error('Error fetching accounts', error);
    }
  };

  const handleSave = async () => {
    try {
      await api.post('/sponsorships', {
        sponsor_id: parseInt(form.sponsor_id),
        beneficiary_id: form.beneficiary_id ? parseInt(form.beneficiary_id) : undefined,
        amount: parseFloat(form.amount),
        period: form.period,
        start_date: form.start_date,
        status: form.status
      });
      setShowModal(false);
      fetchSponsorships();
    } catch (error) {
      console.error('Error saving sponsorship', error);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Sponsorluk Yönetimi</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus size={20} />
          Yeni Sponsorluk
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-600">ID</th>
              <th className="px-6 py-4 font-medium text-gray-600">Sponsor</th>
              <th className="px-6 py-4 font-medium text-gray-600">Faydalanıcı / Proje</th>
              <th className="px-6 py-4 font-medium text-gray-600">Miktar</th>
              <th className="px-6 py-4 font-medium text-gray-600">Periyot</th>
              <th className="px-6 py-4 font-medium text-gray-600">Başlangıç</th>
              <th className="px-6 py-4 font-medium text-gray-600">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sponsorships.map(s => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <Link to={`/sponsorships/${s.id}`} className="text-blue-600 font-medium hover:underline">#{s.id}</Link>
                </td>
                <td className="px-6 py-4">{s.sponsor?.name}</td>
                <td className="px-6 py-4">{s.beneficiary ? s.beneficiary.name : (s.project_id ? `Proje #${s.project_id}` : '-')}</td>
                <td className="px-6 py-4 font-medium">{s.amount} TL</td>
                <td className="px-6 py-4">{s.period === 'monthly' ? 'Aylık' : s.period === 'yearly' ? 'Yıllık' : 'Tek Seferlik'}</td>
                <td className="px-6 py-4">{s.start_date}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {s.status === 'active' ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
              </tr>
            ))}
            {sponsorships.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Henüz sponsorluk kaydı bulunmuyor.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Plus size={20} className="text-blue-600" />
                Yeni Sponsorluk Tanımla
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
              <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Sponsor (Cari Hesap)</label>
                <ItemPicker 
                  items={accounts}
                  value={form.sponsor_id ? parseInt(form.sponsor_id) : ''}
                  onChange={(val) => setForm({...form, sponsor_id: String(val)})}
                  placeholder="Sponsor Seçiniz..."
                  onQuickCreate={(search) => {
                    setQuickCreateSearch(search);
                    setQuickCreateTargetField('sponsor');
                    setShowQuickCreateModal(true);
                  }}
                  quickCreateLabel="Yeni Sponsor Ekle"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Faydalanıcı (Cari) (Opsiyonel)</label>
                <ItemPicker 
                  items={accounts}
                  value={form.beneficiary_id ? parseInt(form.beneficiary_id) : ''}
                  onChange={(val) => setForm({...form, beneficiary_id: String(val)})}
                  placeholder="Faydalanıcı Seçiniz..."
                  onQuickCreate={(search) => {
                    setQuickCreateSearch(search);
                    setQuickCreateTargetField('beneficiary');
                    setShowQuickCreateModal(true);
                  }}
                  quickCreateLabel="Yeni Faydalanıcı Ekle"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Miktar (TL)</label>
                  <input type="number" placeholder="0.00" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-bold text-gray-800" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Periyot</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-semibold text-gray-700" value={form.period} onChange={e => setForm({...form, period: e.target.value})}>
                    <option value="monthly">Aylık</option>
                    <option value="yearly">Yıllık</option>
                    <option value="one_time">Tek Seferlik</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Başlangıç Tarihi</label>
                <input type="date" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium text-gray-700" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/10 text-sm">Kaydet</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <QuickCreateCurrentAccountModal 
        isOpen={showQuickCreateModal}
        initialName={quickCreateSearch}
        defaultTypeName={quickCreateTargetField === 'sponsor' ? 'Bağışçı' : 'Öğrenci'}
        onClose={() => setShowQuickCreateModal(false)}
        onCreated={(newAccount) => {
          setAccounts([...accounts, newAccount]);
          if (quickCreateTargetField === 'sponsor') {
            setForm({...form, sponsor_id: String(newAccount.id)});
          } else {
            setForm({...form, beneficiary_id: String(newAccount.id)});
          }
        }}
      />
    </div>
  );
}
