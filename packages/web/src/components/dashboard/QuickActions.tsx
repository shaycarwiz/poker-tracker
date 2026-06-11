'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function QuickActions() {
  const { t } = useTranslation();

  const actions = [
    {
      id: 'startNewSession',
      name: t('dashboard.actions.startNewSession'),
      description: t('dashboard.actions.startNewSessionDescription'),
      href: '/sessions/new',
      icon: '🎯',
    },
    {
      id: 'viewAllSessions',
      name: t('dashboard.actions.viewAllSessions'),
      description: t('dashboard.actions.viewAllSessionsDescription'),
      href: '/sessions',
      icon: '📊',
    },
    {
      id: 'updateBankroll',
      name: t('dashboard.actions.updateBankroll'),
      description: t('dashboard.actions.updateBankrollDescription'),
      href: '/settings',
      icon: '💰',
    },
    {
      id: 'viewStatistics',
      name: t('dashboard.actions.viewStatistics'),
      description: t('dashboard.actions.viewStatisticsDescription'),
      href: '/statistics',
      icon: '📈',
    },
  ];

  return (
    <div className="rounded-lg bg-white shadow">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="mb-4 text-lg font-medium text-gray-900">
          {t('dashboard.quickActions')}
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => (
            <Link key={action.id} href={action.href}>
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
