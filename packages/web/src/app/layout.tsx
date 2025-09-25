import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { UserPreferencesProvider } from '@/contexts/UserPreferencesContext';
import { I18nProvider } from '@/components/providers/I18nProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Poker Tracker',
  description:
    'A comprehensive poker tracking application with statistics and analytics',
  keywords: ['poker', 'tracking', 'statistics', 'analytics', 'gambling'],
  authors: [{ name: 'Poker Tracker Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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
            <UserPreferencesProvider>
              <SessionProvider>
                <div className="min-h-screen bg-gray-50">{children}</div>
              </SessionProvider>
            </UserPreferencesProvider>
          </LanguageProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
