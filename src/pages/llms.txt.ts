import type { APIRoute } from 'astro';
import site from '../config/site.json';
import { href, LOCALES } from '../lib/routes';
import { formatPrice, load, services } from '../lib/content';

// Summary for AI crawlers: English, generated from the same config and content as the site.
export const GET: APIRoute = ({ site: url }) => {
  const o = url!.origin;
  const l = 'en' as const;
  const c = load(l, 'common');
  const lines = [
    '# Renee',
    '',
    `> ${c.llms.summary}`,
    '',
    '## Facts',
    ...c.llms.facts.map((f: string) => `- ${f}`),
    '',
    '## Services and starting prices (CHF, excl. VAT)',
    ...services(l).map((s) => `- [${s.name}](${o}${href(l, `service-${s.id}`)}): ${s.short} Price: ${formatPrice(s.id, l)}. Delivery: ${s.timeline}.`),
    `- White-label for agencies: ${formatPrice('agencyHour', l)}. [Details](${o}${href(l, 'agencies')})`,
    '',
    '## Contact',
    `- Email: ${site.email}`,
    `- Phone: ${site.phone}`,
    `- Free 20-minute intro call: ${o}${href(l, 'contact')}`,
    `- Free AI visibility check: ${o}${href(l, 'ki-check')}`,
    '',
    '## Languages',
    ...LOCALES.map((x) => `- ${x}: ${o}/${x}/`),
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
