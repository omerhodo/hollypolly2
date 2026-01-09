# 🚀 HollyPolly - Kurulum ve Deployment Rehberi

## 📋 İçindekiler
- [Geliştirme Ortamı Kurulumu](#geliştirme-ortamı-kurulumu)
- [Firebase Kurulumu](#firebase-kurulumu)
- [Cloud Functions Kurulumu](#cloud-functions-kurulumu)
- [Vercel Deployment](#vercel-deployment)
- [Test Senaryoları](#test-senaryoları)

---

## 🛠️ Geliştirme Ortamı Kurulumu

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Environment Variables Ayarla

`.env.local` dosyası oluşturun:

```bash
cp .env.local.example .env.local
```

Firebase bilgilerinizi doldurun:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Geliştirme Sunucusunu Başlat

```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

---

## 🔥 Firebase Kurulumu

### 1. Firebase CLI Kur

```bash
npm install -g firebase-tools
```

### 2. Firebase'e Giriş Yap

```bash
firebase login
```

### 3. Firebase Projesi Oluştur

1. [Firebase Console](https://console.firebase.google.com/) giriş yapın
2. "Add project" seçin
3. Proje adı girin (örn: hollypolly)
4. Google Analytics'i devre dışı bırakabilirsiniz
5. "Create project" tıklayın

### 4. Firestore Database Oluştur

1. Firebase Console'da projenize gidin
2. Sol menüden "Firestore Database" seçin
3. "Create database" tıklayın
4. Location seçin (örn: europe-west1)
5. **Test mode** seçin (daha sonra güvenlik kurallarını güncelleyeceğiz)
6. "Enable" tıklayın

### 5. Web App Ekle

1. Project Overview'da "Web" (</>) simgesine tıklayın
2. App nickname girin (örn: hollypolly-web)
3. "Register app" tıklayın
4. Verilen config bilgilerini kopyalayın
5. `.env.local` dosyasına yapıştırın

### 6. Security Rules Güncelle

Firebase Console'da Firestore > Rules sekmesine gidin ve şu kuralları ekleyin:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      allow read, write: if true;

      match /users/{userId} {
        allow read, write: if true;
      }

      match /options/{optionId} {
        allow read, write: if true;
      }
    }
  }
}
```

"Publish" tıklayın.

### 7. Firebase Projesini Başlat

```bash
firebase init
```

Aşağıdaki seçenekleri seçin:
- ✅ Firestore
- ✅ Functions
- Existing project seçin
- Firestore rules: `firestore.rules`
- Firestore indexes: (default)
- Functions dili: TypeScript
- ESLint: No (Biome kullanıyoruz)
- Install dependencies: Yes

---

## ⚡ Cloud Functions Kurulumu

### 1. Functions Klasörüne Geç

```bash
cd functions
npm install
```

### 2. Functions Build Et

```bash
npm run build
```

### 3. Functions Deploy Et

```bash
npm run deploy
```

veya root klasöründen:

```bash
firebase deploy --only functions
```

### 4. Functions Loglarını İzle

```bash
npm run logs
```

### Oluşturulan Functions:

1. **cleanupInactiveUsers**: Her 5 dakikada çalışır, 2 dakika inactive olan kullanıcıları siler
2. **cleanupEmptyRooms**: Her 10 dakikada çalışır, 5 dakika kullanıcısı olmayan odaları siler

---

## 🚀 Vercel Deployment

### Yöntem 1: GitHub Entegrasyonu (Önerilen)

#### 1. GitHub Repository Oluştur

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/hollypolly.git
git push -u origin main
```

#### 2. Vercel'e Deploy

1. [Vercel Dashboard](https://vercel.com/dashboard) giriş yapın
2. "Add New Project" tıklayın
3. GitHub repository'nizi import edin
4. Framework Preset: **Next.js** (otomatik algılanmalı)
5. Build Command: `npm run build` (default)
6. Output Directory: `.next` (default)
7. Environment Variables ekleyin:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

8. "Deploy" tıklayın

#### 3. Otomatik Deploy

Her push'da otomatik olarak deploy edilecektir:
- `main` branch → Production
- Diğer branchler → Preview

### Yöntem 2: Vercel CLI

#### 1. Vercel CLI Kur

```bash
npm install -g vercel
```

#### 2. Vercel'e Giriş Yap

```bash
vercel login
```

#### 3. Deploy Et

İlk deployment (production):
```bash
vercel --prod
```

Sonraki deploymentlar:
```bash
vercel
```

### Custom Domain Ekleme

1. Vercel Dashboard > Project Settings > Domains
2. Domain adı girin (örn: hollypolly.com)
3. DNS kayıtlarını güncelleyin
4. SSL otomatik aktif olacaktır

---

## 📊 Monitoring ve Analytics

### Vercel Analytics

1. Vercel Dashboard > Analytics sekmesine gidin
2. "Enable Analytics" tıklayın
3. Kullanıcı trafiğini izleyin

### Firebase Analytics (Opsiyonel)

```typescript
// lib/firebase/client.ts
import { getAnalytics } from 'firebase/analytics';

export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
```

---

## 🧪 Test Senaryoları

### 1. Yerel Test

```bash
npm run dev
```

#### Test Adımları:
1. ✅ Ana sayfaya git → Otomatik yönlendirme
2. ✅ Kullanıcı adı gir → Odaya katıl
3. ✅ Seçenek ekle → Listede görünsün
4. ✅ Kazanan seç → Modal açılsın
5. ✅ Tekrar başlat → Modal kapansın

### 2. Çoklu Kullanıcı Testi

1. Normal tarayıcıda oda oluştur
2. Incognito/Private modda aynı oda linkini aç
3. İki kullanıcı arasında realtime sync test et

### 3. Admin Testi

1. İlk kullanıcı admin olmalı
2. Admin başka kullanıcıyı admin yapabilmeli
3. Eski admin'in yetkisi kalmalı

### 4. Heartbeat Testi

1. Kullanıcı oluştur
2. Developer Tools > Network kapat (offline)
3. 2 dakika bekle
4. Network aç
5. Kullanıcı listeden silinmeli

### 5. Production Testi

Vercel URL'inde yukarıdaki testleri tekrarla:
- https://your-app.vercel.app

---

## 🐛 Sorun Giderme

### Firebase Bağlantı Hatası

```bash
Error: Firebase: Error (auth/invalid-api-key)
```

**Çözüm**: `.env.local` dosyasındaki Firebase config bilgilerini kontrol edin.

### Firestore Permission Denied

```bash
Error: Missing or insufficient permissions
```

**Çözüm**: Firestore Security Rules'ı kontrol edin.

### Vercel Build Hatası

```bash
Error: Command "npm run build" exited with 1
```

**Çözüm**:
1. Environment variables'ları kontrol edin
2. Yerel build test edin: `npm run build`
3. Logs'ları inceleyin

### Cloud Functions Deploy Hatası

```bash
Error: HTTP Error: 403
```

**Çözüm**:
1. Firebase Billing aktif olmalı (Blaze plan)
2. `firebase login` yeniden çalıştırın
3. Yetkileri kontrol edin

---

## 📚 Ek Kaynaklar

- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)

---

## 🎉 Başarıyla Deploy!

Tebrikler! HollyPolly artık production'da çalışıyor.

**Sonraki Adımlar:**
- [ ] Custom domain ekle
- [ ] Analytics'i aktifleştir
- [ ] SEO optimizasyonu yap
- [ ] Social media share özellikleri ekle
- [ ] PWA support ekle

---

**Sorularınız için GitHub Issues kullanın!** 🚀
