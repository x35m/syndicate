import { CountryPageClient } from '@/components/CountryPageClient';

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

export default async function CountryPage({
  params
}: {
  params: Promise<{ country: string }>;
}) {
  const { country: countrySlug } = await params;
  const articles = await getArticles(countrySlug);

  return (
    <CountryPageClient articles={articles} />
  );
}
