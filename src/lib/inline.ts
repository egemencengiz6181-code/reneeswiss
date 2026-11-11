import { href, type Locale } from './routes';

// Minimal inline markup for content strings: [text](url), **bold**, `code` and line breaks.
// A link target starting with "@" is a route id, resolved to the page in the current locale
// (e.g. "@service-branding" → /fr/services/identite-visuelle/).

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

export function inline(text: string, l: Locale): string {
  return esc(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(LINK, (_, label: string, url: string) => {
      const target = url.startsWith('@') ? href(l, url.slice(1)) : url;
      const external = /^https?:/.test(target) ? ' rel="noopener"' : '';
      return `<a class="link" href="${target}"${external}>${label}</a>`;
    })
    .replace(/\n/g, '<br />');
}

/** The same string without markup, for JSON-LD, meta tags and word counts. */
export const plain = (text: string) =>
  text.replace(LINK, '$1').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1').replace(/\n/g, ' ');
