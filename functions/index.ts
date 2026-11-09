// Root "/" → best matching language. Runs only on "/" (see public/_routes.json).
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

export const onRequestGet = ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  return new Response(null, {
    status: 302,
    headers: {
      Location: `/${pickLocale(request.headers.get('accept-language'))}/${url.search}`,
      Vary: 'Accept-Language',
      'Cache-Control': 'private, no-store',
    },
  });
};
