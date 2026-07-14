# Vakıf Yönetim Sistemi

Bu proje, bir Vakıf Yönetim Sisteminin hem backend (sunucu) hem de frontend (kullanıcı arayüzü) kısımlarını tek bir depo (monorepo) altında barındırmaktadır.

## Proje Yapısı

- **`backend/`**: NestJS kullanılarak geliştirilmiş sunucu uygulaması.
- **`frontend/`**: React ve Vite kullanılarak geliştirilmiş kullanıcı arayüzü.

## Özellikler

- **WhatsApp Entegrasyonu**: Sistemi kullanarak WhatsApp üzerinden mesaj gönderme, mesajların durumunu (kuyrukta, gönderildi, hata) takip edebilme.
- **Kullanıcı Todo Listesi**: Kullanıcıların kendilerine özel görev listeleri oluşturabilmesi ve tamamlandı olarak işaretleyebilmesi.
- **Modern Arayüz**: Kullanıcı dostu ve estetik web arayüzü.

## Başlarken

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyebilirsiniz.

### Ön Koşullar

- Node.js (v18 veya üstü önerilir)
- npm veya yarn

### Kurulum

1. Repoyu bilgisayarınıza klonlayın.
2. Hem backend hem de frontend bağımlılıklarını kurun:

   ```bash
   # Backend bağımlılıkları için
   cd backend
   npm install

   # Frontend bağımlılıkları için
   cd ../frontend
   npm install
   ```

### Çalıştırma

Projeyi çalıştırırken backend ve frontend'i ayrı terminallerde veya sekmelerde başlatmanız gerekmektedir.

**Backend:**
```bash
cd backend
npm run start:dev
```
Backend servisi varsayılan olarak `http://localhost:3000` adresinde çalışacaktır.

**Frontend:**
```bash
cd frontend
npm run dev
```
Frontend uygulaması varsayılan olarak `http://localhost:5173` adresinde çalışacaktır.

## Katkıda Bulunma

1. Bu repoyu fork'layın.
2. Yeni bir özellik dalı oluşturun (`git checkout -b feature/yeni-ozellik`).
3. Değişikliklerinizi commit'leyin (`git commit -m 'Yeni özellik eklendi'`).
4. Dalınıza push'layın (`git push origin feature/yeni-ozellik`).
5. Bir Pull Request açın.
