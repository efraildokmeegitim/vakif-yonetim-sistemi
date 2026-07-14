import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from './api';
import { ArrowLeft, Home, Users, Wallet, Stethoscope, Heart, Gift, Archive, CheckCircle, XCircle, Plus, Info } from 'lucide-react';

export default function HouseholdDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showFinModal, setShowFinModal] = useState(false);
  const [showNeedModal, setShowNeedModal] = useState(false);
  const [showAidModal, setShowAidModal] = useState(false);

  const loadData = async () => {
    try {
      const res = await api.get(`/households/${id}`);
      const historyRes = await api.get(`/households/${id}/aid-history`);
      setData({ ...res.data, aidHistory: historyRes.data });
    } catch (e: any) {
      if (e.response?.status === 404) navigate('/households');
    }
  };

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const payload = Object.fromEntries(fd.entries());
    payload.isZakatEligible = fd.has('isZakatEligible');
    try {
      await api.patch(`/households/${id}/personal-info`, payload);
      alert('Kişisel bilgiler başarıyla güncellendi.');
      loadData();
    } catch { alert('Hata oluştu'); }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleStatusChange = async (status: string) => {
    try {
      await api.patch(`/households/${id}/status`, { status });
      loadData();
    } catch (e) { alert('Hata oluştu'); }
  };

  const handleArchive = async () => {
    if (!confirm('Haneyi arşivlemek istediğinize emin misiniz?')) return;
    try {
      await api.post(`/households/${id}/archive`);
      navigate('/households');
    } catch (e) { alert('Hata oluştu'); }
  };

  const handleCreate = async (endpoint: string, setModal: (val: boolean) => void, e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const payload = Object.fromEntries(fd.entries());
    try {
      await api.post(`/households/${id}/${endpoint}`, payload);
      setModal(false);
      loadData();
    } catch { alert('Hata oluştu'); }
  };

  const handleDelete = async (endpoint: string, itemId: number) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return;
    try {
      await api.post(`/households/${endpoint}/${itemId}/delete`);
      loadData();
    } catch { alert('Hata oluştu'); }
  };

  if (!data) return <div className="p-8">Yükleniyor...</div>;
  const { household, members, financials, healthConditions, needs, aids, aidHistory } = data;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Link to="/households" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Hanelere Dön
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{household.familyName} Ailesi</h1>
            <p className="text-gray-500">{household.contactNumber} &bull; {household.district} / {household.city}</p>
          </div>
          <div className="flex gap-3">
            {household.status === 'İncelemede' && (
              <>
                <button onClick={() => handleStatusChange('Onaylandı')} className="px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 flex items-center gap-2 font-medium">
                  <CheckCircle className="w-4 h-4" /> Onayla
                </button>
                <button onClick={() => handleStatusChange('Reddedildi')} className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 flex items-center gap-2 font-medium">
                  <XCircle className="w-4 h-4" /> Reddet
                </button>
              </>
            )}
            <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
              household.status === 'Onaylandı' ? 'bg-green-100 text-green-800' : 
              household.status === 'Reddedildi' ? 'bg-red-100 text-red-800' : 
              'bg-yellow-100 text-yellow-800'
            }`}>
              {household.status}
            </span>
            <button onClick={handleArchive} className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200"><Archive className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2"><Info className="w-5 h-5 text-gray-400" /> Adres Detayı</h3>
          <p className="text-gray-600 text-sm whitespace-pre-line">{household.address || 'Adres bilgisi bulunmuyor.'}</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200 mb-6 overflow-x-auto">
        <button onClick={() => setActiveTab('personal')} className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 whitespace-nowrap ${activeTab === 'personal' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><Info className="w-4 h-4" /> Kişisel Bilgiler</button>
        <button onClick={() => setActiveTab('members')} className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 whitespace-nowrap ${activeTab === 'members' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><Users className="w-4 h-4" /> Hane Halkı ({members.length})</button>
        <button onClick={() => setActiveTab('financials')} className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 whitespace-nowrap ${activeTab === 'financials' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><Wallet className="w-4 h-4" /> Gelir/Gider</button>
        <button onClick={() => setActiveTab('health')} className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 whitespace-nowrap ${activeTab === 'health' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><Stethoscope className="w-4 h-4" /> Sağlık Durumu</button>
        <button onClick={() => setActiveTab('needs')} className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 whitespace-nowrap ${activeTab === 'needs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><Heart className="w-4 h-4" /> İhtiyaçlar</button>
        <button onClick={() => setActiveTab('aids')} className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 whitespace-nowrap ${activeTab === 'aids' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><Gift className="w-4 h-4" /> Diğer Kurum Yardımları</button>
        <button onClick={() => setActiveTab('aidHistory')} className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 whitespace-nowrap ${activeTab === 'aidHistory' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><Archive className="w-4 h-4" /> Vakfımızdan Ayni Yardımlar</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-[300px]">
        {activeTab === 'personal' && (
          <form onSubmit={handlePersonalSubmit} className="space-y-6">
            <h2 className="text-lg font-bold mb-4">Başvuru Sahibi Kişisel Bilgileri</h2>
            <div className="grid grid-cols-3 gap-6">
              <div><label className="block text-xs font-bold text-gray-500 mb-1">BABA ADI</label><input name="fatherName" defaultValue={household.fatherName} className="w-full border p-2 rounded-lg" /></div>
              <div><label className="block text-xs font-bold text-gray-500 mb-1">ANNE ADI</label><input name="motherName" defaultValue={household.motherName} className="w-full border p-2 rounded-lg" /></div>
              <div><label className="block text-xs font-bold text-gray-500 mb-1">DOĞUM YERİ</label><input name="birthPlace" defaultValue={household.birthPlace} className="w-full border p-2 rounded-lg" /></div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div><label className="block text-xs font-bold text-gray-500 mb-1">DOĞUM TARİHİ</label><input name="birthDate" type="date" defaultValue={household.birthDate} className="w-full border p-2 rounded-lg" /></div>
              <div><label className="block text-xs font-bold text-gray-500 mb-1">CİNSİYET</label><select name="gender" defaultValue={household.gender} className="w-full border p-2 rounded-lg"><option value="">Belirtilmemiş</option><option value="Erkek">Erkek</option><option value="Kadın">Kadın</option></select></div>
              <div><label className="block text-xs font-bold text-gray-500 mb-1">UYRUK</label><input name="nationality" defaultValue={household.nationality} className="w-full border p-2 rounded-lg" /></div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div><label className="block text-xs font-bold text-gray-500 mb-1">MEDENİ DURUM</label><input name="maritalStatus" defaultValue={household.maritalStatus} className="w-full border p-2 rounded-lg" /></div>
              <div><label className="block text-xs font-bold text-gray-500 mb-1">EĞİTİM DURUMU</label><input name="educationStatus" defaultValue={household.educationStatus} className="w-full border p-2 rounded-lg" /></div>
              <div><label className="block text-xs font-bold text-gray-500 mb-1">MESLEK</label><input name="job" defaultValue={household.job} className="w-full border p-2 rounded-lg" /></div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div><label className="block text-xs font-bold text-gray-500 mb-1">ÇALIŞMA DURUMU</label><input name="workStatus" defaultValue={household.workStatus} className="w-full border p-2 rounded-lg" /></div>
              <div><label className="block text-xs font-bold text-gray-500 mb-1">KONUT TÜRÜ</label><input name="housingType" placeholder="Gecekondu, Apartman vb." defaultValue={household.housingType} className="w-full border p-2 rounded-lg" /></div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">SOSYAL GÜVENCE</label>
                <select name="socialSecurityStatus" defaultValue={household.socialSecurityStatus} className="w-full border p-2 rounded-lg">
                  <option value="">Bilinmiyor</option><option value="Yok">Yok</option><option value="SSK">SSK (4A)</option><option value="BAĞKUR">BAĞ-KUR (4B)</option><option value="Emekli Sandığı">Emekli Sandığı (4C)</option><option value="Yeşil Kart">Yeşil Kart / GSS</option><option value="Diğer">Diğer</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <input type="checkbox" name="isZakatEligible" id="isZakatEligible" defaultChecked={household.isZakatEligible} className="w-5 h-5" />
              <label htmlFor="isZakatEligible" className="font-bold text-gray-800">Bu hane zekat almaya uygun mu?</label>
            </div>
            <div className="text-right">
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Kaydet</button>
            </div>
          </form>
        )}
        {activeTab === 'members' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Hane Halkı</h2>
              <button onClick={() => setShowMemberModal(true)} className="text-sm px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-medium">Kişi Ekle</button>
            </div>
            {members.length === 0 ? <p className="text-gray-500 text-sm">Hane halkı bilgisi yok.</p> : (
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500">
                  <tr><th className="p-3">Ad Soyad</th><th className="p-3">Yakınlık</th><th className="p-3">Doğum T.</th><th className="p-3">Eğitim</th><th className="p-3">Durum</th><th className="p-3 text-right">İşlem</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {members.map((m: any) => (
                    <tr key={m.id}>
                      <td className="p-3 font-medium">{m.name}</td>
                      <td className="p-3">{m.relation}</td>
                      <td className="p-3">{m.birthDate}</td>
                      <td className="p-3">{m.education}</td>
                      <td className="p-3">{m.isOrphan ? <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">Yetim</span> : '-'}</td>
                      <td className="p-3 text-right"><button onClick={() => handleDelete('members', m.id)} className="text-red-500 hover:text-red-700">Sil</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'financials' && (
          <div>
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-lg font-bold">Ekonomik Durum Analizi</h2>
               <button onClick={() => setShowFinModal(true)} className="text-sm px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-medium">Finans Ekle</button>
             </div>
             {financials.length === 0 ? <p className="text-gray-500 text-sm">Finansal bilgi girilmemiş.</p> : (
               <div className="grid grid-cols-2 gap-4">
                 {financials.map((f: any) => (
                   <div key={f.id} className="p-4 border rounded-xl">
                     <p className="text-gray-500 text-sm">Aylık Gelir:</p>
                     <p className="font-bold text-green-600 mb-2">{f.income} TL</p>
                     <p className="text-gray-500 text-sm">Aylık Gider (Kira, Fatura):</p>
                     <p className="font-bold text-red-600 mb-2">{f.expense} TL</p>
                     <p className="text-gray-500 text-sm">Borç:</p>
                     <p className="font-bold text-red-800 mb-2">{f.debt} TL</p>
                     <p className="text-gray-500 text-sm">Barınma Durumu:</p>
                     <p className="font-medium mb-3">{f.housingStatus}</p>
                     <button onClick={() => handleDelete('financials', f.id)} className="text-sm text-red-500 hover:text-red-700">Sil</button>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {activeTab === 'health' && (
          <div>
            <h2 className="text-lg font-bold mb-4">Sağlık ve Engellilik Durumu</h2>
            {healthConditions.length === 0 ? <p className="text-gray-500 text-sm">Sağlık sorunu kaydı yok.</p> : (
               <ul className="space-y-3">
                 {healthConditions.map((hc: any) => (
                   <li key={hc.id} className="p-4 border rounded-xl flex items-start gap-3">
                     <Stethoscope className="w-5 h-5 text-red-500 mt-0.5" />
                     <div>
                       <p className="font-bold text-gray-900">{hc.condition}</p>
                       {hc.report && <p className="text-sm text-blue-600 mt-1">📄 Rapor: {hc.report}</p>}
                       {hc.notes && <p className="text-sm text-gray-500 mt-1">{hc.notes}</p>}
                     </div>
                   </li>
                 ))}
               </ul>
            )}
          </div>
        )}

        {activeTab === 'needs' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">İhtiyaçlar</h2>
              <button onClick={() => setShowNeedModal(true)} className="text-sm px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-medium">İhtiyaç Ekle</button>
            </div>
            {needs.length === 0 ? <p className="text-gray-500 text-sm">İhtiyaç kaydı yok.</p> : (
               <div className="space-y-3">
                 {needs.map((n: any) => (
                   <div key={n.id} className="p-4 border rounded-xl flex justify-between items-center">
                     <div>
                       <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded mb-1 inline-block">{n.category}</span>
                       <p className="font-medium">{n.description}</p>
                     </div>
                     <div className="flex items-center gap-3">
                       <span className={`px-3 py-1 rounded-full text-xs font-medium ${n.status === 'Karşılandı' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                         {n.status}
                       </span>
                       <button onClick={() => handleDelete('needs', n.id)} className="text-sm text-red-500">Sil</button>
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </div>
        )}

        {activeTab === 'aids' && (
          <div>
             <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Dış Kurumlardan Alınan Yardımlar</h2>
              <button onClick={() => setShowAidModal(true)} className="text-sm px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-medium">Yardım Girişi</button>
            </div>
            {aids.length === 0 ? <p className="text-gray-500 text-sm">Henüz yardım yapılmamış.</p> : (
               <div className="space-y-3">
                 {aids.map((a: any) => (
                   <div key={a.id} className="p-4 border rounded-xl flex justify-between items-center bg-gray-50">
                     <div className="flex gap-3 items-center">
                       <Gift className="w-6 h-6 text-pink-500" />
                       <div>
                         <p className="font-bold text-gray-900">{a.type}</p>
                         <p className="text-sm text-gray-500">{new Date(a.aidDate).toLocaleDateString()} &bull; {a.description}</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-4">
                       {a.amount && <p className="font-bold text-green-600 text-lg">+{a.amount} {a.currency}</p>}
                       <button onClick={() => handleDelete('external-aids', a.id)} className="text-sm text-red-500">Sil</button>
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </div>
        )}

        {activeTab === 'aidHistory' && (
          <div>
            <h2 className="text-lg font-bold mb-4">Vakfımız Tarafından Yapılan Ayni Yardım Geçmişi</h2>
            {!aidHistory || aidHistory.length === 0 ? <p className="text-gray-500 text-sm">Vakfımızdan henüz ayni yardım alınmamış.</p> : (
               <table className="w-full text-sm text-left">
                 <thead className="bg-gray-50 text-gray-500">
                   <tr><th className="p-3">Tarih</th><th className="p-3">Yardım/Ürün</th><th className="p-3 text-center">Miktar</th><th className="p-3">Depo</th></tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {aidHistory.map((h: any, i: number) => (
                     <tr key={i}>
                       <td className="p-3">{new Date(h.transaction_date).toLocaleDateString()}</td>
                       <td className="p-3 font-bold">{h.item_name}</td>
                       <td className="p-3 text-center text-green-600 font-medium">{h.quantity} {h.unit}</td>
                       <td className="p-3">{h.warehouse_name}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            )}
          </div>
        )}

      </div>

      {showMemberModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Hane Halkı Üyesi Ekle
              </h2>
              <button onClick={() => setShowMemberModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            
            <form onSubmit={e => handleCreate('members', setShowMemberModal, e)} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Ad Soyad</label>
                <input name="name" type="text" required placeholder="Ad Soyad" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Yakınlık Derecesi</label>
                  <input name="relation" type="text" required placeholder="Örn: Eşi, Oğlu" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Doğum Tarihi</label>
                  <input name="birthDate" type="date" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium text-gray-700" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Eğitim Durumu</label>
                <input name="education" type="text" placeholder="Örn: İlkokul, Üniversite" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium" />
              </div>
              
              <label className="flex items-center gap-3 p-3 bg-blue-50/30 border border-blue-100/60 rounded-xl cursor-pointer hover:bg-blue-50/60 transition-colors">
                <input type="checkbox" name="isOrphan" value="1" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-blue-900">Yetim / Öksüz mü?</p>
                </div>
              </label>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button type="button" onClick={() => setShowMemberModal(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/10 text-sm">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFinModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-600" />
                Ekonomik Durum Analizi Ekle
              </h2>
              <button onClick={() => setShowFinModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            
            <form onSubmit={e => handleCreate('financials', setShowFinModal, e)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Aylık Gelir (TL)</label>
                  <input name="income" type="number" required placeholder="0.00" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-bold text-gray-800" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Aylık Gider (TL)</label>
                  <input name="expense" type="number" required placeholder="0.00" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-bold text-gray-800" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Toplam Borç (TL)</label>
                <input name="debt" type="number" required placeholder="0.00" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-bold text-gray-800" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Barınma Durumu</label>
                <input name="housingStatus" type="text" required placeholder="Örn: Kiracı, Mülk Sahibi, Lojman" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium" />
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button type="button" onClick={() => setShowFinModal(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/10 text-sm">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNeedModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Heart className="h-5 w-5 text-blue-600" />
                İhtiyaç Ekle
              </h2>
              <button onClick={() => setShowNeedModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            
            <form onSubmit={e => handleCreate('needs', setShowNeedModal, e)} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">İhtiyaç Kategorisi</label>
                <input name="category" type="text" required placeholder="Gıda, Eğitim, Sağlık, Fatura vb." className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Detaylı Açıklama</label>
                <textarea name="description" required placeholder="İhtiyacın detaylarını açıklayın..." className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium h-20 resize-none"></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Durum</label>
                <select name="status" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium text-gray-700">
                  <option value="Bekliyor">Bekliyor</option>
                  <option value="Karşılandı">Karşılandı</option>
                </select>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button type="button" onClick={() => setShowNeedModal(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/10 text-sm">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAidModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Gift className="h-5 w-5 text-blue-600" />
                Dış Yardım Ekle
              </h2>
              <button onClick={() => setShowAidModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            
            <form onSubmit={e => handleCreate('external-aids', setShowAidModal, e)} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Yardım Türü</label>
                <input name="type" type="text" required placeholder="Örn: Kaymakamlık Maaşı, Kömür Yardımı" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Yardım Tarihi</label>
                <input name="aidDate" type="date" required className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium text-gray-700" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Açıklama</label>
                <textarea name="description" placeholder="Açıklama veya periyot..." className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium h-16 resize-none"></textarea>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Aylık Tutar (Opsiyonel)</label>
                  <input name="amount" type="number" placeholder="0.00" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-bold text-gray-800" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Para Birimi</label>
                  <input name="currency" defaultValue="TRY" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-bold text-gray-700" />
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button type="button" onClick={() => setShowAidModal(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/10 text-sm">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
