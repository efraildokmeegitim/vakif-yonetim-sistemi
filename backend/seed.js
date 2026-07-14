const API_URL = 'http://localhost:3000/api';

async function seed() {
  console.log('🌱 Veritabanı örnek verilerle dolduruluyor...');

  // 0. Auth - Login or Register to get Token
  let token = '';
  try {
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'seed@vakif.com', password: 'password', firstName: 'Seed', lastName: 'Bot' })
    });
    
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'seed@vakif.com', password: 'password' })
    });
    const loginData = await loginRes.json();
    token = loginData.access_token;
  } catch (err) {
    console.error('Auth Hatası', err);
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 1. Cari Hesaplar
  const cariler = [
    { name: 'Ahmet Yılmaz (Bağışçı)' },
    { name: 'Mehmet Demir (Mütevelli)' },
    { name: 'Ayşe Kaya (Bağışçı)' },
    { name: 'Vakıf Merkezi (Şube)' },
    { name: 'Zeynep Çelik (Mütevelli)' },
    { name: 'Ali Veli (Personel)' },
  ];

  const cariIds = {};
  for (const c of cariler) {
    const res = await fetch(`${API_URL}/current-accounts`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(c)
    });
    if (!res.ok) {
      console.error('Hata:', await res.text());
      continue;
    }
    const data = await res.json();
    cariIds[c.name] = data.id;
  }
  console.log('✅ Cari hesaplar oluşturuldu.');

  // 2. Kasalar
  const kasalar = [
    { name: 'Merkez Kasa', groupType: 'Fiziksel', fundType: 'Genel Fon' },
    { name: 'Zekat Kasası', groupType: 'Fiziksel', fundType: 'Zekat Fonu' },
    { name: 'Afrika Su Kuyusu Projesi', groupType: 'Fiziksel', fundType: 'Proje Fonu' },
    { name: 'Mehmet Demir Emanet Kasası', groupType: 'Emanet', fundType: 'Emanet Fonu', linkedCurrentAccountId: cariIds['Mehmet Demir (Mütevelli)'] },
    { name: 'Burs Fonu (Banka)', groupType: 'Fiziksel', fundType: 'Burs Fonu' },
  ];

  const kasaIds = {};
  for (const k of kasalar) {
    const res = await fetch(`${API_URL}/wallets`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(k)
    });
    if (!res.ok) {
      console.error('Hata (Kasalar):', await res.text());
      continue;
    }
    const data = await res.json();
    kasaIds[k.name] = data.id;
  }
  console.log('✅ Kasalar oluşturuldu.');

  // 3. Gelir Gider İşlemleri (Cüzdanları doldurmak için)
  const txs = [
    { walletId: kasaIds['Merkez Kasa'], type: 'income', currency: 'TRY', amount: 500000, description: 'Devir Bakiyesi' },
    { walletId: kasaIds['Merkez Kasa'], type: 'income', currency: 'USD', amount: 25000, description: 'Yurtdışı Bağışları' },
    { walletId: kasaIds['Zekat Kasası'], type: 'income', currency: 'TRY', amount: 150000, description: 'Ramazan Zekatları', currentAccountId: cariIds['Ahmet Yılmaz (Bağışçı)'] },
    { walletId: kasaIds['Zekat Kasası'], type: 'income', currency: 'EUR', amount: 10000, description: 'Avrupa Zekat Bağışları' },
    { walletId: kasaIds['Afrika Su Kuyusu Projesi'], type: 'income', currency: 'USD', amount: 15000, description: 'Kuyu 1-2-3 Toplu Bağış' },
    { walletId: kasaIds['Mehmet Demir Emanet Kasası'], type: 'income', currency: 'TRY', amount: 45000, description: 'Sahadan toplanan nakit' },
    { walletId: kasaIds['Burs Fonu (Banka)'], type: 'income', currency: 'TRY', amount: 85000, description: 'Aylık Düzenli Bağışlar' },
  ];

  for (const tx of txs) {
    if (!tx.walletId) continue;
    const res = await fetch(`${API_URL}/wallets/transaction`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(tx)
    });
    if (!res.ok) console.error('Hata (İşlem):', await res.text());
  }
  console.log('✅ Temel bakiye girişleri yapıldı.');

  // 4. Döviz Bozdurma ve Virman İşlemleri
  // Senaryo 1: Zekat Kasası içindeki 5000 EUR'yu bozup TRY'ye geçirme
  const resTransfer1 = await fetch(`${API_URL}/wallets/transfer`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      fromWalletId: kasaIds['Zekat Kasası'],
      toWalletId: kasaIds['Zekat Kasası'],
      fromCurrency: 'EUR',
      toCurrency: 'TRY',
      amountSent: 5000,
      exchangeRate: 35.20,
      amountReceived: 175500, // Teorik 176.000, 500 TL kur zararı
      description: 'Zekat fonu döviz bozdurma'
    })
  });
  if (!resTransfer1.ok) console.error('Hata (Virman 1):', await resTransfer1.text());

  // Senaryo 2: Merkez Kasa USD'den -> Burs Fonu TRY'ye virman + bozdurma
  const resTransfer2 = await fetch(`${API_URL}/wallets/transfer`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      fromWalletId: kasaIds['Merkez Kasa'],
      toWalletId: kasaIds['Burs Fonu (Banka)'],
      fromCurrency: 'USD',
      toCurrency: 'TRY',
      amountSent: 2000,
      exchangeRate: 32.50,
      amountReceived: 65100, // Teorik 65.000, 100 TL kur karı (Örn: Banka promosyonu/iyi kur)
      description: 'Öğrenci bursları için bozdurma'
    })
  });
  if (!resTransfer2.ok) console.error('Hata (Virman 2):', await resTransfer2.text());

  // 5. Kurban Modülü Verileri
  const campaignRes = await fetch(`${API_URL}/sacrifices/campaigns`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: '2026 Afrika Vacip Kurban',
      year: 2026,
      defaultSharePrice: 3500,
      currency: 'TRY',
      isActive: true
    })
  });
  const campaign = await campaignRes.json();

  const groupRes = await fetch(`${API_URL}/sacrifices/groups`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'AFR-001 (Kenya)',
      animalType: 'Büyükbaş',
      campaignId: campaign.id
    })
  });
  const group = await groupRes.json();

  // Ahmet Yılmaz ve Ayşe Kaya için kurban hisseleri
  const shares = [
    { donorId: cariIds['Ahmet Yılmaz (Bağışçı)'], groupId: group.id, shareType: 'Vacip', isProxyGiven: true, amountPaid: 3500, currency: 'TRY' },
    { donorId: cariIds['Ayşe Kaya (Bağışçı)'], groupId: group.id, shareType: 'Vacip', isProxyGiven: false, amountPaid: 3500, currency: 'TRY' }
  ];

  for (const share of shares) {
    if (!share.donorId) continue;
    await fetch(`${API_URL}/sacrifices/shares`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(share)
    });
  }
  console.log('✅ Kurban modülü verileri (Kampanya, Grup, Hisseler) oluşturuldu.');

  console.log('✅ Döviz bozdurma ve kur farkı test senaryoları uygulandı.');
  console.log('🎉 Veritabanı başarıyla örneklendi! Sayfayı yenileyebilirsiniz.');
}

seed().catch(console.error);
