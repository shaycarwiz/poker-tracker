'use client';

import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useCurrencyFormatting } from '@/lib/currency';
import type { Session } from '@/types';

interface PlayerStats {
  playerId: string;
  totalSessions: number;
  totalWinnings: number;
  winRate: number;
  averageSession: number;
}

interface PerformanceChartsProps {
  sessions: Session[];
  playerStats: PlayerStats | null;
}

export function PerformanceCharts({
  sessions,
}: PerformanceChartsProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { preferences } = useUserPreferences();
  const { formatCurrency } = useCurrencyFormatting(
    preferences?.defaultCurrency || 'ILS'
  );

  const locale = language === 'he' ? 'he-IL' : 'en-US';
  const defaultCurrency = preferences?.defaultCurrency || 'ILS';

  const calculateRunningProfit = () => {
    const recentSessions = sessions.slice(0, 10).reverse();
    let runningTotal = 0;
    return recentSessions.map((session) => {
      runningTotal += session.profitLoss?.amount ?? 0;
      return {
        date: new Date(session.startedAt).toLocaleDateString(locale, {
          month: 'short',
          day: 'numeric',
        }),
        profit: runningTotal,
      };
    });
  };

  const runningProfit = calculateRunningProfit();

  const calculateWinRateByStakes = () => {
    const stakesMap = new Map<string, { wins: number; total: number }>();

    sessions.forEach((session) => {
      const stakesKey = `${session.stakes.smallBlind}/${session.stakes.bigBlind}`;
      const current = stakesMap.get(stakesKey) || { wins: 0, total: 0 };
      current.total += 1;
      if ((session.profitLoss?.amount ?? 0) > 0) {
        current.wins += 1;
      }
      stakesMap.set(stakesKey, current);
    });

    return Array.from(stakesMap.entries()).map(([stakes, data]) => ({
      stakes,
      winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
      sessions: data.total,
    }));
  };

  const winRateByStakes = calculateWinRateByStakes();

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            {t('dashboard.charts.profitLossTrend')}
          </h3>
          {runningProfit.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mb-4 text-4xl text-gray-400">📈</div>
              <p className="text-sm text-gray-500">
                {t('dashboard.charts.noDataToDisplay')}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {t('dashboard.charts.completeSessionsForTrend')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {t('dashboard.charts.lastNSessions', {
                    count: runningProfit.length,
                  })}
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {t('dashboard.charts.current')}{' '}
                  {formatCurrency(
                    runningProfit[runningProfit.length - 1]?.profit || 0,
                    defaultCurrency
                  )}
                </div>
              </div>
              <div className="flex h-32 items-end space-x-1">
                {runningProfit.map((point, index) => (
                  <div
                    key={index}
                    className="flex flex-1 flex-col items-center"
                  >
                    <div
                      className={`w-full rounded-t ${
                        point.profit >= 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{
                        height: `${Math.max(4, (Math.abs(point.profit) / Math.max(...runningProfit.map((p) => Math.abs(p.profit)))) * 100)}px`,
                      }}
                    />
                    <div className="mt-1 origin-left -rotate-45 transform text-xs text-gray-500">
                      {point.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            {t('dashboard.charts.winRateByStakes')}
          </h3>
          {winRateByStakes.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mb-4 text-4xl text-gray-400">🎯</div>
              <p className="text-sm text-gray-500">
                {t('dashboard.charts.noDataToDisplay')}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {t('dashboard.charts.playDifferentStakes')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {winRateByStakes.map((stakes, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-gray-900">
                      {stakes.stakes}
                    </div>
                    <div className="text-xs text-gray-500">
                      {t('dashboard.charts.sessionsCount', {
                        count: stakes.sessions,
                      })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-20 rounded-full bg-gray-200">
                      <div
                        className={`h-2 rounded-full ${
                          stakes.winRate >= 50 ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, stakes.winRate)}%` }}
                      />
                    </div>
                    <div className="w-12 text-right text-sm font-medium text-gray-900">
                      {stakes.winRate.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
