import React, { useState } from 'react';
import { api } from './api';
import { X, Check } from 'lucide-react';

interface QuickCreateProjectModalProps {
  isOpen: boolean;
  initialName: string;
  onClose: () => void;
  onCreated: (project: any) => void;
}

export default function QuickCreateProjectModal({ isOpen, initialName, onClose, onCreated }: QuickCreateProjectModalProps) {
  const [name, setName] = useState('');
  const [isCampaign, setIsCampaign] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setIsCampaign(false);
    }
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Proje Adı alanı zorunludur.');
    
    setLoading(true);
    try {
      const res = await api.post('/projects', {
        name,
        is_campaign: isCampaign
      });
      onCreated(res.data);
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Proje kayıt sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-[999]">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6">
        <div className="flex justify-between items-center pb-3 border-b">
          <h3 className="text-lg font-bold text-gray-900">Hızlı Proje Tanımla</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Proje Adı</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-gray-800"
              placeholder="Proje Adı..."
            />
          </div>

          <label className="flex items-center gap-3 p-3 bg-blue-50/30 border border-blue-100/60 rounded-xl cursor-pointer hover:bg-blue-50/60 transition-colors">
            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20" checked={isCampaign} onChange={e => setIsCampaign(e.target.checked)} />
            <div className="min-w-0">
              <p className="text-xs font-bold text-blue-900">Bu bir Bağış Kampanyasıdır</p>
              <p className="text-[10px] text-gray-500">Kasalarla ilişkilendirilebilir bağış takibi sağlar.</p>
            </div>
          </label>

          <div className="flex gap-3 pt-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 border rounded-xl font-bold hover:bg-gray-50 transition-colors text-sm"
            >
              İptal
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-sm text-sm flex justify-center items-center gap-1.5"
            >
              {loading ? 'Kaydediliyor...' : <><Check className="w-4 h-4" /> Projeyi Kaydet</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
