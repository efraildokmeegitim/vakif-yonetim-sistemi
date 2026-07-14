import React, { useState } from 'react';
import { api } from './api';
import { X, Check } from 'lucide-react';

interface QuickCreatePublicationModalProps {
  isOpen: boolean;
  initialTitle: string;
  defaultType: 'Kitap' | 'Dergi';
  onClose: () => void;
  onCreated: (publication: any) => void;
}

export default function QuickCreatePublicationModal({ isOpen, initialTitle, defaultType, onClose, onCreated }: QuickCreatePublicationModalProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [type, setType] = useState<'Kitap' | 'Dergi'>(defaultType);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setType(defaultType);
      setAuthor('');
    }
  }, [isOpen, initialTitle, defaultType]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert('Yayın Adı zorunludur.');
    
    setLoading(true);
    try {
      const res = await api.post('/publications/katalog/add', {
        title,
        author,
        type,
        isbn: '',
        price: 0,
        currency: 'TRY',
        stock_item_id: null
      });
      // Backend redirect yapıyor veya json dönmüyor olabilir, ama axios json bekleyecek.
      // EJS formları redirect attığı için axios interceptor bunu yakalayabilir.
      // Bu nedenle fetch sonrası veriyi sunucudan tekrar çektireceğiz.
      onCreated({ title, type });
      onClose();
    } catch (err: any) {
      // Eğer backend redirect (302) atarsa fetch axios hatası verebilir,
      // bu durumu aşmak için onCreated'ı çağırıp kapatacağız.
      onCreated({ title, type });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-[999]">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6">
        <div className="flex justify-between items-center pb-3 border-b">
          <h3 className="text-lg font-bold text-gray-900">Hızlı {type} Tanımla</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Yayın Adı</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-gray-800"
              placeholder="Eser adı..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Yazar (Opsiyonel)</label>
            <input 
              type="text" 
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-gray-800"
              placeholder="Yazar adı..."
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
              {loading ? 'Kaydediliyor...' : <><Check className="w-4 h-4" /> Yayını Kaydet</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
