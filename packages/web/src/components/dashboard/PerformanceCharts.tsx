'use client';

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
  playerStats,
}: PerformanceChartsProps) {
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Calculate running profit/loss for the last 10 sessions
  const calculateRunningProfit = () => {
    const recentSessions = sessions.slice(0, 10).reverse();
    let runningTotal = 0;
    return recentSessions.map((session) => {
      runningTotal += session.profitLoss.amount;
      return {
        date: new Date(session.startedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        profit: runningTotal,
      };
    });
  };

  const runningProfit = calculateRunningProfit();

  // Calculate win rate by stakes
  const calculateWinRateByStakes = () => {
    const stakesMap = new Map<string, { wins: number; total: number }>();

    sessions.forEach((session) => {
      const stakesKey = `${session.stakes.smallBlind}/${session.stakes.bigBlind}`;
      const current = stakesMap.get(stakesKey) || { wins: 0, total: 0 };
      current.total += 1;
      if (session.profitLoss.amount > 0) {
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
      {/* Profit/Loss Trend */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            Profit/Loss Trend
          </h3>
          {runningProfit.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mb-4 text-4xl text-gray-400">📈</div>
              <p className="text-sm text-gray-500">No data to display</p>
              <p className="mt-1 text-xs text-gray-400">
                Complete some sessions to see your trend
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Last {runningProfit.length} sessions
                </div>
                <div className="text-sm font-medium text-gray-900">
                  Current:{' '}
                  {formatCurrency(
                    runningProfit[runningProfit.length - 1]?.profit || 0
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

      {/* Win Rate by Stakes */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            Win Rate by Stakes
          </h3>
          {winRateByStakes.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mb-4 text-4xl text-gray-400">🎯</div>
              <p className="text-sm text-gray-500">No data to display</p>
              <p className="mt-1 text-xs text-gray-400">
                Play different stakes to see your performance
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
                      ({stakes.sessions} sessions)
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
