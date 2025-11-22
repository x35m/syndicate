import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const baseUrl = 'https://mediasyndicate.online';
  
  const countries = await prisma.country.findMany({
    where: { isActive: true },
    include: { languages: true }
  });

  const articles = await prisma.article.findMany({
    include: { country: true },
    orderBy: { publishedAt: 'desc' },
    take: 1000
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${countries.map(country => 
    country.languages.map(lang => `
  <url>
    <loc>${baseUrl}/${lang.languageCode}/${country.slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>`).join('')
  ).join('')}
  ${articles.map(article => 
    article.country ? `
  <url>
    <loc>${baseUrl}/en/${article.country.slug}/article/${article.id}</loc>
    <lastmod>${article.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>` : ''
  ).join('')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}

