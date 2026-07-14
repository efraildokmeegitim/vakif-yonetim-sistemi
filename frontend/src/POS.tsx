import React, { useState, useEffect } from 'react';
import { api } from './api';
import { ShoppingBag, ArrowLeft, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import ItemPicker from './ItemPicker';

export default function POS() {
  const [books, setBooks] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [walletId, setWalletId] = useState('');
  
  useEffect(() => {
    api.get('/publications/catalog').then(res => setBooks(res.data.filter((b:any) => b.type === 'Kitap' && b.current_stock > 0))).catch(console.error);
    api.get('/wallets').then(res => setWallets(res.data)).catch(console.error);
  }, []);

  const addToCart = (book: any) => {
    const existing = cart.find(c => c.id === book.id);
    if (existing) {
      if (existing.quantity >= book.current_stock) return alert('Stok yetersiz');
      setCart(cart.map(c => c.id === book.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...book, quantity: 1 }]);
    }
  };

  const total = cart.reduce((acc, c) => acc + (c.price * c.quantity), 0);

  const handleSale = async () => {
    if (cart.length === 0) return alert('Sepet boş');
    if (!walletId) return alert('Kasa seçmelisiniz');

    try {
      await api.post('/publications/sales', {
        wallet_id: +walletId,
        transaction_date: new Date().toISOString().split('T')[0],
        items: cart.map(c => ({ id: c.id, quantity: c.quantity, price: c.price }))
      });
      alert('Satış başarılı!');
      setCart([]);
      api.get('/publications/catalog').then(res => setBooks(res.data.filter((b:any) => b.type === 'Kitap' && b.current_stock > 0)));
    } catch (e: any) { alert(e.response?.data?.message || 'Hata'); }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex h-[calc(100vh-64px)] flex-col">
      <Link to="/publications" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Yayınlara Dön
      </Link>
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3"><ShoppingBag className="w-8 h-8 text-green-600" /> POS Satış Ekranı</h1>

      <div className="flex gap-8 flex-1 min-h-0">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 overflow-y-auto">
          <h2 className="font-bold text-lg mb-4">Stoktaki Kitaplar</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {books.map(b => (
              <button key={b.id} onClick={() => addToCart(b)} className="text-left p-4 border rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors">
                <p className="font-bold text-gray-900 line-clamp-2 mb-2">{b.title}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 font-bold">{b.price} {b.currency}</span>
                  <span className="text-gray-500">Stok: {b.current_stock}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="w-96 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col">
          <div className="p-4 border-b font-bold text-lg bg-gray-50 rounded-t-2xl">Sepet</div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.map(c => (
              <div key={c.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
                <div><p className="font-bold text-sm">{c.title}</p><p className="text-xs text-gray-500">{c.quantity} Adet x {c.price} TL</p></div>
                <div className="flex items-center gap-3">
                  <p className="font-bold">{c.quantity * c.price} TL</p>
                  <button onClick={() => setCart(cart.filter(x => x.id !== c.id))} className="text-red-500"><X className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {cart.length === 0 && <p className="text-center text-gray-500 py-8 text-sm">Sepetiniz boş.</p>}
          </div>
          <div className="p-4 border-t bg-gray-50 rounded-b-2xl">
            <div className="flex justify-between font-bold text-xl mb-4"><span>Toplam:</span><span className="text-green-600">{total} TL</span></div>
            <div className="mb-4">
              <ItemPicker items={wallets.map((w:any) => ({...w, display: `${w.group_name} - ${w.currency}`}))} value={walletId} onChange={setWalletId} displayKey="display" placeholder="Tahsilat Kasası Seçin..." />
            </div>
            <button onClick={handleSale} disabled={cart.length === 0 || !walletId} className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 disabled:opacity-50 flex justify-center items-center gap-2">
              <Check className="w-6 h-6" /> Satışı Tamamla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
