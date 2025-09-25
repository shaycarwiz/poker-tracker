'use client';

import { useEffect } from 'react';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    // Initialize i18n only on the client side
    import('@/lib/i18n');
  }, []);

  return <>{children}</>;
}
