import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Список поддерживаемых локалей
export const locales = ['en', 'uk', 'ru'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  
  // Проверяем что локаль поддерживается
  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});

