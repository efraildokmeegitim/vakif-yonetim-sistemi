import React, { useState } from 'react';
import { api } from './api';
import { X, Check } from 'lucide-react';

interface QuickCreateCostCenterModalProps {
  isOpen: boolean;
  initialName: string;
  onClose: () => void;
  onCreated: (costCenter: any) => void;
}

export default function QuickCreateCostCenterModal({ isOpen, initialName, onClose, onCreated }: QuickCreateCostCenterModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setDescription('');
    }
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Merkez Adı alanı zorunludur.');
    
    setLoading(true);
    try {
      const res = await api.post('/cost-centers', {
        name,
        description
      });
      onCreated(res.data);
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Kayıt sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-[999]">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6">
        <div className="flex justify-between items-center pb-3 border-b">
          <h3 className="text-lg font-bold text-gray-900">Hızlı Masraf Merkezi Tanımla</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Merkez Adı</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-gray-800"
              placeholder="Masraf Merkezi Adı..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Açıklama (Opsiyonel)</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-gray-800"
              placeholder="Kısa açıklama..."
            />
          </div>

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
              {loading ? 'Kaydediliyor...' : <><Check className="w-4 h-4" /> Merkezi Kaydet</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
