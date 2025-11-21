import Groq from 'groq-sdk';

interface FilterResult {
  isRelevant: boolean;
  confidence: number;
  reason?: string;
}

export class CountryFilterService {
  private groq: Groq;

  constructor(apiKey: string) {
    this.groq = new Groq({ apiKey });
  }

  async filterArticle(
    articleTitle: string,
    articleContent: string,
    countryName: string
  ): Promise<FilterResult> {
    try {
      const prompt = `Analyze if this news article is relevant to ${countryName}.

Article title: "${articleTitle}"
Article content: "${articleContent.substring(0, 500)}"

Respond with JSON only:
{
  "isRelevant": true/false,
  "confidence": 0.0-1.0,
  "reason": "brief explanation"
}`;

      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        max_tokens: 200,
      });

      const response = completion.choices[0]?.message?.content || '{}';
      const result = JSON.parse(response);

      return {
        isRelevant: result.isRelevant || false,
        confidence: result.confidence || 0,
        reason: result.reason
      };
    } catch (error) {
      console.error('Failed to filter article:', error);
      return { isRelevant: false, confidence: 0 };
    }
  }

  async filterBatch(
    articles: Array<{ title: string; content: string }>,
    countryName: string
  ): Promise<FilterResult[]> {
    return Promise.all(
      articles.map(article => 
        this.filterArticle(article.title, article.content, countryName)
      )
    );
  }
}

