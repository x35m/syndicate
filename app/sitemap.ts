import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://mediasyndicate.online';
  
  // Получаем все активные страны
  const countries = await prisma.country.findMany({
    where: { isActive: true },
    include: { languages: true }
  });

  // Получаем все статьи
  const articles = await prisma.article.findMany({
    include: { country: true },
    orderBy: { publishedAt: 'desc' },
    take: 50000 // Google limit
  });

  const routes: MetadataRoute.Sitemap = [];

  // Главная страница
  routes.push({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
  });

  // Страницы стран с локалями
  for (const country of countries) {
    for (const lang of country.languages) {
      routes.push({
        url: `${baseUrl}/${lang.code}/${country.slug}`,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 0.9,
      });
    }
  }

  // Страницы статей
  for (const article of articles) {
    if (article.country) {
      routes.push({
        url: `${baseUrl}/en/${article.country.slug}/article/${article.id}`,
        lastModified: article.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  return routes;
}

