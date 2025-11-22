import { CountryPageClient } from '@/components/CountryPageClient';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

interface CountryPageProps {
  params: Promise<{ locale: string; country: string }>;
}

async function getArticles(countrySlug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/articles?country=${countrySlug}&limit=10`,
      { cache: 'no-store' }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return [];
  }
}

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const { country: countrySlug, locale } = await params;
  
  const country = await prisma.country.findUnique({
    where: { slug: countrySlug },
  });

  if (!country) return { title: 'Country Not Found' };

  const url = `https://mediasyndicate.online/${locale}/${countrySlug}`;

  return {
    title: `${country.name} News - MediaSyndicate`,
    description: `Latest news and updates from ${country.name}. Stay informed with real-time news aggregation.`,
    alternates: {
      canonical: url,
      languages: {
        'en': `https://mediasyndicate.online/en/${countrySlug}`,
        'uk': `https://mediasyndicate.online/uk/${countrySlug}`,
        'ru': `https://mediasyndicate.online/ru/${countrySlug}`,
      },
    },
    openGraph: {
      title: `${country.name} News`,
      description: `Latest news from ${country.name}`,
      url: url,
      siteName: 'MediaSyndicate',
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${country.name} News`,
      description: `Latest news from ${country.name}`,
    },
  };
}

export default async function CountryPage({
  params
}: {
  params: Promise<{ locale: string; country: string }>;
}) {
  const { country: countrySlug } = await params;
  const articles = await getArticles(countrySlug);

  return (
    <CountryPageClient articles={articles} />
  );
}
