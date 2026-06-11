'use client';

import { Header } from '@/components/Header';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { StatsDashboard } from '@/components/dashboard/StatsDashboard';
import { useTranslation } from 'react-i18next';

export default function StatisticsPage() {
  const { t } = useTranslation();

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('statistics.pageTitle')}
            </h1>
            <p className="mt-2 text-gray-600">{t('statistics.pageSubtitle')}</p>
          </div>

          <StatsDashboard />
        </div>
      </main>
    </ProtectedRoute>
  );
}
