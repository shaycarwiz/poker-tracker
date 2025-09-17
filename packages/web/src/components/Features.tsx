import {
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentChartBarIcon,
  TrophyIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Session Tracking',
    description: 'Record every poker session with detailed information about stakes, duration, and outcomes.',
    icon: ClockIcon,
  },
  {
    name: 'Performance Analytics',
    description: 'Analyze your performance with comprehensive statistics and visualizations.',
    icon: ChartBarIcon,
  },
  {
    name: 'Profit Tracking',
    description: 'Monitor your winnings and losses across different games and time periods.',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Detailed Reports',
    description: 'Generate detailed reports to understand your strengths and areas for improvement.',
    icon: DocumentChartBarIcon,
  },
  {
    name: 'Achievement System',
    description: 'Track milestones and achievements to stay motivated in your poker journey.',
    icon: TrophyIcon,
  },
  {
    name: 'Multi-Player Support',
    description: 'Track multiple players and compare performance across different accounts.',
    icon: UserGroupIcon,
  },
];

export function Features() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary-600">Everything you need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Comprehensive poker tracking
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Track every aspect of your poker game with our comprehensive suite of tools designed for serious players.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <feature.icon className="h-5 w-5 flex-none text-primary-600" aria-hidden="true" />
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
