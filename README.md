# Vakıf Yönetim Sistemi

Bu proje, vakıf, dernek ve STK (Sivil Toplum Kuruluşu) gibi organizasyonların operasyonlarını dijitalleştirmek, yönetmek ve otomatize etmek amacıyla geliştirilmiş kapsamlı bir **Yönetim Sistemi**'dir. 

Proje, hem backend (sunucu) hem de frontend (kullanıcı arayüzü) kodlarını tek bir depo (monorepo) altında barındırır.

## Proje Yapısı

- **`backend/`**: NestJS altyapısı kullanılarak geliştirilmiş, modüler, güvenli ve ölçeklenebilir REST API sunucu uygulaması. Veritabanı işlemleri için TypeORM kullanılmaktadır.
- **`frontend/`**: React ve Vite kullanılarak geliştirilmiş, hızlı, modern ve kullanıcı dostu web arayüzü.

## Temel Özellikler

Sistem, bir vakfın günlük yönetim ihtiyaçlarını karşılayacak şekilde aşağıdaki temel modüllerle donatılmıştır:

- **👥 Kullanıcı ve Üye Yönetimi (Users)**
  Vakıf üyelerinin, yöneticilerin ve gönüllülerin detaylı kayıtlarının tutulması, rol ve yetki bazlı erişim kontrolü.

- **🔐 Güvenli Kimlik Doğrulama (Auth)**
  JWT (JSON Web Token) tabanlı güvenli kullanıcı girişi ve oturum yönetimi.

- **📊 Gelişmiş Dashboard**
  Sistem genelindeki istatistiklerin, üye durumlarının ve önemli metriklerin özetlendiği analiz paneli.

- **💬 WhatsApp Entegrasyonu (wwebjs)**
  Sisteme entegre WhatsApp servisi ile üyelere doğrudan veya toplu mesaj gönderimi. Arka planda çalışan kuyruk (queue) sistemi sayesinde mesajların durumlarını (kuyrukta, gönderildi, başarısız) takip edebilme ve raporlama.

- **✅ Görev ve İş Takibi (Todos)**
  Kullanıcıların kendi görevlerini oluşturabilmesi, durumlarını (yapılacak, tamamlandı) işaretleyebilmesi ve iş takibini kolaylaştıran "To-Do" modülü.

- **🔔 Bildirim Sistemi (Notifications)**
  Uygulama içi anlık bildirimler ve hatırlatıcı mekanizmaları.

- **📈 Raporlama (Reports)**
  Vakıf faaliyetlerine, üye analizlerine ve iletişim geçmişine dair detaylı rapor ve dökümler alınabilmesi.

- **📥 Veri Aktarımı (Import/Export)**
  Toplu verilerin (örn. üye listeleri) hızlıca sisteme aktarılması veya dışarıya (Excel/CSV olarak) aktarılabilmesi.

- **⚙️ Dinamik Sistem Ayarları (Settings)**
  Uygulamanın genel davranışının, bildirim kurallarının ve entegrasyon parametrelerinin arayüz üzerinden dinamik olarak yönetilebilmesi.

## Başlarken

Projeyi kendi bilgisayarınızda kurmak ve geliştirmeye başlamak için aşağıdaki adımları izleyebilirsiniz.

### Ön Koşullar

- Node.js (v18 veya üstü)
- npm veya yarn (paket yöneticisi)
- Git

### Kurulum

1. Repoyu bilgisayarınıza klonlayın:
   ```bash
   git clone https://github.com/KULLANICI_ADI/vakif-yonetim-sistemi.git
   cd vakif-yonetim-sistemi
   ```

2. Hem backend hem de frontend bağımlılıklarını kurun:

   ```bash
   # Backend bağımlılıkları için
   cd backend
   npm install

   # Frontend bağımlılıkları için
   cd ../frontend
   npm install
   ```

### Çalıştırma (Geliştirme Ortamı)

Uygulamanın çalışması için backend ve frontend servislerinin aynı anda ayrı terminallerde başlatılması gerekmektedir.

**1. Backend'i Başlatma:**
```bash
cd backend
npm run start:dev
```
*Backend servisi varsayılan olarak `http://localhost:3000` adresinde çalışacaktır.*

**2. Frontend'i Başlatma:**
```bash
cd frontend
npm run dev
```
*Frontend uygulaması varsayılan olarak `http://localhost:5173` adresinde çalışacaktır.*

## Katkıda Bulunma

Eğer bu projeye katkıda bulunmak isterseniz:
1. Bu repoyu fork'layın.
2. Yeni bir özellik dalı oluşturun (`git checkout -b feature/harika-ozellik`).
3. Değişikliklerinizi commit'leyin (`git commit -m 'feat: Harika özellik eklendi'`).
4. Dalınıza push'layın (`git push origin feature/harika-ozellik`).
5. Bir Pull Request açın.

---
*Bu sistem modern web standartlarına uygun olarak tasarlanmış olup, vakıf ve derneklerin ihtiyaçlarına göre kolaylıkla özelleştirilebilir bir yapıya sahiptir.*
