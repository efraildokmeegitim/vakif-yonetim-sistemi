import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from './api';
import { ArrowLeft, User, DollarSign, Calendar, FileText, Plus, Trash2 } from 'lucide-react';

export default function PersonnelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [personnel, setPersonnel] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('payrolls');

  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);

  const [showModal, setShowModal] = useState('');
  const [formData, setFormData] = useState<any>({});

  const loadData = async () => {
    try {
      const [pRes, payRes, leaveRes, fileRes] = await Promise.all([
        api.get(`/personnel/${id}`),
        api.get(`/personnel/${id}/payrolls`),
        api.get(`/personnel/${id}/leaves`),
        api.get(`/personnel/${id}/files`)
      ]);
      setPersonnel(pRes.data);
      setPayrolls(payRes.data);
      setLeaves(leaveRes.data);
      setFiles(fileRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSavePayroll = async () => {
    await api.post(`/personnel/${id}/payrolls`, formData);
    setShowModal('');
    loadData();
  };

  const handleSaveLeave = async () => {
    await api.post(`/personnel/${id}/leaves`, formData);
    setShowModal('');
    loadData();
  };

  const handleSaveFile = async () => {
    await api.post(`/personnel/${id}/files`, formData);
    setShowModal('');
    loadData();
  };

  const handleDelete = async (type: string, itemId: number) => {
    if (!confirm('Emin misiniz?')) return;
    await api.delete(`/personnel/${id}/${type}/${itemId}`);
    loadData();
  };

  if (!personnel) return <div className="p-8">Yükleniyor...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <button onClick={() => navigate('/personnel')} className="flex items-center text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Geri Dön
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 flex items-start gap-6">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 flex-shrink-0">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{personnel.name}</h1>
          <p className="text-gray-500">{personnel.position || 'Pozisyon Belirtilmemiş'}</p>
          <div className="mt-4 flex gap-6 text-sm">
            <div>
              <span className="text-gray-500 block">Maaş</span>
              <span className="font-semibold text-gray-900">{personnel.monthlySalary} {personnel.salaryCurrency}</span>
            </div>
            <div>
              <span className="text-gray-500 block">İşe Başlama</span>
              <span className="font-semibold text-gray-900">{personnel.hireDate || '-'}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Sözleşme Bitiş</span>
              <span className="font-semibold text-gray-900">{personnel.contractEndDate || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex border-b mb-6">
        <button onClick={() => setActiveTab('payrolls')} className={`pb-4 px-4 font-medium flex items-center gap-2 ${activeTab === 'payrolls' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500'}`}><DollarSign className="w-4 h-4"/> Maaş Tahakkukları</button>
        <button onClick={() => setActiveTab('leaves')} className={`pb-4 px-4 font-medium flex items-center gap-2 ${activeTab === 'leaves' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500'}`}><Calendar className="w-4 h-4"/> İzinler</button>
        <button onClick={() => setActiveTab('files')} className={`pb-4 px-4 font-medium flex items-center gap-2 ${activeTab === 'files' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500'}`}><FileText className="w-4 h-4"/> Dosyalar</button>
      </div>

      {activeTab === 'payrolls' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Maaş Tahakkukları</h2>
            <button onClick={() => { setFormData({ period: '', salaryAmount: personnel.monthlySalary, currency: personnel.salaryCurrency, status: 'Ödenmedi' }); setShowModal('payroll'); }} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm flex items-center gap-2"><Plus className="w-4 h-4"/> Yeni Tahakkuk</button>
          </div>
          <table className="w-full text-left">
            <thead><tr className="border-b text-sm text-gray-500">
              <th className="py-3">Dönem</th><th className="py-3">Tutar</th><th className="py-3">Durum</th><th className="py-3">Ödenen</th><th className="py-3 text-right">İşlem</th>
            </tr></thead>
            <tbody>
              {payrolls.map(p => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3">{p.period}</td>
                  <td className="py-3">{p.salaryAmount} {p.currency}</td>
                  <td className="py-3">{p.status}</td>
                  <td className="py-3">{p.totalPaid}</td>
                  <td className="py-3 text-right">
                    <button onClick={() => handleDelete('payrolls', p.id)} className="text-red-500"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'leaves' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">İzinler</h2>
            <button onClick={() => { setFormData({ leaveType: 'Yıllık İzin', startDate: '', endDate: '', totalDays: 0, description: '' }); setShowModal('leave'); }} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm flex items-center gap-2"><Plus className="w-4 h-4"/> Yeni İzin</button>
          </div>
          <table className="w-full text-left">
            <thead><tr className="border-b text-sm text-gray-500">
              <th className="py-3">İzin Türü</th><th className="py-3">Başlangıç</th><th className="py-3">Bitiş</th><th className="py-3">Gün</th><th className="py-3 text-right">İşlem</th>
            </tr></thead>
            <tbody>
              {leaves.map(l => (
                <tr key={l.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3">{l.leaveType}</td>
                  <td className="py-3">{l.startDate}</td>
                  <td className="py-3">{l.endDate}</td>
                  <td className="py-3">{l.totalDays}</td>
                  <td className="py-3 text-right">
                    <button onClick={() => handleDelete('leaves', l.id)} className="text-red-500"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'files' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Özlük Dosyaları</h2>
            <button onClick={() => { setFormData({ filePath: 'dummy/path', originalName: '', fileCategory: 'Sözleşme', uploadDate: new Date().toISOString().split('T')[0] }); setShowModal('file'); }} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm flex items-center gap-2"><Plus className="w-4 h-4"/> Dosya Ekle</button>
          </div>
          <table className="w-full text-left">
            <thead><tr className="border-b text-sm text-gray-500">
              <th className="py-3">Dosya Adı</th><th className="py-3">Kategori</th><th className="py-3">Tarih</th><th className="py-3 text-right">İşlem</th>
            </tr></thead>
            <tbody>
              {files.map(f => (
                <tr key={f.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3">{f.originalName}</td>
                  <td className="py-3">{f.fileCategory}</td>
                  <td className="py-3">{f.uploadDate}</td>
                  <td className="py-3 text-right">
                    <button onClick={() => handleDelete('files', f.id)} className="text-red-500"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showModal === 'payroll' && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                Yeni Tahakkuk
              </h2>
              <button onClick={() => setShowModal('')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Dönem (Örn: 2026-09)</label>
                <input type="text" placeholder="YYYY-MM" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium font-mono" value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Tutar</label>
                <input type="number" placeholder="0.00" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-bold text-gray-800" value={formData.salaryAmount} onChange={e => setFormData({...formData, salaryAmount: e.target.value})} />
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button onClick={() => setShowModal('')} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button onClick={handleSavePayroll} className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/10 text-sm">Kaydet</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal === 'leave' && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-600" />
                Yeni İzin Girişi
              </h2>
              <button onClick={() => setShowModal('')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">İzin Türü</label>
                <select className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium text-gray-700" value={formData.leaveType} onChange={e => setFormData({...formData, leaveType: e.target.value})}>
                  <option value="Yıllık İzin">Yıllık İzin</option>
                  <option value="Raporlu (Mazeretli)">Raporlu (Mazeretli)</option>
                  <option value="Ücretsiz İzin">Ücretsiz İzin</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Başlangıç</label>
                  <input type="date" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium text-gray-700" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Bitiş</label>
                  <input type="date" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium text-gray-700" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Toplam İzin Günü</label>
                <input type="number" placeholder="Gün sayısı" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-bold text-gray-800" value={formData.totalDays} onChange={e => setFormData({...formData, totalDays: e.target.value})} />
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button onClick={() => setShowModal('')} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button onClick={handleSaveLeave} className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/10 text-sm">Kaydet</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal === 'file' && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                Dosya Yükle (Simüle)
              </h2>
              <button onClick={() => setShowModal('')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Dosya Adı</label>
                <input type="text" placeholder="Örn: Kimlik Fotokopisi" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium" value={formData.originalName} onChange={e => setFormData({...formData, originalName: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Dosya Kategorisi</label>
                <input type="text" placeholder="Örn: Sözleşme, Kimlik vb." className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium" value={formData.fileCategory} onChange={e => setFormData({...formData, fileCategory: e.target.value})} />
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button onClick={() => setShowModal('')} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button onClick={handleSaveFile} className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/10 text-sm">Kaydet</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
