'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/Header';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useCurrencyFormatting } from '@/lib/currency';
import { sessionApi } from '@/lib/api-client';
import type { Session } from '@/types';

export default function SessionsPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { preferences } = useUserPreferences();
  const { formatCurrency } = useCurrencyFormatting(
    preferences?.defaultCurrency || 'ILS'
  );
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const locale = language === 'he' ? 'he-IL' : 'en-US';

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return t('sessions.status.active');
      case 'COMPLETED':
        return t('sessions.status.completed');
      case 'CANCELLED':
        return t('sessions.status.cancelled');
      default:
        return status;
    }
  };

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await sessionApi.getAll();

        if (response.success) {
          setSessions(response.data.sessions || []);
        } else {
          setError(t('sessions.loadError'));
        }
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError(
          err instanceof Error ? err.message : t('sessions.loadError')
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [t]);

  if (loading) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex min-h-screen items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex min-h-screen items-center justify-center">
            <ErrorMessage message={error} />
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('navigation.sessions')}
              </h1>
              <p className="mt-2 text-gray-600">{t('sessions.subtitle')}</p>
            </div>
            <Link
              href="/sessions/new"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {t('sessions.startNewSession')}
            </Link>
          </div>

          {sessions.length === 0 ? (
            <div className="rounded-lg bg-white shadow">
              <div className="px-4 py-12 text-center sm:px-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {t('sessions.noSessionsYet')}
                </h3>
                <p className="mt-2 text-gray-500">
                  {t('sessions.getStartedPrompt')}
                </p>
                <div className="mt-6">
                  <Link
                    href="/sessions/new"
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    {t('sessions.startFirstSession')}
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <Link
                  key={session.sessionId}
                  href={`/sessions/${session.sessionId}`}
                  className="block rounded-lg bg-white shadow transition-shadow hover:shadow-md"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {session.location}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {session.stakes.smallBlind}/{session.stakes.bigBlind}{' '}
                          {session.stakes.currency} • {t('sessions.started')}{' '}
                          {new Date(session.startedAt).toLocaleDateString(
                            locale
                          )}
                        </p>
                        {session.notes && (
                          <p className="mt-2 text-sm text-gray-600">
                            {session.notes}
                          </p>
                        )}
                      </div>
                      <div className="ml-4 text-right">
                        <span className="text-lg font-medium text-gray-900">
                          {formatCurrency(
                            session.initialBuyIn.amount,
                            session.initialBuyIn.currency
                          )}
                        </span>
                        <p className="text-sm text-gray-500">
                          {getStatusLabel(session.status)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
