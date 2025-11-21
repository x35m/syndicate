import { PrismaClient } from '@prisma/client';
import { RSSParser } from './RSSParser';
import { CountryFilterService } from './CountryFilterService';

const prisma = new PrismaClient();

export class RSSImporter {
  private rssParser: RSSParser;
  private filterService: CountryFilterService;

  constructor(groqApiKey: string) {
    this.rssParser = new RSSParser();
    this.filterService = new CountryFilterService(groqApiKey);
  }

  async importForCountry(countrySlug: string) {
    // Получаем страну с источниками
    const country = await prisma.country.findUnique({
      where: { slug: countrySlug, isActive: true },
      include: { sources: { where: { isActive: true, type: 'RSS' } } }
    });

    if (!country) {
      throw new Error(`Country ${countrySlug} not found or inactive`);
    }

    console.log(`Starting import for ${country.name}, ${country.sources.length} sources`);

    let totalArticles = 0;
    let totalRelevant = 0;
    let totalSaved = 0;

    // Обрабатываем каждый source отдельно
    for (const source of country.sources) {
      try {
        console.log(`Parsing source: ${source.name} (${source.url})`);
        
        // Парсим RSS
        const articles = await this.rssParser.parseURL(source.url);
        totalArticles += articles.length;

        // Фильтруем через AI
        const filterResults = await this.filterService.filterBatch(
          articles.map(a => ({ title: a.title, content: a.content })),
          country.name
        );

        // Сохраняем релевантные статьи
        const relevantArticles = articles.filter((_, i) => 
          filterResults[i].isRelevant && filterResults[i].confidence > 0.7
        );
        totalRelevant += relevantArticles.length;

        for (const article of relevantArticles) {
          try {
            await prisma.article.upsert({
              where: { url: article.link },
              update: {},
              create: {
                title: article.title,
                content: article.content,
                url: article.link,
                publishedAt: new Date(article.pubDate),
                sourceId: source.id,
                countryId: country.id,
              }
            });
            totalSaved++;
          } catch (error) {
            console.error(`Failed to save article ${article.link}:`, error);
          }
        }
      } catch (error) {
        console.error(`Failed to process source ${source.url}:`, error);
      }
    }

    console.log(`Import complete for ${country.name}: ${totalSaved}/${totalRelevant} saved`);
    
    return { total: totalArticles, relevant: totalRelevant, saved: totalSaved };
  }

  async importAll() {
    const countries = await prisma.country.findMany({
      where: { isActive: true }
    });

    const results = [];
    for (const country of countries) {
      try {
        const result = await this.importForCountry(country.slug);
        results.push({ country: country.slug, ...result });
      } catch (error) {
        console.error(`Failed to import for ${country.slug}:`, error);
      }
    }

    return results;
  }
}

