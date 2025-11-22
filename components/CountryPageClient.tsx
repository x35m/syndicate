'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useCountry } from '@/contexts/CountryContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import Link from 'next/link';

export function CountryPageClient({ articles }: { articles: any[] }) {
  const t = useTranslations('country');
  const locale = useLocale();
  const { country } = useCountry();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{country.name}</h1>
          <p className="mt-2 text-gray-600">
            {t('availableLanguages')}: {country.languages.map(lang => lang.name).join(', ')}
          </p>
        </div>
        <LanguageSelector />
      </div>

      {/* Articles */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('latestNews')}</h2>
        
        {articles.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">{t('noArticles')}</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {articles.map((article: any) => (
              <article key={article.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{article.source}</span>
                    <span>•</span>
                    <time>{new Date(article.publishedAt).toLocaleDateString()}</time>
                    {article.category && (
                      <>
                        <span>•</span>
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                          {article.category}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                    <Link 
                      href={`/${locale}/${country.slug}/article/${article.id}`}
                      className="hover:text-blue-600"
                    >
                      {article.title}
                    </Link>
                  </h3>
                  
                  {article.summary && (
                    <p className="text-gray-600 line-clamp-3">{article.summary}</p>
                  )}
                  
                  {article.content && !article.summary && (
                    <p className="text-gray-600 line-clamp-3">{article.content}</p>
                  )}
                  
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {t('readMore')} →
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

