'use client';

import { useEffect, useState } from 'react';
import { initializeI18n } from '@/lib/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize i18n with default language first
    initializeI18n('en');
    setIsInitialized(true);
  }, []);

  // Don't render children until i18n is initialized
  if (!isInitialized) {
    return null;
  }

  return <>{children}</>;
}
