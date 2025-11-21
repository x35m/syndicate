import Parser from 'rss-parser';

interface RSSItem {
  title: string;
  link: string;
  content: string;
  pubDate: string;
  author?: string;
  categories?: string[];
}

export class RSSParser {
  private parser: Parser;

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: ['media:content', 'media:thumbnail', 'enclosure']
      }
    });
  }

  async parseURL(url: string): Promise<RSSItem[]> {
    try {
      const feed = await this.parser.parseURL(url);
      
      return feed.items.map(item => ({
        title: item.title || '',
        link: item.link || '',
        content: item.contentSnippet || item.content || '',
        pubDate: item.pubDate || new Date().toISOString(),
        author: item.creator || item.author,
        categories: item.categories || []
      }));
    } catch (error) {
      console.error(`Failed to parse RSS feed ${url}:`, error);
      throw error;
    }
  }

  async parseMultipleURLs(urls: string[]): Promise<RSSItem[]> {
    const results = await Promise.allSettled(
      urls.map(url => this.parseURL(url))
    );

    return results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => (result as PromiseFulfilledResult<RSSItem[]>).value);
  }
}

