import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Package, GraduationCap, Heart, FileText, Target } from 'lucide-react';
import api from './api';
import CurrentAccountSocialReviewTab from './CurrentAccountSocialReviewTab';
import CurrentAccountScholarshipTab from './CurrentAccountScholarshipTab';
import CurrentAccountTransactionsTab from './CurrentAccountTransactionsTab';
import CurrentAccountPartnershipTab from './CurrentAccountPartnershipTab';

export default function CurrentAccountDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [account, setAccount] = useState<any>(null);
  const [sacrificeShares, setSacrificeShares] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [aidLimits, setAidLimits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('genel');
  const [showDocModal, setShowDocModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [docForm, setDocForm] = useState({ title: '', description: '', filePath: 'dummy/path' });
  const [limitForm, setLimitForm] = useState({ category: '', max_amount: '', period: 'Yıllık' });

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const [accRes, sharesRes, docRes, limitRes] = await Promise.all([
        api.get(`/current-accounts`).catch(() => ({ data: [] })),
        api.get(`/sacrifices/shares/donor/${id}`).catch(() => ({ data: [] })),
        api.get(`/current-accounts/${id}/documents`).catch(() => ({ data: [] })),
        api.get(`/current-accounts/${id}/aid-limits`).catch(() => ({ data: [] }))
      ]);
      
      const currentAccount = accRes.data.find((a: any) => a.id.toString() === id);
      setAccount(currentAccount);
      setSacrificeShares(sharesRes.data);
      setDocuments(docRes.data);
      setAidLimits(limitRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const handleSaveDoc = async () => {
    await api.post(`/current-accounts/${id}/documents`, docForm);
    setShowDocModal(false);
    fetchDetail();
  };

  const handleDeleteDoc = async (docId: number) => {
    if (!confirm('Emin misiniz?')) return;
    await api.post(`/current-accounts/${id}/documents/${docId}/delete`);
    fetchDetail();
  };

  const handleSaveLimit = async () => {
    await api.post(`/current-accounts/${id}/aid-limits`, limitForm);
    setShowLimitModal(false);
    fetchDetail();
  };

  const handleDeleteLimit = async (limitId: number) => {
    if (!confirm('Emin misiniz?')) return;
    await api.post(`/current-accounts/aid-limits/${limitId}/delete`);
    fetchDetail();
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;
  }

  if (!account) {
    return <div className="p-8 text-center text-gray-500">Cari hesap bulunamadı.</div>;
  }

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate('/current-accounts')}
        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Cari Hesaplara Dön
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-4">
          <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{account.name}</h1>
            <div className="flex gap-2 mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                {account.accountCategory}
              </span>
              {account.phone && <span className="text-sm text-gray-500">{account.phone}</span>}
            </div>
          </div>
        </div>
        
        <div className="flex border-b border-gray-200 px-6">
          <button
            className={`pb-3 pt-4 font-medium text-sm border-b-2 transition-colors mr-6 ${activeTab === 'genel' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('genel')}
          >
            Genel Bilgiler
          </button>
          <button
            className={`pb-3 pt-4 font-medium text-sm border-b-2 transition-colors mr-6 flex items-center gap-2 ${activeTab === 'ekstre' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('ekstre')}
          >
            <FileText className="w-4 h-4" /> Hesap Ekstresi
          </button>
          {(account.types?.some((t: any) => t.name.includes('Bağışçı') || t.name.includes('Ortak')) || sacrificeShares.length > 0) && (
            <button
              className={`pb-3 pt-4 font-medium text-sm border-b-2 transition-colors mr-6 flex items-center gap-2 ${activeTab === 'kurban' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('kurban')}
            >
              <Package className="w-4 h-4" /> Kurban Bağışları
            </button>
          )}
          <button
            className={`pb-3 pt-4 font-medium text-sm border-b-2 transition-colors mr-6 ${activeTab === 'belgeler' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('belgeler')}
          >
            Belgeler
          </button>
          {account.types?.some((t: any) => t.name.includes('İhtiyaç Sahibi') || t.name.includes('Öğrenci') || t.name.includes('Bursiyer')) && (
            <button
              className={`pb-3 pt-4 font-medium text-sm border-b-2 transition-colors mr-6 ${activeTab === 'yardim_limiti' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('yardim_limiti')}
            >
              Yardım Kotaları
            </button>
          )}
          
          {account.types?.some((t: any) => t.name.includes('Öğrenci') || t.name.includes('Bursiyer')) && (
            <button
              className={`pb-3 pt-4 font-medium text-sm border-b-2 transition-colors mr-6 flex items-center gap-2 ${activeTab === 'ogrenci' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('ogrenci')}
            >
              <GraduationCap className="w-4 h-4" /> Burs ve Eğitim
            </button>
          )}

          {account.types?.some((t: any) => t.name.includes('İhtiyaç Sahibi')) && (
            <button
              className={`pb-3 pt-4 font-medium text-sm border-b-2 transition-colors mr-6 flex items-center gap-2 ${activeTab === 'sosyal' ? 'border-rose-500 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('sosyal')}
            >
              <Heart className="w-4 h-4" /> Sosyal İnceleme
            </button>
          )}

          {account.types?.some((t: any) => t.name.includes('Ortak')) && (
            <button
              className={`pb-3 pt-4 font-medium text-sm border-b-2 transition-colors mr-6 flex items-center gap-2 ${activeTab === 'ortak' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('ortak')}
            >
              <Target className="w-4 h-4" /> Ortaklık Bilgileri
            </button>
          )}
        </div>

        <div className="p-6">
          {activeTab === 'genel' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 max-w-lg">
                <div>
                  <p className="text-xs text-gray-500 font-medium">TC / Vergi No</p>
                  <p className="text-sm font-medium text-gray-900">{account.identityNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Vergi Dairesi</p>
                  <p className="text-sm font-medium text-gray-900">{account.taxOffice || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">E-Posta</p>
                  <p className="text-sm font-medium text-gray-900">{account.email || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Telefon</p>
                  <p className="text-sm font-medium text-gray-900">{account.phone || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 font-medium">Adres</p>
                  <p className="text-sm font-medium text-gray-900">{account.address || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'kurban' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/50 text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Tarih</th>
                    <th className="px-4 py-3 font-medium">Kampanya</th>
                    <th className="px-4 py-3 font-medium">Grup / Hayvan</th>
                    <th className="px-4 py-3 font-medium">Niyet</th>
                    <th className="px-4 py-3 font-medium text-right">Tutar</th>
                    <th className="px-4 py-3 font-medium text-center">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sacrificeShares.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Bu kişiye ait kurban bağışı bulunmamaktadır.</td>
                    </tr>
                  ) : (
                    sacrificeShares.map(share => (
                      <tr key={share.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-gray-600">{new Date(share.createdAt).toLocaleDateString('tr-TR')}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{share.group?.campaign?.name || '-'} ({share.group?.campaign?.year})</td>
                        <td className="px-4 py-3 text-gray-900">{share.group?.name || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{share.shareType} {share.isProxyGiven && '(Vekalet)'}</td>
                        <td className="px-4 py-3 font-medium text-gray-900 text-right">{share.amountPaid} {share.currency}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider ${
                            share.group?.status === 'Bekliyor' ? 'bg-amber-100 text-amber-800' :
                            share.group?.status === 'Kesildi' ? 'bg-emerald-100 text-emerald-800' :
                            share.group?.status === 'Aktarıldı' ? 'bg-purple-100 text-purple-800' :
                            share.group?.status === 'Dağıtıldı' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {share.group?.status || 'Bekliyor'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'belgeler' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Hesap Belgeleri</h3>
                <button onClick={() => setShowDocModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Yeni Belge</button>
              </div>
              <div className="bg-white rounded-xl border border-gray-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr><th className="px-4 py-3">Başlık</th><th className="px-4 py-3">Açıklama</th><th className="px-4 py-3 text-right">İşlem</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {documents.map(d => (
                      <tr key={d.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{d.title}</td>
                        <td className="px-4 py-3 text-gray-500">{d.description}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDeleteDoc(d.id)} className="text-red-500 hover:text-red-700 text-sm">Sil</button>
                        </td>
                      </tr>
                    ))}
                    {documents.length === 0 && (
                      <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">Belge bulunamadı.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'yardim_limiti' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Yardım Kotaları / Limitler</h3>
                <button onClick={() => setShowLimitModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Yeni Kota Ekle</button>
              </div>
              <div className="bg-white rounded-xl border border-gray-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3">Kategori</th>
                      <th className="px-4 py-3">Maksimum Tutar</th>
                      <th className="px-4 py-3">Kullanılan</th>
                      <th className="px-4 py-3">Dönem</th>
                      <th className="px-4 py-3 text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {aidLimits.map(l => (
                      <tr key={l.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{l.category}</td>
                        <td className="px-4 py-3 text-gray-500">{l.max_amount} TL</td>
                        <td className="px-4 py-3 text-gray-500">{l.used_amount} TL</td>
                        <td className="px-4 py-3 text-gray-500">{l.period}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDeleteLimit(l.id)} className="text-red-500 hover:text-red-700 text-sm">Sil</button>
                        </td>
                      </tr>
                    ))}
                    {aidLimits.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Kayıtlı kota bulunmamaktadır.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'ekstre' && (
            <CurrentAccountTransactionsTab accountId={id!} />
          )}

          {activeTab === 'ogrenci' && (
            <CurrentAccountScholarshipTab accountId={id!} />
          )}

          {activeTab === 'sosyal' && (
            <CurrentAccountSocialReviewTab accountId={id!} />
          )}

          {activeTab === 'ortak' && (
            <CurrentAccountPartnershipTab accountId={id!} />
          )}
        </div>
      </div>

      {showDocModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Yeni Belge Ekle
              </h3>
              <button onClick={() => setShowDocModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Belge Başlığı</label>
                <input type="text" placeholder="Örn: Nüfus Kayıt Örneği" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium" value={docForm.title} onChange={e => setDocForm({...docForm, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Açıklama</label>
                <textarea placeholder="Belge ile ilgili kısa notlar..." className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium h-24 resize-none" value={docForm.description} onChange={e => setDocForm({...docForm, description: e.target.value})}></textarea>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button onClick={() => setShowDocModal(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button onClick={handleSaveDoc} className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/10 text-sm">Kaydet</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showLimitModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-600" />
                Yeni Limit Tanımla
              </h3>
              <button onClick={() => setShowLimitModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Kategori</label>
                <input type="text" placeholder="Örn: Gıda Yardımı, Nakdi Yardım" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium" value={limitForm.category} onChange={e => setLimitForm({...limitForm, category: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Kota Limiti</label>
                  <input type="number" placeholder="0.00" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-bold text-gray-800" value={limitForm.max_amount} onChange={e => setLimitForm({...limitForm, max_amount: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Periyot</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium text-gray-700" value={limitForm.period} onChange={e => setLimitForm({...limitForm, period: e.target.value})}>
                    <option value="Yıllık">Yıllık</option>
                    <option value="Aylık">Aylık</option>
                    <option value="Tek Seferlik">Tek Seferlik</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button onClick={() => setShowLimitModal(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button onClick={handleSaveLimit} className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/10 text-sm">Kaydet</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
