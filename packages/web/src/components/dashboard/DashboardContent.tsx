'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { QuickActions } from './QuickActions';
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

export function DashboardContent() {
  const { playerData, loading, error } = useDashboardData();

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

      {/* Quick Actions */}
      <div className="mb-8">
        <QuickActions />
      </div>
    </div>
  );
}

const fetchMe = async () => {
  const response = await fetch('/api/players/me');
  const data = await response.json();
  return data;
};

const useDashboardData = () => {
  const { data: session } = useSession();
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.backendToken) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch player data and stats in parallel
        const playerData = await fetchMe();

        if (playerData.success) {
          setPlayerData(playerData.data);
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
  return { playerData, loading, error };
};
