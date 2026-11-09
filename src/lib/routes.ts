export const LOCALES = ['de', 'en', 'fr', 'tr'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'de';
export const HREFLANG: Record<Locale, string> = { de: 'de-CH', en: 'en', fr: 'fr-CH', tr: 'tr' };
export const SERVICE_IDS = ['branding', 'website', 'social', 'ads', 'seo', '3d', 'automation'] as const;
export const CASE_IDS = ['arni', 'deru', 'erts'] as const;
export const ARTICLE_IDS = ['ai-visibility', 'white-label', 'website-cost'] as const;

type Slugs = Record<Locale, string>;
export type Route = { id: string; template: string; param?: string; parent?: string; noindex?: boolean; slugs: Slugs };

const S = { de: 'leistungen', en: 'services', fr: 'services', tr: 'hizmetler' };
const W = { de: 'arbeiten', en: 'work', fr: 'realisations', tr: 'calismalar' };
const B = { de: 'wissen', en: 'insights', fr: 'ressources', tr: 'blog' };
const T = { de: 'danke', en: 'thank-you', fr: 'merci', tr: 'tesekkurler' };
const under = (base: Slugs, tail: Slugs): Slugs =>
  Object.fromEntries(LOCALES.map((l) => [l, `${base[l]}/${tail[l]}`])) as Slugs;
const same = (v: string): Slugs => ({ de: v, en: v, fr: v, tr: v });

const serviceSlugs: Record<(typeof SERVICE_IDS)[number], Slugs> = {
  branding: { de: 'branding', en: 'branding', fr: 'identite-visuelle', tr: 'marka-kimligi' },
  website: { de: 'website', en: 'website', fr: 'site-web', tr: 'web-sitesi' },
  social: { de: 'social-media-content', en: 'social-media-content', fr: 'contenu-reseaux-sociaux', tr: 'sosyal-medya-icerik' },
  ads: { de: 'google-meta-ads', en: 'google-meta-ads', fr: 'publicite-google-meta', tr: 'google-meta-reklam' },
  seo: { de: 'seo-ki-sichtbarkeit', en: 'seo-ai-visibility', fr: 'seo-visibilite-ia', tr: 'seo-yapay-zeka-gorunurluk' },
  '3d': same('3d'),
  automation: { de: 'ki-automatisierung', en: 'ai-automation', fr: 'automatisation-ia', tr: 'yapay-zeka-otomasyon' },
};
const articleSlugs: Record<(typeof ARTICLE_IDS)[number], Slugs> = {
  'ai-visibility': { de: 'ki-sichtbarkeit-kmu', en: 'ai-visibility-smes', fr: 'visibilite-ia-pme', tr: 'kobi-yapay-zeka-gorunurlugu' },
  'white-label': { de: 'white-label-partner-agenturen', en: 'white-label-partner-agencies', fr: 'partenaire-marque-blanche-agences', tr: 'ajanslar-icin-white-label-partner' },
  'website-cost': { de: 'was-kostet-eine-website-schweiz', en: 'website-cost-switzerland', fr: 'prix-site-web-suisse', tr: 'isvicre-web-sitesi-maliyeti' },
};

export const ROUTES: Route[] = [
  { id: 'home', template: 'home', slugs: same('') },
  { id: 'agencies', template: 'agencies', slugs: { de: 'agenturen', en: 'agencies', fr: 'agences', tr: 'ajanslar' } },
  { id: 'services', template: 'services', slugs: S },
  ...SERVICE_IDS.map((id) => ({ id: `service-${id}`, template: 'service', param: id, parent: 'services', slugs: under(S, serviceSlugs[id]) })),
  { id: 'work', template: 'work', slugs: W },
  ...CASE_IDS.map((id) => ({ id: `case-${id}`, template: 'case', param: id, parent: 'work', slugs: under(W, same(id)) })),
  { id: 'pricing', template: 'pricing', slugs: { de: 'preise', en: 'pricing', fr: 'tarifs', tr: 'fiyatlar' } },
  { id: 'ki-check', template: 'kicheck', slugs: { de: 'ki-sichtbarkeits-check', en: 'ai-visibility-check', fr: 'check-visibilite-ia', tr: 'yapay-zeka-gorunurluk-kontrolu' } },
  { id: 'about', template: 'about', slugs: { de: 'ueber-uns', en: 'about', fr: 'a-propos', tr: 'hakkimizda' } },
  { id: 'blog', template: 'blog', slugs: B },
  ...ARTICLE_IDS.map((id) => ({ id: `article-${id}`, template: 'article', param: id, parent: 'blog', slugs: under(B, articleSlugs[id]) })),
  { id: 'contact', template: 'contact', slugs: { de: 'kontakt', en: 'contact', fr: 'contact', tr: 'iletisim' } },
  { id: 'impressum', template: 'legal', param: 'impressum', slugs: { de: 'impressum', en: 'legal-notice', fr: 'mentions-legales', tr: 'kunye' } },
  { id: 'privacy', template: 'legal', param: 'privacy', slugs: { de: 'datenschutz', en: 'privacy', fr: 'protection-des-donnees', tr: 'gizlilik' } },
  { id: 'terms', template: 'legal', param: 'terms', slugs: { de: 'agb', en: 'terms', fr: 'cgv', tr: 'kosullar' } },
  ...(['contact', 'agency', 'ki'] as const).map((p) => ({
    id: `thanks-${p}`, template: 'thanks', param: p, noindex: true,
    slugs: under(T, { de: { contact: 'kontakt', agency: 'agentur', ki: 'ki-check' }[p], en: { contact: 'contact', agency: 'agency', ki: 'ai-check' }[p], fr: { contact: 'contact', agency: 'agence', ki: 'check-ia' }[p], tr: { contact: 'iletisim', agency: 'ajans', ki: 'yapay-zeka-kontrolu' }[p] }),
  })),
];

const byId = new Map(ROUTES.map((r) => [r.id, r]));
export const route = (id: string): Route => {
  const r = byId.get(id);
  if (!r) throw new Error(`Unknown route: ${id}`);
  return r;
};
export const pathOf = (r: Route, l: Locale) => `/${l}/${r.slugs[l] ? r.slugs[l] + '/' : ''}`;
export const href = (l: Locale, id: string) => pathOf(route(id), l);
