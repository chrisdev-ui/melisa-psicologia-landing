import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const siteUrl = (import.meta.env.PUBLIC_SITE_URL ?? 'https://www.psicologiamedellin.co').replace(/\/+$/, '');
  const now = new Date().toISOString();

  const urls = [`${siteUrl}/`];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (url) => `  <url>\n    <loc>${url}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`
    )
    .join('\n')}\n</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
