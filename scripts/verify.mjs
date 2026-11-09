// Post-build QA. `npm run verify` checks dist/. `npm run launch-check` also fails on unfilled launch settings.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const launch = process.argv.includes('--launch');
const LOCALES = ['de', 'en', 'fr', 'tr'];
const dist = 'dist';
const errors = [];
const warn = [];
const err = (m) => errors.push(m);

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const decode = (s) => s.replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)));
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const exists = (p) => { const clean = p.split(/[?#]/)[0]; return existsSync(join(dist, clean, clean.endsWith('/') ? 'index.html' : '')); };

// 1. Content parity across locales
const contentRoot = 'src/content';
const keys = (v, pre = '') => Array.isArray(v) ? [`${pre}[${v.length}]`, ...v.flatMap((x, i) => keys(x, `${pre}[${i}]`))] : v && typeof v === 'object' ? Object.entries(v).flatMap(([k, x]) => keys(x, `${pre}.${k}`)) : [pre];
const tokens = (v) => [...JSON.stringify({ ...v, llms: undefined }).matchAll(/\{\{\s*([\w.-]+)\s*\}\}/g)].map((m) => m[1]).sort().join();
const rel = (l) => walk(join(contentRoot, l)).map((f) => f.slice(join(contentRoot, l).length + 1)).sort();
const base = rel('de');
for (const l of LOCALES) {
  if (!existsSync(join(contentRoot, l))) { err(`missing content locale ${l}`); continue; }
  const files = rel(l);
  if (files.join() !== base.join()) err(`${l}: file set differs from de: ${base.filter((f) => !files.includes(f)).concat(files.filter((f) => !base.includes(f)))}`);
  for (const f of base) {
    const p = join(contentRoot, l, f);
    if (!existsSync(p)) continue;
    const a = JSON.parse(readFileSync(join(contentRoot, 'de', f), 'utf8'));
    const b = JSON.parse(readFileSync(p, 'utf8'));
    const ka = keys(a).filter((k) => !k.includes('llms')).join();
    const kb = keys(b).filter((k) => !k.includes('llms')).join();
    if (ka !== kb) err(`${l}/${f}: key structure differs from de`);
    if (tokens(a) !== tokens(b)) err(`${l}/${f}: {{tokens}} differ from de`);
    const raw = readFileSync(p, 'utf8');
    if (/CHF\s?\d/.test(raw.replace(/"_review".*/g, ''))) err(`${l}/${f}: hard-coded CHF amount; use a {{price.x}} token`);
    if (l === 'de' && /ß/.test(raw)) err(`de/${f}: contains ß`);
  }
}

// 2. Built HTML
const html = walk(dist).filter((f) => f.endsWith('.html') && LOCALES.includes(f.split('/')[1]));
const titles = new Map();
const site = JSON.parse(readFileSync('src/config/site.json', 'utf8'));
for (const f of html) {
  const url = '/' + f.slice(dist.length + 1).replace(/index\.html$/, '');
  const h = readFileSync(f, 'utf8');
  const locale = url.split('/')[1];
  const noindex = /name="robots" content="noindex/.test(h);
  if (/\{\{|\}\}/.test(h.replace(/<style.*?<\/style>|<script.*?<\/script>/gs, ''))) err(`${url}: unresolved token`);
  const title = decode(h.match(/<title>(.*?)<\/title>/s)?.[1] ?? '');
  const desc = decode(h.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '');
  if (!title || title.length >= 60) err(`${url}: title ${title.length} chars: ${title}`);
  if (!desc || desc.length >= 155) err(`${url}: description ${desc.length} chars: ${desc}`);
  if (!noindex) { const k = locale + title; if (titles.has(k)) err(`${url}: duplicate title with ${titles.get(k)}`); titles.set(k, url); }
  const h1 = (h.match(/<h1[\s>]/g) ?? []).length;
  if (h1 !== 1) err(`${url}: ${h1} h1`);
  const canon = attr(h.match(/<link rel="canonical"[^>]*>/)?.[0] ?? '', 'href') ?? '';
  if (!canon.endsWith(url)) err(`${url}: canonical ${canon}`);
  const alts = [...h.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)];
  if (alts.length !== 5) err(`${url}: ${alts.length} hreflang`);
  for (const [, , href] of alts) { const p = new URL(href).pathname; if (!exists(p)) err(`${url}: hreflang → missing ${p}`); }
  const lang = h.match(/<html lang="([^"]+)"/)?.[1] ?? '';
  if (!lang.startsWith(locale)) err(`${url}: html lang ${lang}`);
  for (const m of h.matchAll(/<(?:a)\s[^>]*href="(\/[^"]*)"/g)) if (!m[1].startsWith('//') && !exists(decode(m[1]))) err(`${url}: broken link ${m[1]}`);
  for (const m of h.matchAll(/<img\s[^>]*>/g)) if (!/\salt="/.test(m[0])) err(`${url}: img without alt`);
  for (const m of h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) { try { JSON.parse(m[1]); } catch { err(`${url}: invalid JSON-LD`); } }
  if (locale === 'de') {
    const text = h.replace(/<script.*?<\/script>|<style.*?<\/style>/gs, '').replace(/<[^>]+>/g, ' ');
    if (/ß/.test(text)) err(`${url}: ß in German text`);
    if (/CHF\s?\d{4}/.test(text)) err(`${url}: CHF without apostrophe`);
  }
  if ((locale === 'de' || locale === 'fr') && !h.includes('native review needed')) err(`${url}: missing review marker`);
}
const expected = walk(dist).filter((f) => f.endsWith('index.html') && LOCALES.includes(f.split('/')[1])).length;

// 3. Crawl files and JS budget
for (const f of ['robots.txt', 'sitemap.xml', 'llms.txt', '_routes.json', '_headers']) if (!existsSync(join(dist, f))) err(`missing ${f}`);
const robots = existsSync(join(dist, 'robots.txt')) ? readFileSync(join(dist, 'robots.txt'), 'utf8') : '';
for (const b of ['GPTBot', 'PerplexityBot', 'Google-Extended', 'ClaudeBot']) if (!robots.includes(b)) err(`robots: ${b} missing`);
const external = walk(join(dist, '_astro')).filter((f) => f.endsWith('.js')).reduce((n, f) => n + statSync(f).size, 0);
const inline = Math.max(...html.map((f) => [...readFileSync(f, 'utf8').matchAll(/<script(?![^>]*ld\+json)[^>]*>(.*?)<\/script>/gs)].reduce((n, m) => n + m[1].length, 0)));
const js = external + inline;
if (js > 100 * 1024) err(`JS budget: ${js} bytes`);

// 4. Launch settings
if (launch) {
  if (site.domain.includes('.example')) err('site.json: domain is still a placeholder');
  if (!site.calLink) err('site.json: calLink is empty');
  if (!site.forms.turnstileSiteKey) err('site.json: forms.turnstileSiteKey is empty');
  for (const [k, v] of Object.entries(site.legal)) if (!String(v).trim() || String(v).includes('[FILL')) err(`site.json: legal.${k} not filled`);
  for (const l of LOCALES) for (const f of base) { const p = join(contentRoot, l, f); if (existsSync(p) && readFileSync(p, 'utf8').includes('[FILL')) err(`${l}/${f}: contains [FILL]`); }
}

console.log(`Pages checked: ${expected} · client JS: ${(js / 1024).toFixed(1)} KB`);
if (errors.length) { console.error(`\n${errors.length} problem(s):\n` + errors.map((e) => ' - ' + e).join('\n')); process.exit(1); }
console.log(launch ? 'Launch check passed.' : 'All checks passed.');
