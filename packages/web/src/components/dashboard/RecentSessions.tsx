'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useCurrencyFormatting } from '@/lib/currency';
import type { Session } from '@/types';

interface RecentSessionsProps {
  sessions: Session[];
}

export function RecentSessions({ sessions }: RecentSessionsProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { preferences } = useUserPreferences();
  const { formatCurrency } = useCurrencyFormatting(
    preferences?.defaultCurrency || 'ILS'
  );

  const locale = language === 'he' ? 'he-IL' : 'en-US';

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  const getProfitColor = (amount: number) => {
    if (amount > 0) return 'text-green-600';
    if (amount < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="rounded-lg bg-white shadow">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {t('dashboard.recentSessions')}
          </h3>
          <Link
            href="/sessions"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            {t('dashboard.viewAll')}
          </Link>
        </div>
        <div className="mt-6">
          {sessions.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mb-4 text-4xl text-gray-400">🎯</div>
              <p className="text-sm text-gray-500">
                {t('dashboard.noSessionsYet')}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {t('dashboard.startFirstSessionPrompt')}
              </p>
            </div>
          ) : (
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {sessions.map((session) => (
                  <li key={session.sessionId} className="py-5">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                          <span className="text-sm font-medium text-gray-600">
                            {session.stakes.smallBlind}/
                            {session.stakes.bigBlind}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="truncate text-sm font-medium text-gray-900">
                              {session.location}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(session.startedAt)}
                              {session.duration &&
                                ` • ${formatDuration(session.duration)}`}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                                session.status
                              )}`}
                            >
                              {getStatusLabel(session.status)}
                            </span>
                            <span
                              className={`text-sm font-medium ${getProfitColor(
                                session.profitLoss?.amount ?? 0
                              )}`}
                            >
                              {formatCurrency(
                                session.profitLoss?.amount ?? 0,
                                session.profitLoss?.currency ??
                                  preferences?.defaultCurrency ??
                                  'ILS'
                              )}
                            </span>
                          </div>
                        </div>
                        {session.notes && (
                          <p className="mt-1 truncate text-sm text-gray-500">
                            {session.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
