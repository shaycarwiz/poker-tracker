'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserPreferences } from '@/components/UserPreferences';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white shadow">
            <UserPreferences className="p-6" />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
