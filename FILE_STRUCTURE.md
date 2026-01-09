# 🎲 HollyPolly - Dosya Yapısı

```
hollypolly2/
│
├── 📁 app/                              # Next.js App Router
│   ├── room/
│   │   └── [roomId]/
│   │       └── page.tsx                 # Oda sayfası (ana uygulama)
│   ├── globals.css                      # Global CSS
│   ├── layout.tsx                       # Root layout (providers)
│   └── page.tsx                         # Ana sayfa (loading + redirect)
│
├── 📁 components/                       # React Componentleri
│   ├── OptionList.tsx                   # Seçenek listesi + Kazanan/Kaybeden butonları
│   ├── ResultModal.tsx                  # Sonuç modalı + Confetti
│   ├── RoomEntranceModal.tsx            # Kullanıcı giriş modalı
│   ├── ShareButton.tsx                  # Paylaşma butonu
│   └── UserList.tsx                     # Kullanıcı listesi + Admin yönetimi
│
├── 📁 contexts/                         # React Context
│   ├── RoomContext.tsx                  # Oda state + Firebase listeners
│   └── UserContext.tsx                  # Kullanıcı state + localStorage
│
├── 📁 functions/                        # Firebase Cloud Functions
│   ├── src/
│   │   └── index.ts                     # cleanupInactiveUsers + cleanupEmptyRooms
│   ├── package.json
│   └── tsconfig.json
│
├── 📁 lib/                              # Utility Library
│   └── firebase/
│       └── client.ts                    # Firebase SDK initialization
│
├── 📁 messages/                         # İnternasyonalizasyon
│   ├── en.json                          # İngilizce çeviriler
│   └── tr.json                          # Türkçe çeviriler
│
├── 📁 types/                            # TypeScript Type Definitions
│   └── index.ts                         # User, Room, Option, ResultData
│
├── 📄 .env.local.example                # Environment variables şablonu
├── 📄 .firebaserc                       # Firebase proje config
├── 📄 .gitignore                        # Git ignore dosyası
│
├── 📄 biome.json                        # Biome linter/formatter config
├── 📄 firebase.json                     # Firebase config (Functions)
├── 📄 firestore.rules                   # Firestore security rules
├── 📄 i18n.ts                           # next-intl configuration
├── 📄 LICENSE                           # MIT License
├── 📄 next.config.ts                    # Next.js configuration
├── 📄 package.json                      # NPM dependencies
├── 📄 postcss.config.js                 # PostCSS config (Tailwind)
├── 📄 README.md                         # Ana dokümantasyon
├── 📄 SETUP.md                          # Detaylı kurulum rehberi
├── 📄 tailwind.config.ts                # Tailwind CSS config
└── 📄 tsconfig.json                     # TypeScript config

```

## Önemli Dosyalar

### Core Application
- **app/room/[roomId]/page.tsx**: Ana uygulama mantığı, tüm özelliklerin birleştiği yer
- **contexts/RoomContext.tsx**: Firebase Firestore realtime listeners
- **contexts/UserContext.tsx**: Kullanıcı yönetimi ve localStorage sync

### Components
- **OptionList.tsx**: Seçenek CRUD + Kura çekme butonları
- **UserList.tsx**: Kullanıcı listesi + Admin yönetimi
- **ResultModal.tsx**: Fullscreen sonuç gösterimi

### Configuration
- **next.config.ts**: Next.js ayarları + next-intl plugin
- **tailwind.config.ts**: Renk paleti + tema
- **firebase.json**: Cloud Functions deployment config
- **firestore.rules**: Database security rules

### Firebase
- **lib/firebase/client.ts**: Firebase SDK initialization
- **functions/src/index.ts**: Otomatik temizlik fonksiyonları

### Documentation
- **README.md**: Hızlı başlangıç + Özellikler
- **SETUP.md**: Detaylı kurulum ve deployment

---

**Not**: Tüm dosyalar TypeScript ile yazılmıştır ve production-ready durumdadır! 🚀
