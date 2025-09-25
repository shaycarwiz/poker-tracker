import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { I18nProvider } from '@/components/providers/I18nProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Poker Tracker',
  description:
    'A comprehensive poker tracking application with statistics and analytics',
  keywords: ['poker', 'tracking', 'statistics', 'analytics', 'gambling'],
  authors: [{ name: 'Poker Tracker Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <I18nProvider>
          <LanguageProvider>
            <SessionProvider>
              <div className="min-h-screen bg-gray-50">{children}</div>
            </SessionProvider>
          </LanguageProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
