export const LOCALES = ['de', 'en', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'de';
export const HREFLANG: Record<Locale, string> = { de: 'de-CH', en: 'en-CH', fr: 'fr-CH' };
export const SERVICE_IDS = ['branding', 'website', 'social', 'ads', 'seo', '3d', 'automation'] as const;
export const CASE_IDS = ['arni', 'deru', 'erts'] as const;
export const ARTICLE_IDS = ['ai-visibility', 'white-label', 'website-cost', 'rebranding', 'multilingual', 'ai-automation'] as const;

type Slugs = Record<Locale, string>;
export type Route = { id: string; template: string; param?: string; parent?: string; noindex?: boolean; slugs: Slugs };

const S = { de: 'leistungen', en: 'services', fr: 'services' };
const W = { de: 'arbeiten', en: 'work', fr: 'realisations' };
const B = { de: 'wissen', en: 'insights', fr: 'ressources' };
const T = { de: 'danke', en: 'thank-you', fr: 'merci' };
const under = (base: Slugs, tail: Slugs): Slugs =>
  Object.fromEntries(LOCALES.map((l) => [l, `${base[l]}/${tail[l]}`])) as Slugs;
const same = (v: string): Slugs => ({ de: v, en: v, fr: v });

const serviceSlugs: Record<(typeof SERVICE_IDS)[number], Slugs> = {
  branding: { de: 'branding', en: 'branding', fr: 'identite-visuelle' },
  website: { de: 'website', en: 'website', fr: 'site-web' },
  social: { de: 'social-media-content', en: 'social-media-content', fr: 'contenu-reseaux-sociaux' },
  ads: { de: 'google-meta-ads', en: 'google-meta-ads', fr: 'publicite-google-meta' },
  seo: { de: 'seo-ki-sichtbarkeit', en: 'seo-ai-visibility', fr: 'seo-visibilite-ia' },
  '3d': same('3d'),
  automation: { de: 'ki-automatisierung', en: 'ai-automation', fr: 'automatisation-ia' },
};
const articleSlugs: Record<(typeof ARTICLE_IDS)[number], Slugs> = {
  'ai-visibility': { de: 'ki-sichtbarkeit-kmu', en: 'ai-visibility-smes', fr: 'visibilite-ia-pme' },
  'white-label': { de: 'white-label-partner-agenturen', en: 'white-label-partner-agencies', fr: 'partenaire-marque-blanche-agences' },
  'website-cost': { de: 'was-kostet-eine-website-schweiz', en: 'website-cost-switzerland', fr: 'prix-site-web-suisse' },
  rebranding: { de: 'rebranding-kmu-anzeichen', en: 'rebranding-sme-signs', fr: 'rebranding-pme-signes' },
  multilingual: { de: 'mehrsprachige-website-schweiz', en: 'multilingual-website-switzerland', fr: 'site-multilingue-suisse' },
  'ai-automation': { de: 'ki-automatisierung-kmu', en: 'ai-automation-sme', fr: 'automatisation-ia-pme' },
};

export const ROUTES: Route[] = [
  { id: 'home', template: 'home', slugs: same('') },
  { id: 'agencies', template: 'agencies', slugs: { de: 'agenturen', en: 'agencies', fr: 'agences' } },
  { id: 'services', template: 'services', slugs: S },
  ...SERVICE_IDS.map((id) => ({ id: `service-${id}`, template: 'service', param: id, parent: 'services', slugs: under(S, serviceSlugs[id]) })),
  { id: 'work', template: 'work', slugs: W },
  ...CASE_IDS.map((id) => ({ id: `case-${id}`, template: 'case', param: id, parent: 'work', slugs: under(W, same(id)) })),
  { id: 'pricing', template: 'pricing', slugs: { de: 'preise', en: 'pricing', fr: 'tarifs' } },
  { id: 'ki-check', template: 'kicheck', slugs: { de: 'ki-sichtbarkeits-check', en: 'ai-visibility-check', fr: 'check-visibilite-ia' } },
  { id: 'about', template: 'about', slugs: { de: 'ueber-uns', en: 'about', fr: 'a-propos' } },
  { id: 'blog', template: 'blog', slugs: B },
  ...ARTICLE_IDS.map((id) => ({ id: `article-${id}`, template: 'article', param: id, parent: 'blog', slugs: under(B, articleSlugs[id]) })),
  { id: 'contact', template: 'contact', slugs: { de: 'kontakt', en: 'contact', fr: 'contact' } },
  { id: 'impressum', template: 'legal', param: 'impressum', slugs: { de: 'impressum', en: 'legal-notice', fr: 'mentions-legales' } },
  { id: 'privacy', template: 'legal', param: 'privacy', slugs: { de: 'datenschutz', en: 'privacy', fr: 'protection-des-donnees' } },
  { id: 'terms', template: 'legal', param: 'terms', slugs: { de: 'agb', en: 'terms', fr: 'cgv' } },
  ...(['contact', 'agency', 'ki'] as const).map((p) => ({
    id: `thanks-${p}`, template: 'thanks', param: p, noindex: true,
    slugs: under(T, { de: { contact: 'kontakt', agency: 'agentur', ki: 'ki-check' }[p], en: { contact: 'contact', agency: 'agency', ki: 'ai-check' }[p], fr: { contact: 'contact', agency: 'agence', ki: 'check-ia' }[p] }),
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
