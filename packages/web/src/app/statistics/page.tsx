'use client';

import { Header } from '@/components/Header';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { StatsDashboard } from '@/components/dashboard/StatsDashboard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { playerApi, statisticsApi } from '@/lib/api-client';

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

export default function StatisticsPage() {
  const { data: session } = useSession();
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.backendToken) return;

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
  }, [session?.backendToken]);

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
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Performance Statistics
            </h1>
            <p className="mt-2 text-gray-600">
              Detailed analysis of your poker performance and trends
            </p>
          </div>

          {/* Statistics Dashboard */}
          <StatsDashboard />
        </div>
      </main>
    </ProtectedRoute>
  );
}
