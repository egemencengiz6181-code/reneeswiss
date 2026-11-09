# Renee Schweiz: web sitesi

İsviçre pazarı için çok dilli (de-CH, en, fr-CH, tr) statik site. Astro + Tailwind, Cloudflare Pages üzerinde.

## Kurulum

Node 22.23 veya üstü gerekir (`.nvmrc`: 24).

```bash
npm install
npm run dev            # http://localhost:4321/de/
npm run build          # dist/ üretir
npm run preview        # Cloudflare ortamında dener (form + dil yönlendirme dahil)
npm run verify         # build sonrası kalite kontrolü
npm run launch-check   # yayın öncesi: eksik ayarları da hata sayar
npm run review-list    # docs/native-review.md listesini üretir
```

`npm run dev` Cloudflare Functions'ı çalıştırmaz, yani formlar yalnızca `npm run preview` ve canlı ortamda çalışır.

## Neyi nereden değiştiririm

| Ne | Dosya |
|---|---|
| Fiyatlar, iletişim, Cal.com linki, sosyal linkler, referanslar, Impressum verileri, istatistikler | `src/config/site.json` |
| Sayfa metinleri | `src/content/{de,en,fr,tr}/*.json` |
| URL'ler | `src/lib/routes.ts` |
| Renk ve tipografi | `src/styles/global.css` (`@theme`) |
| Logo ve yıldız | `public/brand/` |
| Proje görselleri | `src/assets/cases/{proje}/` |

Metinlerdeki `{{price.website}}` gibi ifadeler `site.json`'dan gelir. Fiyatı tek yerde değiştirirsiniz, tüm sayfalar ve JSON-LD güncellenir. Metne elle CHF tutarı yazmayın, `npm run verify` hata verir.

Vaka sayfasına rakam veya müşteri yorumu eklemek için `src/content/{dil}/cases/{proje}.json` içindeki alanları doldurun:

```json
"metrics": [{ "value": "+38 %", "label": "Anfragen" }],
"testimonial": { "quote": "...", "author": "Ad, Görev" }
```

Boş bırakılan alanlar sitede görünmez. Müşteri logosu dosyaları gelene kadar referanslar metin olarak gösterilir.

## Yeni dil ekleme

1. `src/lib/routes.ts`: `LOCALES`, `HREFLANG` ve tüm slug haritalarına dili ekleyin.
2. `src/content/de` klasörünü kopyalayıp `src/content/{dil}` oluşturun, metinleri çevirin.
3. `common.json` içindeki `price` bloğunu dile göre ayarlayın; `src/lib/content.ts` içindeki `NUM_LOCALE` ve `functions/index.ts`, `functions/api/submit.ts` içindeki dil listelerine ekleyin.
4. `npm run build && npm run verify`.

## Cloudflare Pages'e yayın

1. Depoyu Cloudflare Pages'e bağlayın. Build komutu `npm run build`, çıktı klasörü `dist`, ortam değişkeni `NODE_VERSION=24`.
2. `src/config/site.json` içinde `domain` değerini gerçek alan adıyla değiştirin.
3. Settings → Variables and Secrets:

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `FORWARD_URL` | Evet | Form verisinin JSON olarak gideceği adres (Formspree form URL'si veya webhook) |
| `TURNSTILE_SECRET` | Önerilir | Turnstile gizli anahtarı. Site anahtarı `site.json` → `forms.turnstileSiteKey` |
| `BREVO_API_KEY` | Hayır | Bülten onayı veren kişileri listeye ekler |
| `BREVO_LIST_AGENCY`, `BREVO_LIST_SME`, `BREVO_LIST_KI` | Hayır | Hedef kitleye göre Brevo liste kimlikleri |

4. Search Console ve Bing Webmaster Tools'a `/sitemap.xml` gönderin.
5. Yayından önce `npm run launch-check` temiz geçmeli.

## Bileşen kitaplığı

`/styleguide/` (noindex).
