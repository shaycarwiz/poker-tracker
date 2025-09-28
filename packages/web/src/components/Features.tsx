'use client';

import {
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentChartBarIcon,
  TrophyIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const getFeatures = (t: (key: string) => string) => [
  {
    name: t('landing.features.sessionTracking.name'),
    description: t('landing.features.sessionTracking.description'),
    icon: ClockIcon,
  },
  {
    name: t('landing.features.performanceAnalytics.name'),
    description: t('landing.features.performanceAnalytics.description'),
    icon: ChartBarIcon,
  },
  {
    name: t('landing.features.profitTracking.name'),
    description: t('landing.features.profitTracking.description'),
    icon: CurrencyDollarIcon,
  },
  {
    name: t('landing.features.detailedReports.name'),
    description: t('landing.features.detailedReports.description'),
    icon: DocumentChartBarIcon,
  },
  {
    name: t('landing.features.achievementSystem.name'),
    description: t('landing.features.achievementSystem.description'),
    icon: TrophyIcon,
  },
  {
    name: t('landing.features.multiPlayerSupport.name'),
    description: t('landing.features.multiPlayerSupport.description'),
    icon: UserGroupIcon,
  },
];

export function Features() {
  const { t } = useTranslation();
  const features = getFeatures(t);

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary-600">
            {t('landing.features.subtitle')}
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t('landing.features.title')}
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            {t('landing.features.description')}
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <feature.icon
                    className="h-5 w-5 flex-none text-primary-600"
                    aria-hidden="true"
                  />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
