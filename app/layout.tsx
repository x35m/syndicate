import type { ReactNode } from 'react';
import { initCron } from '@/lib/cron';

if (typeof window === 'undefined') {
  initCron();
}

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}

