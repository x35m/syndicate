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
  /*
   * Match all request paths except:
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - sitemap.xml (sitemap)
   * - robots.txt (robots)
   * - api/* (API routes)
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api).*)',
  ],
};

