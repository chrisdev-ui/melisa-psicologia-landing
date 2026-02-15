import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

import vercel from '@astrojs/vercel';

const site = process.env.PUBLIC_SITE_URL ?? 'https://www.psicologiamedellin.co';

export default defineConfig({
  site,
  output: 'server',
  adapter: vercel(),
  integrations: [],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
  },
});