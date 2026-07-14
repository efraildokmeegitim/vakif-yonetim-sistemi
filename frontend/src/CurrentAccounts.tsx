import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Users, Eye, FileSpreadsheet, UserCircle } from 'lucide-react';
import api from './api';
import ExcelImportModal from './components/ExcelImportModal';

interface CurrentAccountType {
  id: number;
  name: string;
}

interface CurrentAccount {
  id: number;
  name: string;
  accountCategory: string;
  types?: CurrentAccountType[];
  phone: string;
  isActive: boolean;
}

export default function CurrentAccounts() {
  const [accounts, setAccounts] = useState<CurrentAccount[]>([]);
  const [availableTypes, setAvailableTypes] = useState<CurrentAccountType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    accountCategory: string;
    typeIds: number[];
    phone: string;
    email: string;
    identityNumber: string;
    taxOffice: string;
    address: string;
    city: string;
    country: string;
    notes: string;
  }>({
    name: '',
    accountCategory: 'Bireysel',
    typeIds: [],
    phone: '',
    email: '',
    identityNumber: '',
    taxOffice: '',
    address: '',
    city: '',
    country: '',
    notes: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accRes, typesRes] = await Promise.all([
        api.get('/current-accounts'),
        api.get('/current-account-types')
      ]);
      setAccounts(accRes.data);
      setAvailableTypes(typesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/current-accounts/${editingId}`, formData);
      } else {
        await api.post('/current-accounts', formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', accountCategory: 'Bireysel', typeIds: [], phone: '', email: '', identityNumber: '', taxOffice: '', address: '', city: '', country: '', notes: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (account: CurrentAccount) => {
    setFormData({
      name: account.name,
      accountCategory: account.accountCategory,
      typeIds: account.types?.map(t => t.id) || [],
      phone: account.phone || '',
      email: (account as any).email || '',
      identityNumber: (account as any).identityNumber || '',
      taxOffice: (account as any).taxOffice || '',
      address: (account as any).address || '',
      city: (account as any).city || '',
      country: (account as any).country || '',
      notes: (account as any).notes || '',
    });
    setEditingId(account.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu cari hesabı silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/current-accounts/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Silinemedi, bu hesaba bağlı işlemler olabilir.');
    }
  };

  const toggleTypeSelection = (id: number) => {
    if (formData.typeIds.includes(id)) {
      setFormData({ ...formData, typeIds: formData.typeIds.filter(t => t !== id) });
    } else {
      setFormData({ ...formData, typeIds: [...formData.typeIds, id] });
    }
  };

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedTypeFilter === '' || acc.types?.some(t => t.name === selectedTypeFilter);
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-600" />
            Cari Hesaplar
          </h1>
          <p className="text-gray-500 mt-1">Sistemdeki tüm kişi ve kurumları yönetin.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
          >
            <FileSpreadsheet className="h-5 w-5 mr-2" />
            İçe Aktar
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ name: '', accountCategory: 'Bireysel', typeIds: [], phone: '', email: '', identityNumber: '', taxOffice: '', address: '', city: '', country: '', notes: '' });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Yeni Cari Ekle
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari hesap ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
        <div className="w-full sm:w-64">
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          >
            <option value="">Tüm Türler</option>
            {availableTypes.map(t => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">İsim / Ünvan</th>
                <th className="px-6 py-4 font-medium">Kategori</th>
                <th className="px-6 py-4 font-medium">Tür</th>
                <th className="px-6 py-4 font-medium">Telefon</th>
                <th className="px-6 py-4 font-medium">Durum</th>
                <th className="px-6 py-4 font-medium text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Yükleniyor...
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{account.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {account.accountCategory}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {account.types && account.types.length > 0 ? account.types.map(t => (
                          <span key={t.id} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                            {t.name}
                          </span>
                        )) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{account.phone || '-'}</td>
                    <td className="px-6 py-4">
                      {account.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          Pasif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/current-accounts/${account.id}`} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button onClick={() => handleEdit(account)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(account.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Overlay & Content */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md transition-all duration-300">
          
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-700">
                  <UserCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Cari Hesap Düzenle' : 'Yeni Cari Hesap Ekle'}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Vakıf bağlantılı cari hesap kartı oluşturun.</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">İsim / Ünvan</label>
                <input
                  required
                  type="text"
                  placeholder="Kişi adı veya kurum ünvanı"
                  className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
 
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Kategori</label>
                  <select
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium text-gray-700"
                    value={formData.accountCategory}
                    onChange={e => setFormData({...formData, accountCategory: e.target.value})}
                  >
                    <option value="Bireysel">Bireysel</option>
                    <option value="Kurumsal">Kurumsal</option>
                  </select>
                </div>
              </div>
 
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Cari Sıfatları (Türler)</label>
                <div className="flex flex-wrap gap-2">
                  {availableTypes.map(type => {
                    const isSelected = formData.typeIds.includes(type.id);
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => toggleTypeSelection(type.id)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all duration-200 border ${
                          isSelected 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {type.name}
                      </button>
                    );
                  })}
                </div>
              </div>
 
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Telefon</label>
                  <input
                    type="text"
                    placeholder="05xx xxx xx xx"
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">E-posta</label>
                  <input
                    type="email"
                    placeholder="isim@domain.com"
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">TC / Vergi No</label>
                  <input
                    type="text"
                    placeholder="11 Haneli TC veya 10 Haneli Vergi No"
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium"
                    value={formData.identityNumber}
                    onChange={e => setFormData({...formData, identityNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Vergi Dairesi</label>
                  <input
                    type="text"
                    placeholder="Örn: Ulus V.D."
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium"
                    value={formData.taxOffice}
                    onChange={e => setFormData({...formData, taxOffice: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Adres</label>
                <textarea
                  placeholder="Açık Adres"
                  rows={2}
                  className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium resize-none"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">İl</label>
                  <input
                    type="text"
                    placeholder="Örn: Ankara"
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium"
                    value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Ülke</label>
                  <input
                    type="text"
                    placeholder="Örn: Türkiye"
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium"
                    value={formData.country}
                    onChange={e => setFormData({...formData, country: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Notlar</label>
                <textarea
                  placeholder="Cari hesaba dair ek notlar..."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium resize-none"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                ></textarea>
              </div>
 
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/10 text-sm"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ExcelImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={fetchData}
        endpoint="/current-accounts/import"
        title="Cari Hesapları İçe Aktar"
        templateHeaders={['Ad Soyad/Ünvan', 'Tip ID', 'TC/VKN', 'Telefon', 'E-posta', 'Adres', 'İl', 'İlçe']}
        templateFileName="cari_hesap_sablonu.xlsx"
      />
    </div>
  );
}
