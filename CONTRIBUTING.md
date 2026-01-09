# Katkıda Bulunma Rehberi

HollyPolly projesine katkıda bulunmak istediğiniz için teşekkürler! 🎉

## 🚀 Başlamadan Önce

1. Projeyi fork'layın
2. Yerel makinenize clone'layın
3. Bağımlılıkları yükleyin: `npm install`
4. Geliştirme sunucusunu başlatın: `npm run dev`

## 📝 Katkı Süreci

### 1. Issue Oluştur veya Var Olan Issue'yu Seç

- Yeni bir özellik eklemek istiyorsanız, önce bir issue açın
- Var olan bir bug'ı düzeltmek istiyorsanız, issue'yu kendinize atayın

### 2. Branch Oluştur

```bash
git checkout -b feature/your-feature-name
# veya
git checkout -b fix/bug-description
```

Branch isimlendirme:
- `feature/` - Yeni özellikler
- `fix/` - Bug düzeltmeleri
- `docs/` - Dokümantasyon güncellemeleri
- `refactor/` - Kod iyileştirmeleri
- `test/` - Test eklemeleri

### 3. Kod Yaz

#### Code Style

Biome kullanıyoruz:
```bash
npm run lint    # Lint kontrol
npm run format  # Format düzelt
```

#### Commit Mesajları

Conventional Commits formatı kullanın:

```
feat: yeni özellik açıklaması
fix: bug düzeltme açıklaması
docs: dokümantasyon güncellemesi
refactor: kod iyileştirmesi
test: test eklemesi
```

Örnekler:
```
feat: add dark mode support
fix: resolve modal closing issue
docs: update README with new examples
refactor: improve user context performance
test: add unit tests for OptionList component
```

### 4. Test Et

Değişikliklerinizi test edin:
- Yerel geliştirme sunucusunda test edin
- Farklı tarayıcılarda test edin
- Responsive tasarımı kontrol edin
- Console'da hata olmadığından emin olun

### 5. Pull Request Oluştur

1. Branch'inizi push edin:
```bash
git push origin feature/your-feature-name
```

2. GitHub'da Pull Request oluşturun
3. PR açıklamasında şunları ekleyin:
   - Ne değişti?
   - Neden değişti?
   - Ekran görüntüleri (UI değişikliği varsa)
   - Hangi issue'yu çözüyor? (Closes #123)

## 🎨 Tasarım Kuralları

### Renk Paleti
- Primary: `#f97316` (Turuncu)
- Background: `#f9fafb` (Açık Gri)
- Text: `#1f2937` (Koyu Gri)
- Success: Primary (Turuncu)
- Error: `#ef4444` (Kırmızı)

### Spacing
Tailwind spacing sistemini kullanın:
- `gap-2`, `gap-4`, `gap-6` vb.
- `p-2`, `p-4`, `p-6` vb.
- `m-2`, `m-4`, `m-6` vb.

### Typography
- Başlıklar: `text-xl`, `text-2xl`, `text-3xl`
- Body: `text-base`
- Small: `text-sm`, `text-xs`

## 📦 Yeni Bağımlılık Ekleme

Yeni bir npm paketi eklemeden önce:
1. Gerçekten gerekli mi?
2. Bundle size'ı ne kadar artırır?
3. Alternatifler var mı?

Bağımlılık eklerken:
```bash
npm install package-name
```

PR'da neden eklendiğini açıklayın.

## 🧪 Testing

Şu anda manuel test kullanıyoruz. Gelecekte eklenmesi planlanan:
- Jest ile unit testler
- React Testing Library ile component testleri
- Playwright ile E2E testler

## 🐛 Bug Raporlama

Bug bulduğunuzda issue açın ve şunları ekleyin:
- Bug açıklaması
- Nasıl oluştuğu (adımlar)
- Beklenen davranış
- Gerçekleşen davranış
- Ekran görüntüsü/video
- Tarayıcı ve işletim sistemi bilgisi

## 💡 Özellik Önerileri

Yeni özellik önerirken:
- Özellik detaylı açıklayın
- Kullanım senaryoları verin
- Mockup/wireframe ekleyin (varsa)
- Alternatif çözümler önerin

## 📄 Dokümantasyon

Kod yazarken:
- Karmaşık fonksiyonlara JSDoc ekleyin
- README'yi güncelleyin
- Type definitions'ı ekleyin

## ✅ Checklist (PR öncesi)

- [ ] Kod Biome standardına uygun
- [ ] Commit mesajları düzgün
- [ ] Yerel testler geçti
- [ ] Console'da hata yok
- [ ] Responsive tasarım kontrol edildi
- [ ] TypeScript hataları yok
- [ ] README güncellenmiş (gerekiyorsa)

## 🙏 Teşekkürler!

Katkılarınız HollyPolly'yi daha iyi hale getiriyor!

---

Sorularınız varsa GitHub Discussions'da sorun! 💬
