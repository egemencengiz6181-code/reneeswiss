import type { APIRoute } from 'astro';
export const GET: APIRoute = ({ site }) =>
  new Response(
    ['User-agent: *', 'Allow: /', 'Disallow: /styleguide/', '', ...['GPTBot', 'PerplexityBot', 'Google-Extended', 'ClaudeBot'].flatMap((b) => [`User-agent: ${b}`, 'Allow: /', '']), `Sitemap: ${site!.origin}/sitemap.xml`, ''].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
