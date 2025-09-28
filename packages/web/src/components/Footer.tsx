'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

const getNavigation = (t: (key: string) => string) => ({
  main: [
    { name: t('navigation.dashboard'), href: '/dashboard' },
    { name: t('navigation.sessions'), href: '/sessions' },
    { name: t('navigation.statistics'), href: '/statistics' },
    { name: t('navigation.settings'), href: '/settings' },
  ],
  support: [
    { name: t('landing.footer.support.helpCenter'), href: '/help' },
    { name: t('landing.footer.support.documentation'), href: '/docs' },
    { name: t('landing.footer.support.contact'), href: '/contact' },
  ],
  legal: [
    { name: t('landing.footer.legal.privacyPolicy'), href: '/privacy' },
    { name: t('landing.footer.legal.termsOfService'), href: '/terms' },
    { name: t('landing.footer.legal.cookiePolicy'), href: '/cookies' },
  ],
});

export function Footer() {
  const { t } = useTranslation();
  const navigation = getNavigation(t);

  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Main Navigation */}
          <div>
            <h3 className="text-sm font-semibold leading-6 text-gray-900">
              {t('landing.footer.navigation')}
            </h3>
            <ul className="mt-6 space-y-4">
              {navigation.main.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm leading-6 text-gray-600 hover:text-gray-900"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold leading-6 text-gray-900">
              {t('landing.footer.support.title')}
            </h3>
            <ul className="mt-6 space-y-4">
              {navigation.support.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm leading-6 text-gray-600 hover:text-gray-900"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold leading-6 text-gray-900">
              {t('landing.footer.legal.title')}
            </h3>
            <ul className="mt-6 space-y-4">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm leading-6 text-gray-600 hover:text-gray-900"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-center text-xs leading-5 text-gray-500">
            {t('landing.footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
