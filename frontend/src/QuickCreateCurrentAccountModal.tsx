import React, { useState, useEffect } from 'react';
import { api } from './api';
import { X, Check } from 'lucide-react';

interface QuickCreateCurrentAccountModalProps {
  isOpen: boolean;
  initialName: string;
  defaultTypeName?: string; // 'Bağışçı', 'Misafir', 'Personel', etc.
  onClose: () => void;
  onCreated: (account: any) => void;
}

export default function QuickCreateCurrentAccountModal({ isOpen, initialName, defaultTypeName = 'Bağışçı', onClose, onCreated }: QuickCreateCurrentAccountModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [accountCategory, setAccountCategory] = useState<'Bireysel' | 'Kurumsal'>('Bireysel');
  const [availableTypes, setAvailableTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setPhone('');
      setEmail('');
      setAccountCategory('Bireysel');
      
      // Fetch available types to match defaultTypeName
      api.get('/current-account-types')
        .then(res => setAvailableTypes(res.data))
        .catch(console.error);
    }
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('İsim alanı zorunludur.');
    
    setLoading(true);
    try {
      // Find matching type ID
      const matchingType = availableTypes.find(t => t.name.toLowerCase() === defaultTypeName.toLowerCase());
      const typeIds = matchingType ? [matchingType.id] : [];

      const res = await api.post('/current-accounts', {
        name,
        accountCategory,
        phone,
        email,
        typeIds
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
          <h3 className="text-lg font-bold text-gray-900">Hızlı Cari Hesap Oluştur</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cari Adı / Unvanı</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-gray-800"
              placeholder="Ad Soyad veya Kurum Unvanı..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cari Grubu</label>
              <select 
                value={accountCategory}
                onChange={(e) => setAccountCategory(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-gray-800"
              >
                <option value="Bireysel">Bireysel</option>
                <option value="Kurumsal">Kurumsal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Telefon</label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-gray-800"
                placeholder="05..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">E-Posta (Opsiyonel)</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-gray-800"
              placeholder="ornek@vakif.org"
            />
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 font-semibold">
            * Bu cari hesap otomatik olarak <strong>"{defaultTypeName}"</strong> grubuna kaydedilecektir.
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
              {loading ? 'Kaydediliyor...' : <><Check className="w-4 h-4" /> Cariyi Kaydet</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
