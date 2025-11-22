import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://mediasyndicate.online'),
  title: {
    default: 'MediaSyndicate - Global News Aggregation',
    template: '%s | MediaSyndicate',
  },
  description: 'Real-time news aggregation from trusted sources worldwide. Stay informed with AI-powered content filtering.',
  keywords: ['news', 'aggregation', 'international news', 'Ukraine news', 'real-time news'],
  authors: [{ name: 'MediaSyndicate' }],
  creator: 'MediaSyndicate',
  publisher: 'MediaSyndicate',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mediasyndicate.online',
    siteName: 'MediaSyndicate',
    title: 'MediaSyndicate - Global News Aggregation',
    description: 'Real-time news aggregation from trusted sources worldwide',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@MediaSyndicate',
    creator: '@MediaSyndicate',
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}

