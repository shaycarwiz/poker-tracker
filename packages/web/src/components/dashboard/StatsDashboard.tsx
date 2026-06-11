'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { playerApi, statisticsApi } from '@/lib/api-client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useCurrencyFormatting } from '@/lib/currency';
import type { MonthlyStats, Session, Statistics } from '@/types';

interface PlayerStats {
  playerId: string;
  totalSessions: number;
  totalWinnings: number;
  winRate: number;
  averageSession: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

function StatCard({ title, value, subtitle, trend, icon }: StatCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {icon && <div className="text-2xl">{icon}</div>}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="truncate text-sm font-medium text-gray-500">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className={`text-2xl font-semibold ${getTrendColor()}`}>
                  {value}
                </div>
                {subtitle && (
                  <div className="ml-2 text-sm text-gray-500">{subtitle}</div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatsDashboard() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { preferences } = useUserPreferences();
  const { formatCurrency } = useCurrencyFormatting(
    preferences?.defaultCurrency || 'ILS'
  );
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [overallStats, setOverallStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const locale = language === 'he' ? 'he-IL' : 'en-US';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const [playerStatsResponse, overallStatsResponse] = await Promise.all([
          playerApi.getStats(),
          statisticsApi
            .getOverall()
            .catch(() => ({ success: false, data: null })),
        ]);

        if (playerStatsResponse.success) {
          setPlayerStats(playerStatsResponse.data);
        }

        if (overallStatsResponse.success) {
          setOverallStats(overallStatsResponse.data);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(
          err instanceof Error ? err.message : t('statistics.loadError')
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [t]);

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return t('sessions.durationHours', { hours, minutes: mins });
    }

    return t('sessions.durationMinutes', { minutes: mins });
  };

  const formatMonth = (monthStr: string) => {
    const parsed = monthStr.includes('-')
      ? new Date(`${monthStr}-01`)
      : new Date(monthStr);

    if (Number.isNaN(parsed.getTime())) {
      return monthStr;
    }

    return parsed.toLocaleDateString(locale, {
      month: 'long',
      year: 'numeric',
    });
  };

  const formatSessionCurrency = (session: Session) => {
    const amount = session.profitLoss?.amount || 0;
    const currency =
      session.profitLoss?.currency || preferences?.defaultCurrency || 'ILS';

    return formatCurrency(amount, currency);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!playerStats && !overallStats) {
    return (
      <div className="py-8">
        <ErrorMessage message={t('statistics.noDataAvailable')} />
      </div>
    );
  }

  const getTotalSessions = () =>
    overallStats?.totalSessions ?? playerStats?.totalSessions ?? 0;
  const getWinRate = () => overallStats?.winRate ?? playerStats?.winRate ?? 0;
  const getTotalProfit = () =>
    overallStats?.totalProfit ?? playerStats?.totalWinnings ?? 0;
  const getTotalHours = () => overallStats?.totalHours ?? 0;
  const getAverageSessionDuration = () =>
    overallStats?.averageSessionDuration ?? 0;
  const getAverageProfit = () => overallStats?.averageProfit ?? 0;
  const getAverageSession = () => playerStats?.averageSession ?? 0;
  const getBestSession = () => overallStats?.bestSession;
  const getWorstSession = () => overallStats?.worstSession;
  const getMonthlyStats = () => overallStats?.monthlyStats ?? [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('statistics.totalSessions')}
          value={getTotalSessions()}
          icon="🎯"
        />

        <StatCard
          title={t('statistics.winRate')}
          value={formatPercentage(getWinRate())}
          icon="📈"
          trend={
            getWinRate() > 0.5 ? 'up' : getWinRate() < 0.3 ? 'down' : 'neutral'
          }
        />

        <StatCard
          title={t('statistics.totalProfitLoss')}
          value={formatCurrency(getTotalProfit())}
          icon="💰"
          trend={getTotalProfit() > 0 ? 'up' : 'down'}
        />

        <StatCard
          title={t('statistics.totalHours')}
          value={
            getTotalHours()
              ? formatDuration(getTotalHours() * 60)
              : t('statistics.zeroHours')
          }
          icon="⏱️"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title={t('statistics.averageSessionDuration')}
          value={
            getAverageSessionDuration()
              ? formatDuration(getAverageSessionDuration())
              : t('statistics.notAvailable')
          }
          icon="⏰"
        />

        <StatCard
          title={t('statistics.averageProfitPerSession')}
          value={formatCurrency(getAverageProfit())}
          icon="📊"
          trend={getAverageProfit() > 0 ? 'up' : 'down'}
        />

        <StatCard
          title={t('statistics.averageSessionValue')}
          value={formatCurrency(getAverageSession())}
          icon="🎲"
        />
      </div>

      {(getBestSession() || getWorstSession()) && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {getBestSession() && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="mb-2 text-lg font-medium text-green-800">
                🏆 {t('statistics.bestSession')}
              </h3>
              <p className="text-green-700">
                {formatSessionCurrency(getBestSession())}
              </p>
              <p className="text-sm text-green-600">
                {getBestSession().location} •{' '}
                {getBestSession().stakes?.smallBlind}/
                {getBestSession().stakes?.bigBlind}
              </p>
            </div>
          )}

          {getWorstSession() && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="mb-2 text-lg font-medium text-red-800">
                📉 {t('statistics.worstSession')}
              </h3>
              <p className="text-red-700">
                {formatSessionCurrency(getWorstSession())}
              </p>
              <p className="text-sm text-red-600">
                {getWorstSession().location} •{' '}
                {getWorstSession().stakes?.smallBlind}/
                {getWorstSession().stakes?.bigBlind}
              </p>
            </div>
          )}
        </div>
      )}

      {getMonthlyStats().length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            📅 {t('statistics.recentMonthlyPerformance')}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {getMonthlyStats()
              .slice(0, 6)
              .map((month: MonthlyStats, index: number) => (
                <div key={index} className="rounded-lg border p-3">
                  <h4 className="font-medium text-gray-900">
                    {formatMonth(month.month)}
                  </h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        {t('statistics.sessionsLabel')}
                      </span>
                      <span className="font-medium">{month.sessions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        {t('statistics.profit')}
                      </span>
                      <span
                        className={`font-medium ${month.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {formatCurrency(month.profit)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        {t('statistics.winRateLabel')}
                      </span>
                      <span className="font-medium">
                        {formatPercentage(month.winRate)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
