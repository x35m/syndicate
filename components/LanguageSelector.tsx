'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useCountry } from '@/contexts/CountryContext';

const languageNames: Record<string, string> = {
  en: 'English',
  uk: 'Українська',
  ru: 'Русский',
};

const languageFlags: Record<string, string> = {
  en: '🇬🇧',
  uk: '🇺🇦',
  ru: '🇷🇺',
};

export function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const { country } = useCountry();

  const handleLanguageChange = (newLocale: string) => {
    // Получаем путь без локали
    const pathWithoutLocale = pathname.replace(/^\/(en|uk|ru)/, '') || '/';
    
    // Если новая локаль - английский (defaultLocale), не добавляем префикс
    const newPath = newLocale === 'en' 
      ? pathWithoutLocale 
      : `/${newLocale}${pathWithoutLocale}`;
    
    router.push(newPath);
    router.refresh();
  };

  return (
    <div className="relative inline-block">
      <select
        value={currentLocale}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
      >
        {country.languages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {languageFlags[lang.code] || '🌐'} {languageNames[lang.code] || lang.name}
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

