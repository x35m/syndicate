import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface FilterResult {
  isRelevant: boolean;
  confidence: number;
  category?: string;
}

export class CountryFilterService {
  async filterArticle(
    title: string,
    content: string,
    countryCode: string
  ): Promise<boolean> {
    try {
      const prompt = `Analyze if this news article is directly relevant to ${countryCode}.

Article Title: ${title}
Article Content: ${content.substring(0, 500)}

Respond with JSON only:
{
  "isRelevant": true/false,
  "confidence": 0.0-1.0
}

Consider relevant:
- News about the country's politics, economy, society
- International news directly affecting the country
- Major global events with clear country impact

Consider NOT relevant:
- General world news without country connection
- Sports/entertainment unless nationally significant
- Generic international news

RESPOND ONLY WITH VALID JSON, NO OTHER TEXT.`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 150,
      });

      const response = completion.choices[0]?.message?.content || '{}';
      const result: FilterResult = JSON.parse(response.trim());

      return result.isRelevant && result.confidence >= 0.7;
    } catch (error) {
      console.error('Filter error:', error);
      return false;
    }
  }

  async rewriteContent(title: string, content: string): Promise<string> {
    try {
      const prompt = `Rewrite this news article to be unique while keeping all facts accurate. Make it SEO-friendly and natural.

Original Title: ${title}
Original Content: ${content}

Requirements:
- Keep all facts and dates accurate
- Change sentence structure completely
- Use different vocabulary
- Keep the same meaning
- Make it readable and engaging
- Length: similar to original

Respond with ONLY the rewritten content, no additional text or formatting.`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1000,
      });

      return completion.choices[0]?.message?.content?.trim() || content;
    } catch (error) {
      console.error('Rewrite error:', error);
      return content;
    }
  }
}
