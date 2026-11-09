import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';

const site = JSON.parse(readFileSync(new URL('./src/config/site.json', import.meta.url), 'utf8'));

export default defineConfig({
  site: process.env.SITE_URL || site.domain,
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  image: { responsiveStyles: false },
  vite: { plugins: [tailwindcss()] },
});
