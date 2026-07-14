import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Smartphone, QrCode, Send, RefreshCw, LogOut, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function Communications() {
  const [activeTab, setActiveTab] = useState<'status' | 'send'>('status');
  
  // WhatsApp Status
  const [waStatus, setWaStatus] = useState<{connected: boolean, hasQr: boolean, initializing: boolean} | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sending Messages
  const [recipients, setRecipients] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);

  // Queue Status
  const [queueStatus, setQueueStatus] = useState<any[]>([]);
  const [queueTab, setQueueTab] = useState<'queued' | 'sent'>('queued');

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Check status every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (waStatus && !waStatus.connected && waStatus.hasQr && activeTab === 'status') {
      fetchQrCode();
    }
  }, [waStatus, activeTab]);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/whatsapp/status');
      setWaStatus(res.data);
    } catch (err) {
      console.error('WhatsApp status error', err);
    }
  };

  const fetchQrCode = async () => {
    try {
      const res = await api.get('/whatsapp/qr');
      setQrCode(res.data.qr);
    } catch (err) {
      console.error('WhatsApp QR error', err);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTab === 'send' && waStatus?.connected) {
      fetchQueue();
      interval = setInterval(fetchQueue, 3000);
    }
    return () => clearInterval(interval);
  }, [activeTab, waStatus?.connected]);

  const fetchQueue = async () => {
    try {
      const res = await api.get('/whatsapp/queue');
      setQueueStatus(res.data);
    } catch (err) {
      console.error('WhatsApp queue error', err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStatus();
    setIsRefreshing(false);
  };

  const handleLogout = async () => {
    if (!confirm('WhatsApp oturumunu kapatmak istediğinize emin misiniz?')) return;
    try {
      await api.post('/whatsapp/logout');
      setQrCode(null);
      await fetchStatus();
    } catch (err) {
      alert('Çıkış yapılamadı.');
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return alert('Lütfen bir mesaj yazın.');
    
    // Parse recipients (comma separated or newline separated)
    const phoneNumbers = recipients
      .split(/[\n,]+/)
      .map(p => p.trim())
      .filter(p => p.length > 9);

    if (phoneNumbers.length === 0) {
      return alert('Lütfen geçerli telefon numaraları girin.');
    }

    if (!confirm(`${phoneNumbers.length} kişiye mesaj gönderilecek. Emin misiniz?`)) return;

    setIsSending(true);
    setSendResult(null);
    try {
      const res = await api.post('/whatsapp/send-bulk', {
        recipients: phoneNumbers,
        message
      });
      setSendResult({ success: true, count: res.data.count });
      setRecipients('');
      setMessage('');
    } catch (err) {
      console.error(err);
      setSendResult({ success: false, error: 'Gönderim başlatılamadı. WhatsApp bağlantınızı kontrol edin.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Smartphone className="w-8 h-8 text-green-600" />
          WhatsApp Toplu İletişim
        </h1>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('status')}
          className={`pb-3 px-4 font-medium text-sm transition-colors relative ${activeTab === 'status' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Bağlantı Durumu
          {activeTab === 'status' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 rounded-t-md"></span>}
        </button>
        <button 
          onClick={() => setActiveTab('send')}
          className={`pb-3 px-4 font-medium text-sm transition-colors relative ${activeTab === 'send' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Toplu Mesaj Gönder
          {activeTab === 'send' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 rounded-t-md"></span>}
        </button>
      </div>

      {activeTab === 'status' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-full flex justify-end mb-4">
            <button onClick={handleRefresh} disabled={isRefreshing} className="text-gray-500 hover:text-gray-700 flex items-center gap-2 text-sm">
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} /> Yenile
            </button>
          </div>

          {!waStatus ? (
            <div className="flex flex-col items-center text-gray-500">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p>Durum kontrol ediliyor...</p>
            </div>
          ) : waStatus.initializing ? (
            <div className="flex flex-col items-center text-blue-500">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-medium text-lg text-gray-800 mb-2">WhatsApp Başlatılıyor</p>
              <p className="text-sm text-gray-500 text-center max-w-md">Arka planda WhatsApp istemcisi ayağa kaldırılıyor. Bu işlem birkaç dakika sürebilir...</p>
            </div>
          ) : waStatus.connected ? (
            <div className="flex flex-col items-center text-green-600 bg-green-50 p-10 rounded-2xl border border-green-100 w-full max-w-md">
              <CheckCircle2 className="w-16 h-16 mb-4" />
              <h2 className="text-2xl font-bold text-green-800 mb-2">WhatsApp Bağlı</h2>
              <p className="text-green-600 text-center mb-8">Sistem şu anda WhatsApp üzerinden mesaj göndermeye hazır.</p>
              
              <button onClick={handleLogout} className="flex items-center gap-2 bg-white text-red-600 px-6 py-2 rounded-lg border border-red-200 hover:bg-red-50 font-medium transition-colors">
                <LogOut size={18} /> Oturumu Kapat
              </button>
            </div>
          ) : waStatus.hasQr && qrCode ? (
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-bold text-gray-800 mb-2">QR Kodu Okutun</h2>
              <p className="text-gray-500 mb-6 text-center max-w-md">WhatsApp'ı açın, Ayarlar &gt; Bağlı Cihazlar menüsüne gidin ve sistemin bağlanması için aşağıdaki kodu okutun.</p>
              <div className="bg-white p-4 border-2 border-gray-200 rounded-xl shadow-sm mb-4">
                <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-orange-500">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-medium text-lg text-gray-800 mb-2">QR Kod Bekleniyor</p>
              <p className="text-sm text-gray-500 text-center">Lütfen bekleyin, WhatsApp bağlantısı hazırlanıyor...</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Mesaj Gönder</h2>
              
              {(!waStatus || !waStatus.connected) && (
                <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3 border border-red-100">
                  <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold">WhatsApp Bağlantısı Yok!</p>
                    <p className="text-sm mt-1">Mesaj gönderebilmek için önce "Bağlantı Durumu" sekmesinden cihazınızı bağlamalısınız.</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alıcılar (Telefon Numaraları)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Numaraları alt alta veya virgülle ayırarak yazın. (Örn: 5551234567 veya 905551234567)</p>
                  <textarea 
                    value={recipients}
                    onChange={e => setRecipients(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none font-mono text-sm"
                    placeholder="05551234567&#10;05321234567"
                    disabled={!waStatus?.connected}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mesaj İçeriği
                  </label>
                  <textarea 
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 h-40 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                    placeholder="Göndermek istediğiniz mesajı buraya yazın..."
                    disabled={!waStatus?.connected}
                  ></textarea>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleSend}
                    disabled={!waStatus?.connected || isSending}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold disabled:opacity-50 transition-colors"
                  >
                    {isSending ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Gönderim Başlatılıyor...</>
                    ) : (
                      <><Send className="w-5 h-5" /> Toplu Mesajı Gönder</>
                    )}
                  </button>
                </div>
                
                {sendResult && (
                  <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${sendResult.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {sendResult.success ? <CheckCircle2 className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
                    <div>
                      {sendResult.success ? (
                        <>
                          <p className="font-bold">Gönderim Kuyruğa Alındı!</p>
                          <p className="text-sm mt-1">Toplam {sendResult.count} kişi için arka planda mesaj gönderimi başlatıldı. WhatsApp numaranızın spam koruması gereği her mesaj arasında 3-6 saniye beklenecektir.</p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold">Hata Oluştu</p>
                          <p className="text-sm mt-1">{sendResult.error}</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Queue Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                Mesaj Durumu
              </h2>
              
              <div className="flex gap-4 mb-4 border-b border-gray-100">
                <button 
                  onClick={() => setQueueTab('queued')}
                  className={`pb-2 px-2 font-medium text-sm transition-colors relative ${queueTab === 'queued' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Kuyruğa Alınanlar ({queueStatus.filter(q => q.status === 'queued').length})
                  {queueTab === 'queued' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-md"></span>}
                </button>
                <button 
                  onClick={() => setQueueTab('sent')}
                  className={`pb-2 px-2 font-medium text-sm transition-colors relative ${queueTab === 'sent' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Gönderilenler / Hatalı ({queueStatus.filter(q => q.status !== 'queued').length})
                  {queueTab === 'sent' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 rounded-t-md"></span>}
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto pr-2">
                {queueTab === 'queued' && (
                  queueStatus.filter(q => q.status === 'queued').length === 0 ? (
                    <p className="text-sm text-gray-500 py-4 text-center">Kuyrukta bekleyen mesaj bulunmuyor.</p>
                  ) : (
                    <ul className="space-y-2">
                      {queueStatus.filter(q => q.status === 'queued').map(item => (
                        <li key={item.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-mono font-bold text-gray-800">{item.phone}</span>
                            <span className="flex items-center gap-1 text-blue-600 font-semibold">
                              <Loader2 className="w-3 h-3 animate-spin" /> Bekliyor
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-100 break-words mb-1">
                            {item.message}
                          </p>
                          <span className="text-[10px] text-gray-400">
                            {item.createdAt ? new Date(item.createdAt).toLocaleString('tr-TR') : 'Şimdi'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )
                )}

                {queueTab === 'sent' && (
                  queueStatus.filter(q => q.status !== 'queued').length === 0 ? (
                    <p className="text-sm text-gray-500 py-4 text-center">Gönderilmiş veya hatalı mesaj bulunmuyor.</p>
                  ) : (
                    <ul className="space-y-2">
                      {queueStatus.filter(q => q.status !== 'queued').map(item => (
                        <li key={item.id} className={`p-4 rounded-lg border text-sm ${item.status === 'sent' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-mono font-bold text-gray-800">{item.phone}</span>
                            <div className="flex flex-col items-end">
                              {item.status === 'sent' ? (
                                <span className="flex items-center gap-1 text-green-600 font-bold">
                                  <CheckCircle2 className="w-4 h-4" /> Gönderildi
                                </span>
                              ) : (
                                <>
                                  <span className="flex items-center gap-1 text-red-600 font-bold">
                                    <AlertCircle className="w-4 h-4" /> Hata
                                  </span>
                                  <span className="text-xs text-red-500 mt-1">{item.error}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-100 break-words mb-1">
                            {item.message}
                          </p>
                          <span className="text-[10px] text-gray-400">
                            {item.createdAt ? new Date(item.createdAt).toLocaleString('tr-TR') : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-gray-500" /> Bilgilendirme
              </h3>
              <ul className="text-sm text-gray-600 space-y-3 list-disc pl-4">
                <li>Toplu gönderim yaparken numaranızın bloke edilmemesi için mesajlar arasında otomatik olarak <strong>3 ila 6 saniye</strong> arası bekleme yapılmaktadır.</li>
                <li>Lütfen spam veya reklam mesajları göndermekten kaçının. Sadece vakfınızla etkileşimde olan kişilere bilgilendirme mesajları atın.</li>
                <li>WhatsApp Web altyapısı kullanıldığı için, gönderim sırasında bağlı olan telefonunuzun internet bağlantısının kesilmemesi gerekir.</li>
                <li>Alıcıların numarası rehberinizde olmasa da, gönderim denenecektir ancak Meta politikaları gereği güvensiz algılanabilir.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
