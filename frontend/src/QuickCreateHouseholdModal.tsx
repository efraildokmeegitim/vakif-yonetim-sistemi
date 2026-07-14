import React, { useState } from 'react';
import { api } from './api';
import { X, Check } from 'lucide-react';

interface QuickCreateHouseholdModalProps {
  isOpen: boolean;
  initialName: string;
  onClose: () => void;
  onCreated: (household: any) => void;
}

export default function QuickCreateHouseholdModal({ isOpen, initialName, onClose, onCreated }: QuickCreateHouseholdModalProps) {
  const [familyName, setFamilyName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setFamilyName(initialName);
      setContactNumber('');
    }
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim()) return alert('Aile Adı zorunludur.');
    
    setLoading(true);
    try {
      const res = await api.post('/households', {
        familyName,
        contactNumber,
        address: '',
        city: '',
        district: ''
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
          <h3 className="text-lg font-bold text-gray-900">Hızlı Aile Kaydı Tanımla</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Aile Adı / Sorumlusu</label>
            <input 
              type="text" 
              required
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-gray-800"
              placeholder="Örn: Yılmaz Ailesi..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">İletişim Numarası (Opsiyonel)</label>
            <input 
              type="text" 
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-gray-800"
              placeholder="05..."
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
              {loading ? 'Kaydediliyor...' : <><Check className="w-4 h-4" /> Aileyi Kaydet</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
