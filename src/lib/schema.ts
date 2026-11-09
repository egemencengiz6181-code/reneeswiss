import site from '../config/site.json';
import { HREFLANG, type Locale } from './routes';

export function orgGraph(origin: string, locale: Locale) {
  const id = `${origin}/#org`;
  return [
    {
      '@type': ['Organization', 'ProfessionalService'],
      '@id': id,
      name: 'Renee',
      legalName: site.legal.name,
      url: `${origin}/${locale}/`,
      logo: `${origin}/brand/renee-logo-trim.webp`,
      image: `${origin}/brand/renee-logo-trim.webp`,
      email: site.email,
      telephone: site.phone,
      areaServed: { '@type': 'Country', name: 'CH' },
      address: { '@type': 'PostalAddress', addressLocality: 'Ankara', addressRegion: 'Çankaya', addressCountry: site.legal.country, streetAddress: 'ODTÜ Teknokent' },
      sameAs: [site.social.linkedin, site.social.instagram, site.existingSite],
      inLanguage: HREFLANG[locale],
    },
  ];
}

export const breadcrumbLd = (origin: string, items: { name: string; url: string }[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.name, item: origin + b.url })),
});

export const faqLd = (items: { q: string; a: string }[]) => ({
  '@type': 'FAQPage',
  mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

export function serviceLd(origin: string, url: string, name: string, description: string, priceKey: string) {
  const p = (site.prices as Record<string, any>)[priceKey];
  const unit: Record<string, string> = { month: 'MON', hour: 'HUR' };
  return {
    '@type': 'Service',
    name,
    description,
    url: origin + url,
    provider: { '@id': `${origin}/#org` },
    areaServed: { '@type': 'Country', name: 'CH' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'CHF',
      url: origin + url,
      priceSpecification: {
        '@type': p.unit && unit[p.unit] ? 'UnitPriceSpecification' : 'PriceSpecification',
        minPrice: p.amount,
        priceCurrency: 'CHF',
        valueAddedTaxIncluded: false,
        ...(p.unit && unit[p.unit] ? { unitCode: unit[p.unit] } : {}),
      },
    },
  };
}

export const articleLd = (origin: string, url: string, a: any, locale: Locale) => ({
  '@type': 'Article',
  headline: a.title,
  description: a.meta.description,
  datePublished: a.date,
  dateModified: a.date,
  inLanguage: HREFLANG[locale],
  mainEntityOfPage: origin + url,
  image: `${origin}/og/${locale}/article-${a.id}.png`,
  author: { '@type': 'Organization', name: a.author },
  publisher: { '@id': `${origin}/#org` },
});
