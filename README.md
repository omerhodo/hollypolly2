# HollyPolly - Gerçek Zamanlı Kura Çekme Uygulaması

🎲 Arkadaşlarınızla birlikte kura çekin! Gerçek zamanlı oda tabanlı kura çekme uygulaması.

## 🚀 Özellikler

- ✅ Gerçek zamanlı senkronizasyon (Firebase Firestore)
- ✅ Oda sistemi ve davet linkleri
- ✅ Kullanıcı yönetimi (Admin sistemi)
- ✅ Seçenek ekleme/silme
- ✅ Kazanan/Kaybeden seçimi
- ✅ Çok dilli destek (TR/EN)
- ✅ Responsive tasarım
- ✅ Animasyonlar (Framer Motion)

## 📦 Teknolojiler

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript 5**
- **Firebase Firestore** (Veritabanı)
- **Tailwind CSS 4** (Styling)
- **Framer Motion** (Animasyonlar)
- **next-intl** (i18n)

## 🛠️ Kurulum

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Firebase Projesi Oluştur

1. [Firebase Console](https://console.firebase.google.com/) giriş yapın
2. Yeni bir proje oluşturun
3. Firestore Database ekleyin
4. Web uygulaması ekleyin ve config bilgilerini alın

### 3. Environment Variables

`.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Firestore Security Rules

Firebase Console'da Firestore Security Rules'u güncelleyin:

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

### 5. Geliştirme Sunucusunu Başlat

```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## 📝 Kullanım

1. Ana sayfaya girin - otomatik olarak yeni bir oda oluşturulur
2. Adınızı girin (ilk kullanıcıysanız oda başlığını da belirleyin)
3. Paylaş butonuna basarak arkadaşlarınızı davet edin
4. Seçenekler ekleyin
5. Kazanan veya Kaybeden seç butonuna basın
6. Sonucu görün ve tekrar başlatın!

## 🏗️ Proje Yapısı

```
hollypolly/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── room/[roomId]/page.tsx
├── components/
│   ├── OptionList.tsx
│   ├── ResultModal.tsx
│   ├── RoomEntranceModal.tsx
│   ├── ShareButton.tsx
│   └── UserList.tsx
├── contexts/
│   ├── RoomContext.tsx
│   └── UserContext.tsx
├── lib/
│   └── firebase/client.ts
├── messages/
│   ├── en.json
│   └── tr.json
└── types/index.ts
```

## 🎨 Özelleştirme

### Renk Teması

[tailwind.config.ts](tailwind.config.ts) dosyasından renkleri özelleştirebilirsiniz:

```typescript
colors: {
  primary: {
    50: '#fff7ed',
    500: '#f97316',
    600: '#ea580c',
  },
}
```

### Dil Desteği

Yeni bir dil eklemek için:
1. `messages/` klasörüne yeni dil dosyası ekleyin (örn: `de.json`)
2. Çevirileri ekleyin
3. `i18n.ts` dosyasını güncelleyin

## 🚀 Deployment (Vercel)

### 1. GitHub'a Push

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

### 2. Vercel'e Deploy

1. [Vercel Dashboard](https://vercel.com/dashboard) giriş yapın
2. "Import Project" seçin
3. GitHub repository'nizi seçin
4. Environment variables ekleyin
5. Deploy edin!

## 📄 Lisans

MIT License

## 🤝 Katkıda Bulunma

Pull request'ler kabul edilir. Büyük değişiklikler için önce bir issue açın.

## 📧 İletişim

Sorularınız için issue açabilirsiniz.

---

**HollyPolly** ile keyifli kura çekmeleri! 🎲✨
