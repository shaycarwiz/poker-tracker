'use client';
import { useState, useEffect } from 'react';

const stats = [
  { name: 'Sessions Tracked', value: '1,000+' },
  { name: 'Total Hours', value: '5,000+' },
  { name: 'Win Rate', value: '65%' },
  { name: 'Profit/Loss', value: '+$25,000' },
];

export function Stats() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-primary-600 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Trusted by poker players worldwide
            </h2>
            <p className="mt-4 text-lg leading-8 text-primary-100">
              Join thousands of players who trust Poker Tracker to improve their game.
            </p>
          </div>
          <dl className="mt-16 grid grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.name}
                className={`flex flex-col-reverse transform transition-all duration-700 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <dt className="text-base leading-7 text-primary-100">{stat.name}</dt>
                <dd className="text-2xl font-bold leading-9 tracking-tight text-white">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
