import site from '../config/site.json';
import { DEFAULT_LOCALE, type Locale, type Route, SERVICE_IDS } from './routes';

const files = import.meta.glob('/src/content/*/**/*.json', { eager: true, import: 'default' }) as Record<string, any>;

const NUM_LOCALE: Record<Locale, (n: number) => string> = {
  de: (n) => swiss(n),
  en: (n) => swiss(n),
  fr: (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
};
function swiss(n: number) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}

export function formatPrice(key: string, l: Locale): string {
  const p = (site.prices as Record<string, any>)[key];
  if (!p) throw new Error(`Unknown price: ${key}`);
  const u = raw(l, 'common').price;
  const n = NUM_LOCALE[l](p.amount);
  let s: string = (p.exact ? u.exact : u.from).replace('{n}', n);
  if (p.unit && u.units[p.unit]) s += u.units[p.unit];
  if (p.plusMedia) s += u.plusMedia;
  return s;
}

/** Marks a line whose legal value is not known yet; the legal template drops such lines. */
export const MISSING = '[[missing]]';

function tokens(l: Locale): Record<string, string> {
  const c = raw(l, 'common');
  return {
    email: site.email,
    phone: site.phone,
    'hours.from': site.hours.from,
    'hours.to': site.hours.to,
    'stat.brands': String(site.stats.brands),
    'stat.identities': String(site.stats.identities),
    'stat.response': String(site.stats.responseHours),
    'stat.offer': String(site.stats.offerHours),
    'stat.pilot': String(site.stats.pilotHours),
    'stat.report': String(site.stats.reportHours),
    'legal.name': site.legal.name,
    'legal.legalName': site.legal.legalName || site.legal.name,
    'legal.street': site.legal.street || MISSING,
    'legal.city': site.legal.city,
    'legal.postalCode': site.legal.postalCode,
    'legal.registry': site.legal.registry || MISSING,
    'legal.taxId': site.legal.taxId || MISSING,
    'legal.representative': site.legal.representative || MISSING,
    'legal.formProcessor': site.legal.formProcessor || MISSING,
    'legal.mailProcessor': site.legal.mailProcessor || MISSING,
    vat: c.price.vat,
  };
}

function raw(l: Locale, name: string): any {
  const hit = files[`/src/content/${l}/${name}.json`] ?? files[`/src/content/${DEFAULT_LOCALE}/${name}.json`];
  if (!hit) throw new Error(`Missing content: ${l}/${name}`);
  return hit;
}

function fill(v: any, t: Record<string, string>, l: Locale): any {
  if (typeof v === 'string')
    return v.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, k: string) => {
      if (k.startsWith('price.')) return formatPrice(k.slice(6), l);
      if (k in t) return t[k];
      throw new Error(`Unknown token {{${k}}} in ${l}`);
    });
  if (Array.isArray(v)) return v.map((x) => fill(x, t, l));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fill(x, t, l)]));
  return v;
}

const cache = new Map<string, any>();
export function load<T = any>(l: Locale, name: string): T {
  const key = `${l}:${name}`;
  if (!cache.has(key)) cache.set(key, fill(raw(l, name), tokens(l), l));
  return cache.get(key);
}

export const common = (l: Locale) => load(l, 'common');
export const service = (l: Locale, id: string) => load(l, `services/${id}`);
export const services = (l: Locale) => SERVICE_IDS.map((id) => ({ id, ...service(l, id) }));

export function pageContent(l: Locale, r: Route): any {
  switch (r.template) {
    case 'home': return load(l, 'home');
    case 'agencies': return load(l, 'agencies');
    case 'services': return load(l, 'services-overview');
    case 'service': return service(l, r.param!);
    case 'work': return load(l, 'work');
    case 'case': return load(l, `cases/${r.param}`);
    case 'pricing': return load(l, 'pricing');
    case 'kicheck': return load(l, 'ki-check');
    case 'about': return load(l, 'about');
    case 'blog': return load(l, 'blog');
    case 'article': return load(l, `blog/${r.param}`);
    case 'contact': return load(l, 'contact');
    case 'legal': return load(l, r.param!);
    case 'thanks': return load(l, 'thanks')[r.param!];
    default: throw new Error(`No content for template ${r.template}`);
  }
}

export const formatDate = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
};
export const articleWords = (a: any) =>
  [a.summary, ...a.sections.flatMap((s: any) => [s.h, ...(s.p ?? []), ...(s.list ?? [])])].join(' ').split(/\s+/).length;
