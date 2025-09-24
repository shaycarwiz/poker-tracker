'use client';

import { useEffect, useState } from 'react';
import { playerApi, statisticsApi } from '@/lib/api-client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

interface PlayerStats {
  playerId: string;
  totalSessions: number;
  totalWinnings: number;
  winRate: number;
  averageSession: number;
}

interface OverallStats {
  totalSessions: number;
  totalHours: number;
  totalProfit: number;
  winRate: number;
  averageSessionDuration: number;
  averageProfit: number;
  bestSession: any;
  worstSession: any;
  monthlyStats: any[];
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
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch both player stats and overall statistics in parallel
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
          err instanceof Error ? err.message : 'Failed to load statistics'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
        <ErrorMessage message="No statistics available" />
      </div>
    );
  }

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Helper function to safely get values from either stats type
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
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Sessions" value={getTotalSessions()} icon="🎯" />

        <StatCard
          title="Win Rate"
          value={formatPercentage(getWinRate())}
          icon="📈"
          trend={
            getWinRate() > 0.5 ? 'up' : getWinRate() < 0.3 ? 'down' : 'neutral'
          }
        />

        <StatCard
          title="Total Profit/Loss"
          value={formatCurrency(getTotalProfit())}
          icon="💰"
          trend={getTotalProfit() > 0 ? 'up' : 'down'}
        />

        <StatCard
          title="Total Hours"
          value={getTotalHours() ? formatDuration(getTotalHours() * 60) : '0h'}
          icon="⏱️"
        />
      </div>

      {/* Additional Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Average Session Duration"
          value={
            getAverageSessionDuration()
              ? formatDuration(getAverageSessionDuration())
              : 'N/A'
          }
          icon="⏰"
        />

        <StatCard
          title="Average Profit per Session"
          value={formatCurrency(getAverageProfit())}
          icon="📊"
          trend={getAverageProfit() > 0 ? 'up' : 'down'}
        />

        <StatCard
          title="Average Session Value"
          value={formatCurrency(getAverageSession())}
          icon="🎲"
        />
      </div>

      {/* Best/Worst Session Info */}
      {(getBestSession() || getWorstSession()) && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {getBestSession() && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="mb-2 text-lg font-medium text-green-800">
                🏆 Best Session
              </h3>
              <p className="text-green-700">
                {formatCurrency(getBestSession().profitLoss?.amount || 0)}
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
                📉 Worst Session
              </h3>
              <p className="text-red-700">
                {formatCurrency(getWorstSession().profitLoss?.amount || 0)}
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

      {/* Monthly Stats Preview */}
      {getMonthlyStats().length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            📅 Recent Monthly Performance
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {getMonthlyStats()
              .slice(0, 6)
              .map((month: any, index: number) => (
                <div key={index} className="rounded-lg border p-3">
                  <h4 className="font-medium text-gray-900">{month.month}</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sessions:</span>
                      <span className="font-medium">{month.sessions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Profit:</span>
                      <span
                        className={`font-medium ${month.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {formatCurrency(month.profit)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Win Rate:</span>
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
