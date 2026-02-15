import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const siteUrl = (import.meta.env.PUBLIC_SITE_URL ?? 'https://www.psicologiamedellin.co').replace(/\/+$/, '');

  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /gracias',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
