import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from './api';
import { ArrowLeft, GraduationCap, Plus, Wallet, FileText, DollarSign } from 'lucide-react';

export default function ScholarshipDetail() {
  const { id } = useParams();
  const [scholarship, setScholarship] = useState<any>(null);
  const [accruals, setAccruals] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState<'accruals' | 'payments' | 'details' | 'family'>('accruals');
  const [showAccrualModal, setShowAccrualModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isEditingFamily, setIsEditingFamily] = useState(false);
  
  const [accrualForm, setAccrualForm] = useState({ period: '', amount: '', currency: 'TRY' });
  const [paymentForm, setPaymentForm] = useState({ accrualId: '', amount: '', wallet_id: '', transaction_date: new Date().toISOString().split('T')[0], notes: '' });

  const loadData = async () => {
    try {
      const [schRes, accRes, payRes, walletRes] = await Promise.all([
        api.get(`/scholarships/${id}`),
        api.get(`/scholarships/${id}/accruals`),
        api.get(`/scholarships/${id}/payments`),
        api.get('/api/wallets').catch(() => ({ data: [] }))
      ]);
      setScholarship(schRes.data);
      setAccruals(accRes.data);
      setPayments(payRes.data);
      setWallets(walletRes.data);
    } catch (e: any) {
      alert('Veriler yüklenirken hata oluştu.');
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleCreateAccrual = async () => {
    try {
      await api.post(`/scholarships/${id}/accruals`, accrualForm);
      setShowAccrualModal(false);
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Tahakkuk oluşturulurken hata oluştu.');
    }
  };

  const handleMakePayment = async () => {
    try {
      await api.post(`/scholarships/${id}/payments`, paymentForm);
      setShowPaymentModal(false);
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Ödeme işlemi başarısız.');
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const payload = Object.fromEntries(fd.entries());
    try {
      await api.post(`/scholarships/${id}/student-details`, payload);
      alert('Kaydedildi');
      setIsEditingDetails(false);
      loadData();
    } catch { alert('Hata oluştu'); }
  };

  const handleSaveFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const payload = {
      ...Object.fromEntries(fd.entries()),
      sibling_count: fd.get('sibling_count') ? parseInt(fd.get('sibling_count') as string) : null,
      studying_sibling_count: fd.get('studying_sibling_count') ? parseInt(fd.get('studying_sibling_count') as string) : null,
      family_income: fd.get('family_income') ? parseFloat(fd.get('family_income') as string) : null
    };
    try {
      await api.post(`/scholarships/${id}/family-info`, payload);
      alert('Kaydedildi');
      setIsEditingFamily(false);
      loadData();
    } catch { alert('Hata oluştu'); }
  };

  if (!scholarship) return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;
  const { studentDetails, studentFamilyInfo } = scholarship;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/scholarships" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-emerald-600" />
            Burs Detayı
          </h1>
          <p className="text-gray-500 mt-1">Öğrenci Cari ID: #{scholarship.scholarship.studentCaId} • Dönem: {scholarship.scholarship.period}</p>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="flex-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Aylık Burs Miktarı</p>
          <p className="text-2xl font-bold text-gray-900">{Number(scholarship.scholarship.amount).toLocaleString('tr-TR')} {scholarship.scholarship.currency}</p>
        </div>
        <div className="flex-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Durum</p>
          <p className="text-2xl font-bold text-emerald-600">{scholarship.scholarship.status}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('accruals')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'accruals' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Tahakkuklar (Borçlandırmalar)
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'payments' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Ödeme Geçmişi
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'details' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Öğrenci Bilgileri
        </button>
        <button
          onClick={() => setActiveTab('family')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'family' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Aile ve Gelir Durumu
        </button>
      </div>

      {activeTab === 'accruals' && (
        <div>
          <button 
            onClick={() => {
              setAccrualForm({ period: new Date().toISOString().substring(0,7), amount: scholarship.amount, currency: scholarship.currency });
              setShowAccrualModal(true);
            }} 
            className="mb-4 px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Tahakkuk Oluştur
          </button>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Dönem</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Tutar</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Ödenen</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-600">Durum</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {accruals.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm font-medium">{a.period}</td>
                    <td className="py-4 px-6 text-sm text-right font-mono">{Number(a.amount).toLocaleString('tr-TR')} {a.currency}</td>
                    <td className="py-4 px-6 text-sm text-right font-mono text-emerald-600">{Number(a.totalPaid).toLocaleString('tr-TR')} {a.currency}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        a.status === 'Ödendi' ? 'bg-green-100 text-green-700' :
                        a.status === 'Ödenmedi' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {a.status !== 'Ödendi' && (
                        <button 
                          onClick={() => {
                            setPaymentForm({ ...paymentForm, accrualId: a.id, amount: (a.amount - a.totalPaid).toString() });
                            setShowPaymentModal(true);
                          }}
                          className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-sm hover:bg-emerald-100 font-medium"
                        >
                          Ödeme Yap
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {accruals.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-gray-500">Tahakkuk bulunamadı.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Tarih</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">İşlem No</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Açıklama</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Tutar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-sm">{p.paymentDate}</td>
                  <td className="py-4 px-6 text-sm font-mono text-gray-500">#{p.transactionId}</td>
                  <td className="py-4 px-6 text-sm">{p.notes}</td>
                  <td className="py-4 px-6 text-sm text-right font-mono font-medium text-gray-900">{Number(p.amount).toLocaleString('tr-TR')}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-gray-500">Henüz ödeme yapılmamış.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'details' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><GraduationCap className="text-emerald-600" /> Öğrenci Eğitim Bilgileri</h2>
            <button onClick={() => setIsEditingDetails(!isEditingDetails)} className="text-sm text-blue-600 hover:underline">
              {isEditingDetails ? 'İptal' : 'Düzenle'}
            </button>
          </div>
          {isEditingDetails ? (
            <form onSubmit={handleSaveDetails} className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Okul Adı</label><input name="school_name" defaultValue={studentDetails?.school_name} className="w-full border p-2 rounded" /></div>
              <div><label className="block text-sm font-medium mb-1">Bölüm</label><input name="department" defaultValue={studentDetails?.department} className="w-full border p-2 rounded" /></div>
              <div><label className="block text-sm font-medium mb-1">Sınıf / Kademe</label><input name="grade_level" defaultValue={studentDetails?.grade_level} className="w-full border p-2 rounded" /></div>
              <div><label className="block text-sm font-medium mb-1">Not Ortalaması (GPA)</label><input name="gpa" defaultValue={studentDetails?.gpa} className="w-full border p-2 rounded" /></div>
              <div><label className="block text-sm font-medium mb-1">Okul Numarası</label><input name="student_number" defaultValue={studentDetails?.student_number} className="w-full border p-2 rounded" /></div>
              <div className="col-span-2 text-right"><button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg">Kaydet</button></div>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div><p className="text-gray-500 mb-1">Okul Adı</p><p className="font-semibold">{studentDetails?.school_name || '-'}</p></div>
              <div><p className="text-gray-500 mb-1">Bölüm</p><p className="font-semibold">{studentDetails?.department || '-'}</p></div>
              <div><p className="text-gray-500 mb-1">Sınıf / Kademe</p><p className="font-semibold">{studentDetails?.grade_level || '-'}</p></div>
              <div><p className="text-gray-500 mb-1">Not Ortalaması (GPA)</p><p className="font-semibold">{studentDetails?.gpa || '-'}</p></div>
              <div><p className="text-gray-500 mb-1">Okul Numarası</p><p className="font-semibold">{studentDetails?.student_number || '-'}</p></div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'family' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><FileText className="text-emerald-600" /> Aile ve Gelir Durumu</h2>
            <button onClick={() => setIsEditingFamily(!isEditingFamily)} className="text-sm text-blue-600 hover:underline">
              {isEditingFamily ? 'İptal' : 'Düzenle'}
            </button>
          </div>
          {isEditingFamily ? (
            <form onSubmit={handleSaveFamily} className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Kardeş Sayısı</label><input type="number" name="sibling_count" defaultValue={studentFamilyInfo?.siblingCount} className="w-full border p-2 rounded" /></div>
              <div><label className="block text-sm font-medium mb-1">Okuyan Kardeş Sayısı</label><input type="number" name="studying_sibling_count" defaultValue={studentFamilyInfo?.studyingSiblingCount} className="w-full border p-2 rounded" /></div>
              <div><label className="block text-sm font-medium mb-1">Baba Mesleği</label><input name="father_profession" defaultValue={studentFamilyInfo?.fatherProfession} className="w-full border p-2 rounded" /></div>
              <div><label className="block text-sm font-medium mb-1">Anne Mesleği</label><input name="mother_profession" defaultValue={studentFamilyInfo?.motherProfession} className="w-full border p-2 rounded" /></div>
              <div><label className="block text-sm font-medium mb-1">Aylık Toplam Gelir</label><input type="number" name="family_income" defaultValue={studentFamilyInfo?.familyIncome} className="w-full border p-2 rounded" /></div>
              <div><label className="block text-sm font-medium mb-1">Barınma Durumu (Kira, Kendi vb.)</label><input name="housing_status" defaultValue={studentFamilyInfo?.housingStatus} className="w-full border p-2 rounded" /></div>
              <div className="col-span-2 text-right"><button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg">Kaydet</button></div>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div><p className="text-gray-500 mb-1">Kardeş Sayısı</p><p className="font-semibold">{studentFamilyInfo?.siblingCount || '-'}</p></div>
              <div><p className="text-gray-500 mb-1">Okuyan Kardeş Sayısı</p><p className="font-semibold">{studentFamilyInfo?.studyingSiblingCount || '-'}</p></div>
              <div><p className="text-gray-500 mb-1">Baba Mesleği</p><p className="font-semibold">{studentFamilyInfo?.fatherProfession || '-'}</p></div>
              <div><p className="text-gray-500 mb-1">Anne Mesleği</p><p className="font-semibold">{studentFamilyInfo?.motherProfession || '-'}</p></div>
              <div><p className="text-gray-500 mb-1">Aylık Toplam Gelir</p><p className="font-semibold">{studentFamilyInfo?.familyIncome ? `${studentFamilyInfo.familyIncome} ₺` : '-'}</p></div>
              <div><p className="text-gray-500 mb-1">Barınma Durumu</p><p className="font-semibold">{studentFamilyInfo?.housingStatus || '-'}</p></div>
            </div>
          )}
        </div>
      )}

      {/* Accrual Modal */}
      {showAccrualModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FileText className="text-emerald-600" /> Tahakkuk (Borç) Oluştur</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Dönem (Örn: 2026-10)</label>
                <input type="text" className="w-full border p-2 rounded-xl" value={accrualForm.period} onChange={e => setAccrualForm({...accrualForm, period: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tutar</label>
                <div className="flex gap-2">
                  <input type="number" className="w-full border p-2 rounded-xl" value={accrualForm.amount} onChange={e => setAccrualForm({...accrualForm, amount: e.target.value})} />
                  <select className="border p-2 rounded-xl" value={accrualForm.currency} onChange={e => setAccrualForm({...accrualForm, currency: e.target.value})}>
                    <option value="TRY">TRY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowAccrualModal(false)} className="px-4 py-2 bg-gray-100 rounded-xl">İptal</button>
              <button onClick={handleCreateAccrual} className="px-4 py-2 bg-emerald-600 text-white rounded-xl">Oluştur</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><DollarSign className="text-emerald-600" /> Ödeme Yap</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ödenecek Tutar</label>
                <input type="number" className="w-full border p-2 rounded-xl" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tarih</label>
                <input type="date" className="w-full border p-2 rounded-xl" value={paymentForm.transaction_date} onChange={e => setPaymentForm({...paymentForm, transaction_date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kasa / Hesap Seçimi</label>
                <select className="w-full border p-2 rounded-xl" value={paymentForm.wallet_id} onChange={e => setPaymentForm({...paymentForm, wallet_id: e.target.value})}>
                  <option value="">Seçiniz...</option>
                  {wallets.map(w => <option key={w.id} value={w.id}>{w.name} ({Number(w.balance).toLocaleString()} {w.currency})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Açıklama</label>
                <input type="text" className="w-full border p-2 rounded-xl" placeholder="Burs ödemesi..." value={paymentForm.notes} onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowPaymentModal(false)} className="px-4 py-2 bg-gray-100 rounded-xl">İptal</button>
              <button onClick={handleMakePayment} className="px-4 py-2 bg-emerald-600 text-white rounded-xl">Ödemeyi Kaydet</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
