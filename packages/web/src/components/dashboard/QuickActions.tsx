'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function QuickActions() {
  const actions = [
    {
      name: 'Start New Session',
      description: 'Begin tracking a new poker session',
      href: '/sessions/new',
      icon: '🎯',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'View All Sessions',
      description: 'See your complete session history',
      href: '/sessions',
      icon: '📊',
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      name: 'Update Bankroll',
      description: 'Add or adjust your current bankroll',
      href: '/settings',
      icon: '💰',
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      name: 'View Statistics',
      description: 'Analyze your poker performance',
      href: '/statistics',
      icon: '📈',
      color: 'bg-orange-600 hover:bg-orange-700',
    },
  ];

  return (
    <div className="rounded-lg bg-white shadow">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="mb-4 text-lg font-medium text-gray-900">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => (
            <Link key={action.name} href={action.href}>
              <div className="group relative">
                <div className="flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">{action.icon}</span>
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                      {action.name}
                    </h4>
                    <p className="mt-1 text-xs text-gray-500">
                      {action.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-gray-400 group-hover:text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
