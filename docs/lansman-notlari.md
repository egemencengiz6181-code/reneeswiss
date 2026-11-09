# Lansman notları

> Türkçe sürüm kaldırıldı; `/tr/` adresleri `/de/` sayfasına yönlenir.

## Bilgi mimarisi

| Sayfa | DE | EN | FR |
|---|---|---|---|
| Ana sayfa | /de/ | /en/ | /fr/ |
| Ajanslar | /de/agenturen/ | /en/agencies/ | /fr/agences/ |
| Hizmetler + 7 detay | /de/leistungen/… | /en/services/… | /fr/services/… |
| Çalışmalar + 3 vaka | /de/arbeiten/… | /en/work/… | /fr/realisations/… |
| Fiyatlar | /de/preise/ | /en/pricing/ | /fr/tarifs/ |
| KI-Check | /de/ki-sichtbarkeits-check/ | /en/ai-visibility-check/ | /fr/check-visibilite-ia/ |
| Hakkımızda | /de/ueber-uns/ | /en/about/ | /fr/a-propos/ |
| Blog + 3 yazı | /de/wissen/… | /en/insights/… | /fr/ressources/… |
| İletişim | /de/kontakt/ | /en/contact/ | /fr/contact/ |
| Yasal | impressum, datenschutz, agb | legal-notice, privacy, terms | mentions-legales, protection-des-donnees, cgv |
| Teşekkür (noindex) | /de/danke/… | /en/thank-you/… | /fr/merci/… |

## Plana göre yapılan iyileştirmeler

1. **Kontrast:** Renee Moru beyaz zeminde 4.12:1 ile küçük metinde AA'yı geçmiyor. Mor butonlarda metin siyah (5.10:1). Beyaz zeminde mor metin ve hover için `#5b3fd0` (6.85:1) eklendi.
2. **Türkiye veri aktarımı:** Türkiye, İsviçre'nin yeterli koruma sağlayan ülkeler listesinde değil. "AVV inklusive" tek başına yetmez. Metinlere standart sözleşme maddeleri (SCC) eklendi, AVV şablonunuz da bunu içermeli.
3. **Çerez bannersız kalmak için:** Cal.com sayfa açılışında yüklenmiyor, yalnızca tıklanınca iframe olarak açılıyor. Turnstile yalnızca forma dokunulunca yükleniyor.
4. **Ana sayfa başlığı kısaldı:** "schnell, zum fairen Preis" başlıktan çıktı, çünkü ton kuralı sıfatsız kanıt istiyor. Ankara ve remote bilgisi ilk ekrana taşındı.
5. **Yerel ajans fiyat karşılaştırması sitede yok:** "Yerel ajansların üçte ikisi" iddiası kaynaksız olduğu için İsviçre UWG açısından risk taşıyor.
6. **"MEZ" yerine "Schweizer Zeit":** MEZ yalnızca kış saatini ifade eder.
7. **"Antwort innert 4 Stunden"** her yerde çalışma saatleriyle sınırlandı.
8. **Ajans formuna ad ve e-posta eklendi:** Spesifikasyondaki alanlarla ajansa geri dönüş yapılamıyordu.
9. **Sahte metrik yok:** Vaka rakamları, müşteri yorumları ve ekip fotoğrafları boşsa görünmez; "XX%" gibi yer tutucu yayınlanmaz.
10. **Blog yazıları** gerçek taslak olarak yazıldı. Fiyat yazısında doğrulanamayan piyasa rakamı yok.

## Sizin kararınızı veya verinizi bekleyenler

Yayın öncesi `npm run launch-check` bunların çoğunu yakalar.

- [ ] Alan adı (`site.json` → `domain`)
- [ ] Cal.com linki (`calLink`). Boşken CTA'lar iletişim formuna gider.
- [x] Impressum: ad, hukuki biçim, açık adres, sicil müdürlüğü, sorumlu kişi. Vergi no ve kimlik no sitede yayınlanmaz.
- [ ] Form alıcısı (`FORWARD_URL`) ve Turnstile anahtarları
- [ ] Gizlilik metnindeki sağlayıcılar: `site.json` → `legal.formProcessor` ve `legal.mailProcessor`. Boş alanın satırı sayfada görünmez; form veya e-posta servisi devreye girmeden doldurun.
- [ ] E-posta: şu an info@reneedesignlab.com, yeni alan adı alınca değiştirin
- [ ] Almanca ve Fransızca anadil kontrolü: `docs/native-review.md`
- [ ] Datenschutzerklärung ve AGB için İsviçre hukukçusu kontrolü (AGB şu an yer tutucu)

## Doğrulamanız gereken iş varsayımları

- **Benim önerdiğim fiyatlar** (belgede yoktu): KOBİ paketleri Start CHF 3'500, Wachstum CHF 1'490/ay, Komplett CHF 2'290/ay; ajans paketleri 20 s CHF 1'500, 40 s CHF 2'800, 80 s CHF 5'200.
- **Benim önerdiğim teslim süreleri:** CI 3–5 hafta, web 10 iş gününden, sosyal ilk plan 10 iş günü, reklam 5–10 iş günü, SEO denetimi 10 iş günü, otomasyon 2–4 hafta. Sosyal medya paketindeki "ayda 8 içerik, 2'si kısa video" da öneridir.
- **Dil iddiası:** Site "Almanca ve Fransızca iletişim" diyor. Ekipte bu dilleri konuşan kimse yoksa metni düzeltin; İsviçreli müşteri ilk görüşmede anlar.
- **Saatler:** 08:00–18:00 İsviçre saati, Ankara'da kışın 10:00–20:00, yazın 09:00–19:00 demektir. Mevcut çalışma saatiniz 09:00–18:00.
- **KDV:** "zzgl. MwSt." planda istendiği gibi kullanıldı. İsviçre'de KDV kaydı olmayan yabancı firma İsviçre KDV'si kesmez; B2B'de müşteri çoğunlukla Bezugsteuer öder. Mali müşavirle netleştirip gerekirse `common.json` içindeki `price.vat` metnini değiştirin.
- **Referans izni:** Bayer ve diğer markaların adı sitede kullanılıyor. Yazılı kullanım izni olduğundan emin olun. Bayer işi Türkiye ofisi içinse Swiss alıcı bunu sorabilir.
- **Görseller ve logo** mevcut reneedesignlab.com'dan alındı; logolar webp, master prompt SVG bekliyor. SVG geldiğinde `public/brand/` içinde değiştirin.
- **Hizmet sayfalarındaki vakalar:** Elimizdeki üç vaka da kimlik projesi. Reklam, SEO, web ve otomasyon sayfalarında "Aus unserer Arbeit" başlığıyla gösteriliyorlar, o hizmete kanıt değiller. O alanlarda gerçek bir vakanız olunca `relatedCase` alanını güncelleyin.
- **Boş klasörler:** `src/assets/cases/` içindeki `arni 1 2 3 4 5 6`, `deru 1 2 3 4 5 7 8` ve `erts 2 3 5 6 7 8 9 10` klasörleri kurulum sırasında yanlışlıkla oluştu. Boşlar, elle silebilirsiniz.
