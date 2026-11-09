import type { APIRoute } from 'astro';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { LOCALES, ROUTES, type Locale, type Route } from '../../../lib/routes';
import { pageContent } from '../../../lib/content';

export const getStaticPaths = () =>
  LOCALES.flatMap((locale) => ROUTES.map((route) => ({ params: { locale, id: route.id }, props: { locale, route } })));

const root = process.cwd();
const font = (s: string) => readFileSync(resolve(root, `node_modules/@fontsource/inter/files/inter-${s}-500-normal.woff`));
const fonts = [
  { name: 'Inter', data: font('latin'), weight: 500 as const, style: 'normal' as const },
  { name: 'InterExt', data: font('latin-ext'), weight: 500 as const, style: 'normal' as const },
];
const png = async (f: string, h: number) => `data:image/png;base64,${(await sharp(resolve(root, 'public/brand', f)).resize({ height: h }).png().toBuffer()).toString('base64')}`;
const logo = await png('renee-logo-white-trim.webp', 72);
const star = await png('renee-star-lime-sm.webp', 56);

const el = (type: string, style: object, children?: any, extra: object = {}) => ({ type, props: { style, children, ...extra } });

export const GET: APIRoute = async ({ props }) => {
  const { locale, route } = props as { locale: Locale; route: Route };
  const c = pageContent(locale, route);
  const title: string = c.h1 ?? c.title ?? c.name ?? c.hero?.h1 ?? c.meta.title;
  const size = title.length > 70 ? 56 : 72;
  const svg = await satori(
    el('div', { width: 1200, height: 630, background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', padding: 72, fontFamily: 'Inter, InterExt' }, [
      el('div', { display: 'flex', width: 1056, height: 72, justifyContent: 'space-between', alignItems: 'flex-start' }, [
        el('img', { width: 166, height: 72 }, undefined, { src: logo, width: 166, height: 72 }),
        el('img', { width: 56, height: 56 }, undefined, { src: star, width: 56, height: 56 }),
      ]),
      el('div', { display: 'flex', width: 1056, marginTop: 120, fontSize: size, lineHeight: 1.08, letterSpacing: '-0.02em' }, title),
    ]) as any,
    { width: 1200, height: 630, fonts },
  );
  const body = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  return new Response(new Uint8Array(body), { headers: { 'Content-Type': 'image/png' } });
};
