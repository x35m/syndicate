'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface Language {
  code: string;
  name: string;
  isDefault: boolean;
}

interface Country {
  code: string;
  name: string;
  slug: string;
  isActive: boolean;
  languages: Language[];
  hasAISettings: boolean;
  stats: {
    sources: number;
    articles: number;
  };
}

interface CountriesResponse {
  status: string;
  count: number;
  countries: Country[];
}

export function CountrySelector() {
  const t = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);

  useEffect(() => {
    fetch('/api/countries')
      .then(res => res.json())
      .then((data: CountriesResponse) => {
        setCountries(data.countries);
        
        // Определяем текущую страну из URL
        const pathParts = pathname.split('/').filter(Boolean);
        let countrySlug: string | null = null;

        // Проверяем первый сегмент - локаль или страна?
        if (pathParts.length > 0) {
          if (['en', 'uk', 'ru'].includes(pathParts[0])) {
            // Первый сегмент - локаль, страна во втором
            countrySlug = pathParts[1] || null;
          } else {
            // Первый сегмент - страна (нет явной локали)
            countrySlug = pathParts[0];
          }
          
          if (countrySlug) {
            const current = data.countries.find(c => c.slug === countrySlug);
            setCurrentCountry(current || null);
          }
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading countries:', err);
        setLoading(false);
      });
  }, [pathname]);

  const handleCountryChange = (slug: string) => {
    // Извлекаем текущую локаль из pathname
    const pathParts = pathname.split('/').filter(Boolean);
    const currentLocale = ['en', 'uk', 'ru'].includes(pathParts[0]) ? pathParts[0] : 'en';
    
    router.push(`/${currentLocale}/${slug}`);
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-500">{t('loading')}</div>
    );
  }

  const countryFlags: Record<string, string> = {
    UA: '🇺🇦',
    US: '🇺🇸',
    GB: '🇬🇧',
    FR: '🇫🇷',
    DE: '🇩🇪',
    ES: '🇪🇸',
  };

  return (
    <div className="relative inline-block">
      <select
        value={currentCountry?.slug || ''}
        onChange={(e) => handleCountryChange(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
      >
        <option value="" disabled>
          {t('selectCountry')}
        </option>
        {countries.map(country => (
          <option key={country.code} value={country.slug}>
            {countryFlags[country.code] || '🌍'} {country.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
}

