import { RSSParser } from './RSSParser';
import { CountryFilterService } from './CountryFilterService';
import { prisma } from '@/lib/prisma';

interface ImportResult {
  success: boolean;
  articlesFound: number;
  articlesImported: number;
  errors: string[];
}

export class RSSImporter {
  private rssParser: RSSParser;
  private filterService: CountryFilterService;
  private readonly BATCH_SIZE = 5;
  private readonly DELAY_MS = 2000;

  constructor() {
    this.rssParser = new RSSParser();
    this.filterService = new CountryFilterService();
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async importForCountry(countryCode: string): Promise<ImportResult> {
    const logId = await this.createLog(countryCode);
    
    try {
      const country = await prisma.country.findUnique({
        where: { code: countryCode },
        include: { sources: { where: { isActive: true, type: 'RSS' } } }
      });

      if (!country) {
        throw new Error(`Country ${countryCode} not found`);
      }

      let totalArticles = 0;
      let importedArticles = 0;
      const errors: string[] = [];

      for (const source of country.sources) {
        try {
          const articles = await this.rssParser.parseURL(source.url);
          totalArticles += articles.length;

          for (let i = 0; i < articles.length; i += this.BATCH_SIZE) {
            const batch = articles.slice(i, i + this.BATCH_SIZE);
            
            for (const article of batch) {
              try {
                const exists = await prisma.article.findUnique({
                  where: { url: article.link }
                });

                if (!exists) {
                  const isRelevant = await this.filterService.filterArticle(
                    article.title,
                    article.content || '',
                    country.code
                  );

                  if (isRelevant) {
                    const rewrittenContent = await this.filterService.rewriteContent(
                      article.title,
                      article.content || ''
                    );
                    
                    await prisma.article.create({
                      data: {
                        title: article.title,
                        url: article.link,
                        content: article.content,
                        rewrittenContent: rewrittenContent,
                        publishedAt: new Date(article.pubDate),
                        sourceId: source.id,
                        countryId: country.id
                      }
                    });
                    importedArticles++;
                  }
                }
              } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                errors.push(`Article ${article.title}: ${errorMsg}`);
              }
            }
            
            if (i + this.BATCH_SIZE < articles.length) {
              await this.delay(this.DELAY_MS);
            }
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          errors.push(`Source ${source.name}: ${errorMsg}`);
        }
      }

      await this.updateLog(logId, 'success', totalArticles, importedArticles);

      return {
        success: true,
        articlesFound: totalArticles,
        articlesImported: importedArticles,
        errors
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      await this.updateLog(logId, 'failed', 0, 0, errorMsg);
      
      return {
        success: false,
        articlesFound: 0,
        articlesImported: 0,
        errors: [errorMsg]
      };
    }
  }

  private async createLog(countryCode: string): Promise<string> {
    const log = await prisma.importLog.create({
      data: {
        countryCode,
        status: 'running'
      }
    });
    return log.id;
  }

  private async updateLog(
    id: string,
    status: string,
    found: number,
    imported: number,
    error?: string
  ): Promise<void> {
    await prisma.importLog.update({
      where: { id },
      data: {
        status,
        articlesFound: found,
        articlesImported: imported,
        errorMessage: error,
        finishedAt: new Date()
      }
    });
  }
}
