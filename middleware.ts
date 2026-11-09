// Root "/" → best matching language. Vercel runs the default export; Cloudflare reuses redirect().
const SUPPORTED = ['de', 'en', 'fr', 'tr'];

export function pickLocale(header: string | null): string {
  const ranked = (header ?? '')
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().toLowerCase().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      return { lang: tag.split('-')[0], q: q ? Number(q.trim().slice(2)) || 0 : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return ranked.find((r) => SUPPORTED.includes(r.lang))?.lang ?? 'de';
}

export function redirect(request: Request) {
  const { search } = new URL(request.url);
  return new Response(null, {
    status: 302,
    headers: {
      Location: `/${pickLocale(request.headers.get('accept-language'))}/${search}`,
      Vary: 'Accept-Language',
      'Cache-Control': 'private, no-store',
    },
  });
}

export const config = { matcher: '/' };

export default redirect;
