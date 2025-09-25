'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QuickActions } from './QuickActions';
import { StatsCards } from './StatsCards';
import { RecentSessions } from './RecentSessions';
import { PerformanceCharts } from './PerformanceCharts';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { playerApi, sessionApi } from '@/lib/api-client';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useLanguage } from '@/contexts/LanguageContext';

interface PlayerData {
  id: string;
  name: string;
  email?: string;
  bankroll: {
    amount: number;
    currency: string;
  };
  totalSessions: number;
  totalWinnings: {
    amount: number;
    currency: string;
  };
  winRate: number;
  createdAt: string;
  updatedAt: string;
}

interface PlayerStats {
  playerId: string;
  totalSessions: number;
  totalWinnings: number;
  winRate: number;
  averageSession: number;
}

interface Session {
  sessionId: string;
  playerId: string;
  location: string;
  stakes: {
    smallBlind: number;
    bigBlind: number;
    currency: string;
  };
  initialBuyIn: {
    amount: number;
    currency: string;
  };
  currentCashOut?: {
    amount: number;
    currency: string;
  };
  profitLoss: {
    amount: number;
    currency: string;
  };
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  transactions: any[];
  startedAt: string;
  endedAt?: string;
  duration?: number;
}

export function DashboardContent() {
  const { t } = useTranslation();
  const { playerData, playerStats, sessions, loading, error } =
    useDashboardData();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('dashboard.title', { name: playerData?.name || 'Player' })}
        </h1>
        <p className="mt-2 text-gray-600">{t('dashboard.subtitle')}</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <QuickActions />
      </div>

      {/* Basic Stats Cards */}
      <div className="mb-8">
        <StatsCards playerData={playerData} playerStats={playerStats} />
      </div>

      {/* Recent Sessions */}
      <div className="mb-8">
        <RecentSessions sessions={sessions} />
      </div>

      {/* Performance Charts */}
      <div className="mb-8">
        <PerformanceCharts sessions={sessions} playerStats={playerStats} />
      </div>

      {/* Quick Link to Detailed Statistics */}
      <div className="mb-8">
        <div className="rounded-lg bg-blue-50 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="text-2xl">📊</div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-blue-900">
                Want more detailed statistics?
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                View comprehensive performance metrics, monthly breakdowns, and
                detailed analytics.
              </p>
              <div className="mt-3">
                <a
                  href="/statistics"
                  className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  View Detailed Statistics
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const fetchMe = async () => {
  return await playerApi.getMe();
};

const useDashboardData = () => {
  const { data: session } = useSession();
  const { language } = useLanguage();
  const { handleError, handleApiError } = useErrorHandler(language);
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.backendToken) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [playerDataResponse, playerStatsResponse, sessionsResponse] =
          await Promise.all([
            fetchMe(),
            playerApi.getStats(),
            sessionApi.getAll(1, 10),
          ]);

        if (playerDataResponse.success) {
          setPlayerData(playerDataResponse.data);
        } else {
          setError(handleApiError(playerDataResponse));
          return;
        }

        if (playerStatsResponse.success) {
          setPlayerStats(playerStatsResponse.data);
        } else {
          setError(handleApiError(playerStatsResponse));
          return;
        }

        if (sessionsResponse.success) {
          setSessions(sessionsResponse.data.sessions || []);
        } else {
          setError(handleApiError(sessionsResponse));
          return;
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(handleError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session?.backendToken]);

  return { playerData, playerStats, sessions, loading, error };
};
