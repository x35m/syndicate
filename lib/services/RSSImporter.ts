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
      include: { sources: { where: { isActive: true } } }
    });

    if (!country) {
      throw new Error(`Country ${countrySlug} not found or inactive`);
    }

    console.log(`Starting import for ${country.name}, ${country.sources.length} sources`);

    const rssUrls = country.sources
      .filter(source => source.type === 'RSS')
      .map(source => source.url);

    // Парсим все RSS фиды
    const articles = await this.rssParser.parseMultipleURLs(rssUrls);
    console.log(`Parsed ${articles.length} articles`);

    // Фильтруем через AI
    const filterResults = await this.filterService.filterBatch(
      articles.map(a => ({ title: a.title, content: a.content })),
      country.name
    );

    // Сохраняем релевантные статьи
    const relevantArticles = articles.filter((_, i) => 
      filterResults[i].isRelevant && filterResults[i].confidence > 0.7
    );

    console.log(`${relevantArticles.length} relevant articles after filtering`);

    let savedCount = 0;
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
            author: article.author,
            countryId: country.id,
          }
        });
        savedCount++;
      } catch (error) {
        console.error(`Failed to save article ${article.link}:`, error);
      }
    }

    console.log(`Saved ${savedCount} new articles for ${country.name}`);
    
    return { total: articles.length, relevant: relevantArticles.length, saved: savedCount };
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

