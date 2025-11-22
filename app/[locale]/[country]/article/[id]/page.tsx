import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

interface ArticlePageProps {
  params: Promise<{
    locale: string;
    country: string;
    id: string;
  }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { id } = await params;
  
  const article = await prisma.article.findUnique({
    where: { id },
    include: { source: true, country: true }
  });

  if (!article) return { title: 'Article Not Found' };

  const description = article.summary || article.content?.substring(0, 160) || '';
  const url = `https://mediasyndicate.online/en/${article.country?.slug}/article/${id}`;

  return {
    title: article.title,
    description: description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: article.title,
      description: description,
      url: url,
      siteName: 'MediaSyndicate',
      locale: 'en_US',
      type: 'article',
      publishedTime: article.publishedAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [article.source.name],
      section: article.category || 'News',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: description,
      site: '@MediaSyndicate',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id, locale } = await params;
  const t = await getTranslations('Article');

  const article = await prisma.article.findUnique({
    where: { id },
    include: { source: true, country: true }
  });

  if (!article) {
    notFound();
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    datePublished: article.publishedAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      '@type': 'Organization',
      name: article.source.name,
      url: article.source.url
    },
    publisher: {
      '@type': 'Organization',
      name: 'MediaSyndicate',
      url: 'https://mediasyndicate.online'
    },
    articleBody: article.rewrittenContent || article.content,
    url: `https://mediasyndicate.online/${locale}/${article.country?.slug}/article/${article.id}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      
      <article className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          
          <div className="flex items-center gap-4 text-gray-600 text-sm">
            <time dateTime={article.publishedAt.toISOString()}>
              {new Date(article.publishedAt).toLocaleDateString(locale)}
            </time>
            <span>•</span>
            <span>{article.source.name}</span>
            {article.category && (
              <>
                <span>•</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {article.category}
                </span>
              </>
            )}
          </div>
        </header>

        <div className="prose max-w-none mb-8">
          {article.rewrittenContent || article.content}
        </div>

        <footer className="border-t pt-4">
          <Link
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {t('viewOriginal', { default: 'View Original Source' })}
          </Link>
        </footer>
      </article>
    </>
  );
}

