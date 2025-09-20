'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { StatsCards } from './StatsCards';
import { RecentSessions } from './RecentSessions';
import { QuickActions } from './QuickActions';
import { PerformanceCharts } from './PerformanceCharts';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

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
  const { data: session } = useSession();
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.backendToken) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch player data and stats in parallel
        const [playerResponse, statsResponse, sessionsResponse] =
          await Promise.all([
            fetch('/api/players/me', {
              headers: {
                Authorization: `Bearer ${session.backendToken}`,
                'Content-Type': 'application/json',
              },
            }),
            fetch('/api/players/me/stats', {
              headers: {
                Authorization: `Bearer ${session.backendToken}`,
                'Content-Type': 'application/json',
              },
            }),
            fetch('/api/sessions/player/me', {
              headers: {
                Authorization: `Bearer ${session.backendToken}`,
                'Content-Type': 'application/json',
              },
            }),
          ]);

        if (!playerResponse.ok || !statsResponse.ok || !sessionsResponse.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const playerData = await playerResponse.json();
        const statsData = await statsResponse.json();
        const sessionsData = await sessionsResponse.json();

        if (playerData.success) {
          setPlayerData(playerData.data);
        }

        if (statsData.success) {
          setPlayerStats(statsData.data);
        }

        if (sessionsData.success) {
          // Get only the most recent 5 sessions
          setRecentSessions(sessionsData.data.sessions.slice(0, 5));
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load dashboard data'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session?.backendToken]);

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
          Welcome back, {playerData?.name || 'Player'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's your poker performance overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8">
        <StatsCards playerData={playerData} playerStats={playerStats} />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <QuickActions />
      </div>

      {/* Recent Sessions and Charts */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <RecentSessions sessions={recentSessions} />
        <PerformanceCharts
          sessions={recentSessions}
          playerStats={playerStats}
        />
      </div>
    </div>
  );
}
