import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Settings2, Power, ShieldAlert, CheckCircle2, Box, Info } from 'lucide-react';

interface Plugin {
  id: number;
  identifier: string;
  name: string;
  description: string;
  isActive: boolean;
  version: string;
  isCore: boolean;
}

export default function Plugins() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlugins = async () => {
    try {
      const res = await api.get('/system-plugins');
      setPlugins(res.data);
    } catch (error) {
      console.error('Eklentiler yüklenemedi', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlugins();
  }, []);

  const toggleStatus = async (plugin: Plugin) => {
    if (plugin.isCore) {
      alert('Bu eklenti sistemin temel bir parçasıdır ve kapatılamaz!');
      return;
    }
    
    try {
      await api.patch(`/system-plugins/${plugin.id}/toggle`, { isActive: !plugin.isActive });
      await fetchPlugins();
      // Menünün güncellenmesi için sayfayı yenilemek en garantisi (veya bir App context kullanılabilir)
      if (confirm('Eklenti durumu güncellendi. Değişikliklerin sol menüye yansıması için sayfa yenilensin mi?')) {
        window.location.reload();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Durum güncellenirken bir hata oluştu.');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings2 className="w-8 h-8 text-emerald-600" />
            Eklenti (Plugin) Yöneticisi
          </h1>
          <p className="text-gray-500 mt-2">Sisteme entegre edilmiş modülleri buradan yönetebilir, açıp kapatabilirsiniz.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plugins.map(p => (
          <div key={p.id} className={`bg-white rounded-2xl border ${p.isActive ? 'border-emerald-200 shadow-emerald-50' : 'border-gray-200'} shadow-sm p-6 relative overflow-hidden transition-all hover:shadow-md`}>
            {/* Durum Göstergesi */}
            <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl text-xs font-medium flex items-center gap-1.5
              ${p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
              <Power className="w-3.5 h-3.5" />
              {p.isActive ? 'AKTİF' : 'PASİF'}
            </div>

            <div className="flex items-start gap-4 mt-2">
              <div className={`p-3 rounded-xl ${p.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                <Box className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{p.name}</h3>
                <p className="text-xs text-gray-400 font-mono mt-1">v{p.version} • {p.identifier}</p>
              </div>
            </div>

            <p className="text-gray-600 text-sm mt-4 min-h-[40px]">
              {p.description}
            </p>

            {p.isCore && (
              <div className="mt-4 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                <ShieldAlert className="w-4 h-4" />
                Sistem Çekirdek Modülü
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Durum:</span>
              <button
                onClick={() => toggleStatus(p)}
                disabled={p.isCore}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${p.isActive ? 'bg-emerald-500' : 'bg-gray-200'} ${p.isCore ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${p.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
