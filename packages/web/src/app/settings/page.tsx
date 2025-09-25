'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/Header';
import { UserPreferences } from '@/components/UserPreferences';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('settings.title')}
            </h1>
            <p className="mt-2 text-gray-600">{t('settings.description')}</p>
          </div>
          <div className="rounded-lg bg-white shadow">
            <UserPreferences className="p-6" />
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
