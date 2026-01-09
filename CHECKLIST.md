# ✅ HollyPolly - Kurulum Checklist

Bu checklist'i kullanarak projenizi adım adım kurabilirsiniz.

## 📋 Ön Hazırlık

- [ ] Node.js 18+ yüklü
- [ ] npm veya yarn yüklü
- [ ] Git yüklü
- [ ] Firebase hesabı oluşturuldu
- [ ] Vercel hesabı oluşturuldu (deployment için)

---

## 🔧 Yerel Geliştirme Kurulumu

### 1. Bağımlılıkları Yükle
```bash
npm install
```
- [ ] Bağımlılıklar başarıyla yüklendi
- [ ] `node_modules/` klasörü oluştu

### 2. Environment Variables
```bash
cp .env.local.example .env.local
```
- [ ] `.env.local` dosyası oluşturuldu
- [ ] Firebase bilgileri `.env.local` dosyasına eklendi

### 3. Geliştirme Sunucusu
```bash
npm run dev
```
- [ ] Sunucu `localhost:3000` adresinde çalışıyor
- [ ] Tarayıcıda sayfa açılıyor
- [ ] Console'da hata yok

---

## 🔥 Firebase Kurulumu

### 1. Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```
- [ ] Firebase CLI yüklendi
- [ ] Firebase hesabına giriş yapıldı

### 2. Firebase Projesi
Firebase Console'da:
- [ ] Yeni proje oluşturuldu
- [ ] Proje adı belirlendi
- [ ] Location seçildi

### 3. Firestore Database
- [ ] Firestore Database aktifleştirildi
- [ ] Test mode seçildi
- [ ] Database oluşturuldu

### 4. Web App
- [ ] Web app eklendi
- [ ] App nickname girildi
- [ ] Config bilgileri kopyalandı
- [ ] Config bilgileri `.env.local`'e eklendi

### 5. Security Rules
- [ ] Firestore rules güncellendi
- [ ] `firestore.rules` dosyası deploy edildi
- [ ] Rules test edildi

### 6. Firebase Init
```bash
firebase init
```
Seçimler:
- [ ] ✅ Firestore
- [ ] ✅ Functions
- [ ] TypeScript seçildi
- [ ] Dependencies yüklendi

---

## ⚡ Cloud Functions

### 1. Functions Kurulumu
```bash
cd functions
npm install
```
- [ ] Functions dependencies yüklendi

### 2. Functions Build
```bash
npm run build
```
- [ ] Build başarılı
- [ ] `lib/` klasörü oluştu

### 3. Functions Deploy
```bash
npm run deploy
```
veya:
```bash
firebase deploy --only functions
```
- [ ] `cleanupInactiveUsers` deploy edildi
- [ ] `cleanupEmptyRooms` deploy edildi
- [ ] Firebase Console'da functions görünüyor

### 4. Billing Kontrolü
- [ ] Firebase Blaze plan aktif (Cloud Functions için gerekli)
- [ ] Billing limitleri ayarlandı (opsiyonel)

---

## 🧪 Test

### Yerel Test
- [ ] Ana sayfa yükleniyor
- [ ] Otomatik oda oluşturuluyor
- [ ] Kullanıcı adı girme modalı açılıyor
- [ ] Kullanıcı odaya katılabiliyor
- [ ] Seçenek eklenebiliyor
- [ ] Seçenek silinebiliyor
- [ ] Kazanan seçilebiliyor
- [ ] Modal açılıyor
- [ ] Confetti animasyonu çalışıyor
- [ ] Tekrar başlat çalışıyor

### Çoklu Kullanıcı Testi
- [ ] İkinci tarayıcı/incognito açıldı
- [ ] Aynı oda linkiyle katıldı
- [ ] Kullanıcılar gerçek zamanlı senkronize oluyor
- [ ] Seçenekler gerçek zamanlı güncelleniyor

### Admin Testi
- [ ] İlk kullanıcı admin oluyor
- [ ] Admin başka kullanıcıyı admin yapabiliyor
- [ ] Eski admin yetkisini kaybediyor

### Heartbeat Testi
- [ ] Kullanıcı 2 dakika sonra listeden siliniyor

---

## 🚀 Vercel Deployment

### 1. GitHub Repository
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main
```
- [ ] Git repository oluşturuldu
- [ ] Kod GitHub'a push edildi

### 2. Vercel Bağlantısı
Vercel Dashboard'da:
- [ ] "Import Project" tıklandı
- [ ] GitHub repository seçildi
- [ ] Framework: Next.js seçili
- [ ] Build ayarları doğru

### 3. Environment Variables
Vercel'de şu değişkenler eklendi:
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`

### 4. Deploy
- [ ] İlk deploy başarılı
- [ ] Production URL açılıyor
- [ ] Uygulama çalışıyor

### 5. Post-Deployment
- [ ] Custom domain eklendi (opsiyonel)
- [ ] SSL sertifikası aktif
- [ ] Analytics aktifleştirildi (opsiyonel)

---

## 🔒 Güvenlik

- [ ] `.env.local` dosyası `.gitignore`'da
- [ ] Firebase API keyleri güvenli
- [ ] Firestore Security Rules production'a uygun
- [ ] CORS ayarları yapıldı (gerekirse)

---

## 📊 Monitoring

- [ ] Firebase Console'da Functions logları kontrol edildi
- [ ] Vercel Analytics aktif
- [ ] Error tracking kuruldu (opsiyonel - Sentry)

---

## 🎉 Final Checklist

### Production Ready
- [ ] Tüm özellikler çalışıyor
- [ ] Responsive tasarım test edildi
- [ ] Farklı tarayıcılarda test edildi
- [ ] Performance test edildi
- [ ] SEO optimizasyonu yapıldı (opsiyonel)
- [ ] PWA support eklendi (opsiyonel)

### Dokümantasyon
- [ ] README.md güncel
- [ ] SETUP.md güncel
- [ ] Environment variables dokümante edilmiş
- [ ] API endpoints dokümante edilmiş (varsa)

### Bakım
- [ ] Backup planı oluşturuldu
- [ ] Monitoring kuruldu
- [ ] Update stratejisi belirlendi

---

## 🚨 Sorun Giderme

### Sık Karşılaşılan Hatalar

#### Firebase Connection Error
```
Error: Firebase: Error (auth/invalid-api-key)
```
**Çözüm**: `.env.local` dosyasındaki Firebase config'i kontrol edin.

#### Firestore Permission Denied
```
Error: Missing or insufficient permissions
```
**Çözüm**: Firestore Security Rules'ı kontrol edin.
