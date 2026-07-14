# Vakıf Yönetim Sistemi

Bu proje, vakıf, dernek ve STK'ların (Sivil Toplum Kuruluşu) operasyonlarını dijitalleştirmek, yönetmek ve otomatize etmek amacıyla geliştirilmiş, **genişletilebilir (plugin tabanlı)** ve kapsamlı bir **Yönetim Sistemi**'dir. 

Proje, hem backend (sunucu) hem de frontend (kullanıcı arayüzü) kodlarını tek bir depo (monorepo) altında barındırır.

## Sistem Mimarisi

Sistem, "Çekirdek (Core)" yetenekler ve isteğe bağlı eklenebilen "Modüller (Plugins)" olarak iki ana bölüme ayrılmıştır:

- **Çekirdek Sistem (`core`)**: Tüm vakıfların ihtiyaç duyacağı kullanıcı yönetimi, kimlik doğrulama, ayarlar ve WhatsApp entegrasyonu gibi temel altyapıyı sağlar.
- **Eklenti Sistemi (`plugins`)**: Vakıfların kendi özel çalışma alanlarına göre açıp kapatabilecekleri, birbirinden bağımsız çalışan modülleri (Kurban, Aşevi, Burs, Envanter vb.) içerir.

## 🌟 Temel Çekirdek Özellikler (Core)

- **👥 Kullanıcı ve Rol Yönetimi (Users & Auth):** JWT tabanlı güvenli giriş, detaylı rol ve yetkilendirme altyapısı.
- **💬 WhatsApp İletişim Merkezi:** Sisteme entegre WhatsApp servisi ile üyelere, bağışçılara ve personellere mesaj kuyruğu üzerinden otomatik/toplu bilgilendirme.
- **📊 Merkezi Dashboard:** Tüm modüllerden toplanan verilerin özetlendiği analiz paneli.
- **✅ Kişisel İş Takibi (Todos):** Kullanıcıların kendilerine özel görevler oluşturabilmesi.
- **🔔 Bildirim ve Raporlama:** Uygulama içi anlık bildirimler ve detaylı veri analitiği.

## 🧩 Eklentiler ve Modüller (Plugins)

Uygulamanın `plugins/` dizini altında yer alan ve sistemin kapasitesini devasa ölçekte genişleten modüller şunlardır:

### 💰 Finans ve Bağış Yönetimi
- **Cüzdanlar (Wallets):** Gelen bağış ve bütçelerin kasa/banka bazlı yönetimi.
- **Cari Hesaplar (Current Accounts):** Üyelerin ve kurumların finansal geçmişi.
- **Masraf Merkezleri (Cost Centers):** Gelir/Gider takibinin proje bazlı yapılması.
- **Kurban Takip (Sacrifices):** Vekaletle kurban kesimi süreçleri, hisse, kesim ve dağıtım takibi.
- **Sponsorluk (Sponsorships) & Burs (Scholarships):** Yetim/öğrenci sponsorlukları, düzenli burs ödemeleri ve takibi.
- **Aşevi (Soup Kitchen):** Yemek yardımları, günlük dağıtım ve faydalanıcı takibi.

### 📦 Lojistik ve Varlık Yönetimi
- **Stok ve Depo (Stock & Warehouses):** Ayni yardımların (erzak, giyim vb.) depoya girişi, stok takibi ve dağıtımı.
- **Demirbaş Yönetimi (Assets):** Vakfa ait taşınır/taşınmaz demirbaşların zimmet takibi.
- **Araç ve Lojman Takibi (Vehicles & Lodgings):** Kuruma ait araç filosu, görevlendirmeler ve lojmanların/tesislerin yönetimi.

### 👥 Sosyal ve Kurumsal Süreçler
- **Hane ve Sosyal İnceleme (Households):** Yardım talebinde bulunan ailelerin sosyo-ekonomik durum analizleri ve hane kayıtları.
- **İnsan Kaynakları (Personnel):** Vakıf çalışanları ve gönüllülerinin kayıtları, özlük dosyaları.
- **Proje ve Görev (Projects & Tasks):** Vakfın yürüttüğü özel projeler ve proje altındaki ekip görevlendirmeleri.
- **Etkinlik ve Konaklama (Events & Accommodations):** Vakıf organizasyonları, kamp faaliyetleri ve katılımcıların konaklama takibi.
- **Yayınlar (Publications):** Vakfın basılı ve dijital yayınlarının, dergi aboneliklerinin takibi.

## Başlarken

Projeyi kendi bilgisayarınızda kurmak ve geliştirmeye başlamak için aşağıdaki adımları izleyebilirsiniz.

### Ön Koşullar

- Node.js (v18 veya üstü)
- npm veya yarn
- Git

### Kurulum

1. Repoyu bilgisayarınıza klonlayın:
   ```bash
   git clone https://github.com/KULLANICI_ADI/vakif-yonetim-sistemi.git
   cd vakif-yonetim-sistemi
   ```

2. Bağımlılıkları kurun:
   ```bash
   # Backend
   cd backend && npm install

   # Frontend
   cd ../frontend && npm install
   ```

### Çalıştırma

**Backend:**
```bash
cd backend
npm run start:dev
# Servis: http://localhost:3000
```

**Frontend:**
```bash
cd frontend
npm run dev
# Servis: http://localhost:5173
```

## Katkıda Bulunma

Bu devasa yönetim sistemine katkı sağlamak için:
1. Repoyu fork'layın.
2. Yeni özellik branch'i açın (`git checkout -b feature/yenilik`).
3. Commit atın (`git commit -m 'feat: yeni modül eklendi'`).
4. Push'layın (`git push origin feature/yenilik`).
5. Pull Request açın.
