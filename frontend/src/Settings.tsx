import React, { useState, useEffect } from 'react';
import { api } from './api';

export default function Settings() {
  const [settings, setSettings] = useState<any>({
    vakif_adi: '',
    telefon: '',
    email: '',
    adres: '',
    para_birimi: 'TL',
    vergi_dairesi: '',
    vergi_no: '',
    izin_tarihi: '',
    izin_no: '',
    sms_provider: 'none',
    sms_username: '',
    sms_password: '',
    sms_sender_title: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      setSettings((prev: any) => ({ ...prev, ...res.data }));
    } catch (error) {
      console.error('Error fetching settings', error);
    }
  };

  const handleSave = async () => {
    try {
      await api.post('/settings', settings);
      alert('Ayarlar başarıyla kaydedildi.');
    } catch (error) {
      console.error('Error saving settings', error);
      alert('Kaydetme hatası.');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Sistem Ayarları</h1>
        <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Kaydet
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-lg font-bold mb-6 border-b pb-2">Genel Bilgiler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vakıf/Dernek Adı</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg p-2" value={settings.vakif_adi || ''} onChange={e => setSettings({...settings, vakif_adi: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Para Birimi</label>
            <select className="w-full border border-gray-300 rounded-lg p-2" value={settings.para_birimi || 'TL'} onChange={e => setSettings({...settings, para_birimi: e.target.value})}>
              <option value="TL">Türk Lirası (TL)</option>
              <option value="USD">Dolar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg p-2" value={settings.telefon || ''} onChange={e => setSettings({...settings, telefon: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-Posta</label>
            <input type="email" className="w-full border border-gray-300 rounded-lg p-2" value={settings.email || ''} onChange={e => setSettings({...settings, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Dairesi</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg p-2" value={settings.vergi_dairesi || ''} onChange={e => setSettings({...settings, vergi_dairesi: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Kimlik Numarası (VKN)</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg p-2" value={settings.vergi_no || ''} onChange={e => setSettings({...settings, vergi_no: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bağış Kabul İzin Tarihi</label>
            <input type="date" className="w-full border border-gray-300 rounded-lg p-2" value={settings.izin_tarihi || ''} onChange={e => setSettings({...settings, izin_tarihi: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bağış Kabul İzin Numarası</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg p-2" value={settings.izin_no || ''} onChange={e => setSettings({...settings, izin_no: e.target.value})} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
            <textarea className="w-full border border-gray-300 rounded-lg p-2 h-24" value={settings.adres || ''} onChange={e => setSettings({...settings, adres: e.target.value})}></textarea>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mt-6">
        <h2 className="text-lg font-bold mb-6 border-b pb-2">SMS Entegrasyonu</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SMS Servis Sağlayıcı</label>
            <select className="w-full border border-gray-300 rounded-lg p-2" value={settings.sms_provider || 'none'} onChange={e => setSettings({...settings, sms_provider: e.target.value})}>
              <option value="none">Seçiniz / Kullanılmıyor</option>
              <option value="netgsm">NetGSM</option>
              <option value="iletimerkezi">İleti Merkezi</option>
              <option value="mutlucell">Mutlucell</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gönderici Başlığı (Originator)</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg p-2" placeholder="Örn: VAKIF" value={settings.sms_sender_title || ''} onChange={e => setSettings({...settings, sms_sender_title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı / API Key</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg p-2" value={settings.sms_username || ''} onChange={e => setSettings({...settings, sms_username: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre / API Secret</label>
            <input type="password" className="w-full border border-gray-300 rounded-lg p-2" value={settings.sms_password || ''} onChange={e => setSettings({...settings, sms_password: e.target.value})} />
          </div>
        </div>
      </div>
    </div>
  );
}
