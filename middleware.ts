// Vercel: "/" → best matching language. Same logic as the Cloudflare function.
import { pickLocale } from './functions/index';

export const config = { matcher: '/' };

export default function middleware(request: Request) {
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
