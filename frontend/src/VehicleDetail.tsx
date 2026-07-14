import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Car, Trash2 } from 'lucide-react';
import api from './api';

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [maintForm, setMaintForm] = useState({ type: 'Bakım', date: '', next_due_date: '', cost: '', description: '' });

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/vehicles/${id}`);
      setVehicle(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const handleSaveMaint = async () => {
    await api.post(`/vehicles/${id}/maintenances`, maintForm);
    setShowMaintModal(false);
    setMaintForm({ type: 'Bakım', date: '', next_due_date: '', cost: '', description: '' });
    fetchDetail();
  };

  const handleDeleteMaint = async (maintId: number) => {
    if (!confirm('Emin misiniz?')) return;
    await api.post(`/vehicles/maintenances/${maintId}/delete`);
    fetchDetail();
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;
  if (!vehicle) return <div className="p-8 text-center text-gray-500">Araç bulunamadı.</div>;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/vehicles')} className="flex items-center text-gray-500 hover:text-gray-700 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Araçlara Dön
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <Car className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{vehicle.plate_number}</h1>
              <p className="text-gray-500">{vehicle.brand} {vehicle.model} ({vehicle.year})</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 font-medium">Zimmetli Kişi</p>
            <p className="text-sm font-medium text-gray-900">{vehicle.assigned_to || '-'}</p>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Bakım ve İşlem Geçmişi</h3>
            <button onClick={() => setShowMaintModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Yeni İşlem Ekle</button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3">İşlem Tipi</th>
                  <th className="px-4 py-3">Tutar</th>
                  <th className="px-4 py-3">Sonraki İşlem Tarihi</th>
                  <th className="px-4 py-3">Açıklama</th>
                  <th className="px-4 py-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vehicle.maintenances?.map((m: any) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{m.date}</td>
                    <td className="px-4 py-3 text-gray-900">{m.type}</td>
                    <td className="px-4 py-3 text-gray-900">{m.cost ? `${m.cost} TL` : '-'}</td>
                    <td className="px-4 py-3 text-gray-500">{m.next_due_date || '-'}</td>
                    <td className="px-4 py-3 text-gray-500">{m.description}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDeleteMaint(m.id)} className="text-red-500 hover:text-red-700 text-sm p-1"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
                {(!vehicle.maintenances || vehicle.maintenances.length === 0) && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Henüz bakım veya işlem kaydı yok.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showMaintModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="font-bold mb-4 text-lg">Yeni Bakım/İşlem Ekle</h2>
            <div className="space-y-3">
              <select className="w-full border border-gray-300 p-2 rounded-lg" value={maintForm.type} onChange={e => setMaintForm({...maintForm, type: e.target.value})}>
                <option value="Bakım">Periyodik Bakım</option>
                <option value="Muayene">Araç Muayenesi</option>
                <option value="Kasko">Kasko</option>
                <option value="Trafik Sigortası">Trafik Sigortası</option>
                <option value="Hasar/Onarım">Hasar/Onarım</option>
                <option value="Diğer">Diğer</option>
              </select>
              <div>
                <label className="block text-xs text-gray-500 mb-1">İşlem Tarihi</label>
                <input type="date" className="w-full border border-gray-300 p-2 rounded-lg" value={maintForm.date} onChange={e => setMaintForm({...maintForm, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Bir Sonraki İşlem Tarihi (Opsiyonel)</label>
                <input type="date" className="w-full border border-gray-300 p-2 rounded-lg" value={maintForm.next_due_date} onChange={e => setMaintForm({...maintForm, next_due_date: e.target.value})} />
              </div>
              <input type="number" placeholder="Tutar (Opsiyonel)" className="w-full border border-gray-300 p-2 rounded-lg" value={maintForm.cost} onChange={e => setMaintForm({...maintForm, cost: e.target.value})} />
              <textarea placeholder="Açıklama" className="w-full border border-gray-300 p-2 rounded-lg" value={maintForm.description} onChange={e => setMaintForm({...maintForm, description: e.target.value})}></textarea>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowMaintModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">İptal</button>
              <button onClick={handleSaveMaint} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
