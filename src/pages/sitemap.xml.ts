import type { APIRoute } from 'astro';
import { HREFLANG, LOCALES, ROUTES, pathOf } from '../lib/routes';

export const GET: APIRoute = ({ site }) => {
  const o = site!.origin;
  const urls = ROUTES.filter((r) => !r.noindex).flatMap((r) =>
    LOCALES.map((l) => {
      const alts = LOCALES.map((x) => `<xhtml:link rel="alternate" hreflang="${HREFLANG[x]}" href="${o}${pathOf(r, x)}"/>`).join('');
      return `<url><loc>${o}${pathOf(r, l)}</loc>${alts}<xhtml:link rel="alternate" hreflang="x-default" href="${o}${pathOf(r, 'de')}"/></url>`;
    }),
  );
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml' } });
};
