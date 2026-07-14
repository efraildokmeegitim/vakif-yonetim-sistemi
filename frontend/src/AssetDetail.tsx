import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from './api';
import { ArrowLeft, Package, PenTool, ClipboardList, Trash2, Plus, Calendar } from 'lucide-react';

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('assignments');
  const [assignments, setAssignments] = useState<any[]>([]);
  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  const [assignForm, setAssignForm] = useState({ personnelCaId: 0, assignmentDate: '', notes: '', quantity: 1 });
  const [maintenanceForm, setMaintenanceForm] = useState({ type: 'Periyodik Bakım', description: '', maintenanceDate: '', cost: 0, vendor: '' });

  const loadData = async () => {
    try {
      const assetRes = await api.get(`/assets/${id}`);
      setAsset(assetRes.data);
      loadAssignments();
      loadMaintenances();
    } catch (e: any) {
      if (e.response?.status === 404) navigate('/assets');
    }
  };

  const loadAssignments = async () => {
    const res = await api.get(`/assets/${id}/assignments`);
    setAssignments(res.data);
  };

  const loadMaintenances = async () => {
    const res = await api.get(`/assets/${id}/maintenances`);
    setMaintenances(res.data);
  };

  useEffect(() => { loadData(); }, [id]);

  const handleAssign = async () => {
    try {
      await api.post(`/assets/${id}/assignments`, assignForm);
      setShowAssignModal(false);
      loadData();
    } catch (e: any) { alert(e.response?.data?.message || 'Hata oluştu'); }
  };

  const handleReturn = async (assignmentId: number) => {
    const date = prompt('İade tarihi (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    if (!date) return;
    try {
      await api.post(`/assets/assignments/${assignmentId}/return`, { returnDate: date });
      loadData();
    } catch (e: any) { alert(e.response?.data?.message || 'Hata oluştu'); }
  };

  const handleAddMaintenance = async () => {
    try {
      await api.post(`/assets/${id}/maintenances`, maintenanceForm);
      setShowMaintenanceModal(false);
      loadMaintenances();
    } catch (e) { alert('Hata oluştu'); }
  };

  const handleDeleteMaintenance = async (mId: number) => {
    if (!confirm('Bakım kaydını silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/assets/${id}/maintenances/${mId}`);
      loadMaintenances();
    } catch (e) { alert('Hata oluştu'); }
  };

  if (!asset) return <div className="p-8">Yükleniyor...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Link to="/assets" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Demirbaşlara Dön
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Package className="w-8 h-8 text-indigo-600" />
            {asset.name}
          </h1>
          <p className="text-gray-500">Barkod: {asset.barcode} &bull; Kod: {asset.assetCode}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 mb-1">Stok / Toplam</p>
          <p className="text-3xl font-bold text-gray-900">{asset.stockQuantity} / {asset.totalQuantity}</p>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
            asset.status === 'Stokta' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
          }`}>{asset.status}</span>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button onClick={() => setActiveTab('assignments')} className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 ${activeTab === 'assignments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}><ClipboardList className="w-4 h-4" /> Zimmet Geçmişi</button>
        <button onClick={() => setActiveTab('maintenances')} className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 ${activeTab === 'maintenances' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}><PenTool className="w-4 h-4" /> Bakım ve Onarım</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-[300px]">
        {activeTab === 'assignments' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Zimmet Geçmişi</h2>
              <button onClick={() => setShowAssignModal(true)} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg font-medium text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> Personele Zimmetle
              </button>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500">
                <tr><th className="p-3">Personel ID</th><th className="p-3">Zimmet Tarihi</th><th className="p-3">İade Tarihi</th><th className="p-3">Miktar</th><th className="p-3">Durum</th><th className="p-3 text-right">İşlem</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assignments.map(a => (
                  <tr key={a.id}>
                    <td className="p-3">ID: {a.personnelCaId}</td>
                    <td className="p-3">{a.assignmentDate}</td>
                    <td className="p-3">{a.returnDate || '-'}</td>
                    <td className="p-3">{a.quantity}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${a.status === 'İade Edildi' ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-800'}`}>{a.status}</span>
                    </td>
                    <td className="p-3 text-right">
                      {a.status === 'Zimmetli' && (
                        <button onClick={() => handleReturn(a.id)} className="text-indigo-600 font-medium hover:underline">İade Al</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'maintenances' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Bakım ve Onarım Kayıtları</h2>
              <button onClick={() => setShowMaintenanceModal(true)} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg font-medium text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> Bakım Ekle
              </button>
            </div>
            <div className="space-y-4">
              {maintenances.map(m => (
                <div key={m.id} className="p-4 border rounded-xl flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{m.type}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3"/> {m.maintenanceDate}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{m.description}</p>
                    <p className="text-sm font-medium">Firma: {m.vendor || '-'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600 text-lg">{m.cost ? `-${m.cost} TL` : 'Ücretsiz'}</p>
                    <button onClick={() => handleDeleteMaintenance(m.id)} className="text-red-500 mt-2 p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-indigo-600" />
                Personele Zimmetle
              </h2>
              <button onClick={() => setShowAssignModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Personel Cari Hesabı (ID)</label>
                <input type="number" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-50/10 focus:border-indigo-600 transition-all text-sm font-medium" value={assignForm.personnelCaId} onChange={e => setAssignForm({...assignForm, personnelCaId: Number(e.target.value)})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Zimmet Tarihi</label>
                  <input type="date" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-50/10 focus:border-indigo-600 transition-all text-sm font-medium text-gray-700" value={assignForm.assignmentDate} onChange={e => setAssignForm({...assignForm, assignmentDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Miktar</label>
                  <input type="number" min="1" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-50/10 focus:border-indigo-600 transition-all text-sm font-bold text-gray-800" value={assignForm.quantity} onChange={e => setAssignForm({...assignForm, quantity: Number(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Zimmet Notu</label>
                <textarea placeholder="Demirbaşın durumu vb. notlar..." className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-50/10 focus:border-indigo-600 transition-all text-sm font-medium h-20 resize-none" value={assignForm.notes} onChange={e => setAssignForm({...assignForm, notes: e.target.value})}></textarea>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button onClick={() => setShowAssignModal(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button onClick={handleAssign} className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/10 text-sm">
                  Zimmetle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-red-50 to-orange-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <PenTool className="h-5 w-5 text-red-600" />
                Bakım Kaydı Ekle
              </h2>
              <button onClick={() => setShowMaintenanceModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Bakım Türü</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-600 transition-all text-sm font-medium text-gray-700" value={maintenanceForm.type} onChange={e => setMaintenanceForm({...maintenanceForm, type: e.target.value})}>
                    <option>Periyodik Bakım</option>
                    <option>Arıza Onarımı</option>
                    <option>Kalibrasyon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Tarih</label>
                  <input type="date" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-600 transition-all text-sm font-medium text-gray-700" value={maintenanceForm.maintenanceDate} onChange={e => setMaintenanceForm({...maintenanceForm, maintenanceDate: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Maliyet (TL)</label>
                  <input type="number" placeholder="0.00" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-600 transition-all text-sm font-bold text-gray-800" value={maintenanceForm.cost} onChange={e => setMaintenanceForm({...maintenanceForm, cost: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Firma / Kişi</label>
                  <input type="text" placeholder="Firma Ünvanı" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-600 transition-all text-sm font-medium" value={maintenanceForm.vendor} onChange={e => setMaintenanceForm({...maintenanceForm, vendor: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Yapılan İşlem Açıklaması</label>
                <textarea placeholder="Değişen parçalar, detaylar..." className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-600 transition-all text-sm font-medium h-20 resize-none" value={maintenanceForm.description} onChange={e => setMaintenanceForm({...maintenanceForm, description: e.target.value})}></textarea>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button onClick={() => setShowMaintenanceModal(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button onClick={handleAddMaintenance} className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-md shadow-red-600/10 text-sm">
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
