'use client';

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

interface StatsCardsProps {
  playerData: PlayerData | null;
  playerStats: PlayerStats | null;
}

export function StatsCards({ playerData, playerStats }: StatsCardsProps) {
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const stats = [
    {
      name: 'Current Bankroll',
      value: playerData
        ? formatCurrency(
            playerData.bankroll.amount,
            playerData.bankroll.currency
          )
        : '$0.00',
      change: '+0%',
      changeType: 'neutral' as const,
      icon: '💰',
    },
    {
      name: 'Total Sessions',
      value: playerStats?.totalSessions.toString() || '0',
      change: '+0',
      changeType: 'neutral' as const,
      icon: '🎯',
    },
    {
      name: 'Net Profit/Loss',
      value: playerStats
        ? formatCurrency(playerStats.totalWinnings, 'USD')
        : '$0.00',
      change: playerStats && playerStats.totalWinnings > 0 ? '+$0' : '-$0',
      changeType:
        playerStats && playerStats.totalWinnings >= 0
          ? 'positive'
          : ('negative' as const),
      icon: '📈',
    },
    {
      name: 'Win Rate',
      value: playerStats ? formatPercentage(playerStats.winRate) : '0.0%',
      change: '+0%',
      changeType: 'neutral' as const,
      icon: '🏆',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <div className="ml-4 w-0 flex-1">
              <dl>
                <dt className="truncate text-sm font-medium text-gray-500">
                  {stat.name}
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </div>
                  <div
                    className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.changeType === 'positive'
                        ? 'text-green-600'
                        : stat.changeType === 'negative'
                          ? 'text-red-600'
                          : 'text-gray-500'
                    }`}
                  >
                    {stat.change}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
