import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

const site = process.env.PUBLIC_SITE_URL ?? 'https://www.psicologiamedellin.co';

export default defineConfig({
  site,
  output: 'server',
  adapter: node({ mode: 'standalone' }),
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
