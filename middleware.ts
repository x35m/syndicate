import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // Список поддерживаемых локалей
  locales: ['en', 'uk', 'ru'],

  // Локаль по умолчанию
  defaultLocale: 'en',
  
  // Не добавлять локаль в URL для defaultLocale
  localePrefix: 'as-needed'
});

export const config = {
  // Применять middleware ко всем путям кроме api, _next, favicon
  matcher: ['/((?!api|_next|favicon.ico).*)']
};

