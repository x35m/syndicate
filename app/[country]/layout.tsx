import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { CountryProvider } from '@/contexts/CountryContext';
import { ReactNode } from 'react';

const prisma = new PrismaClient();

export default async function CountryLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { country: string };
}) {
  // Получаем страну из БД
  const country = await prisma.country.findUnique({
    where: { slug: params.country },
    include: {
      languages: true,
      aiSettings: true,
    },
  });

  // Если страна не найдена - 404
  if (!country || !country.isActive) {
    notFound();
  }

  // Преобразуем данные для контекста
  const countryData = {
    id: country.id,
    code: country.code,
    name: country.name,
    slug: country.slug,
    isActive: country.isActive,
    languages: country.languages.map(l => ({
      code: l.languageCode,
      name: l.languageName,
      isDefault: l.isDefault,
    })),
    aiSettings: country.aiSettings ? {
      filterPrompt: country.aiSettings.filterPrompt,
      categorizationPrompt: country.aiSettings.categorizationPrompt,
      summaryPrompt: country.aiSettings.summaryPrompt,
    } : undefined,
  };

  return (
    <CountryProvider country={countryData}>
      {children}
    </CountryProvider>
  );
}

