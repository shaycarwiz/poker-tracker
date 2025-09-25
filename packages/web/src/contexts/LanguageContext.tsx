'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SupportedLanguage } from '@/lib/error-codes';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: React.ReactNode;
  defaultLanguage?: SupportedLanguage;
}

export function LanguageProvider({
  children,
  defaultLanguage = 'en',
}: LanguageProviderProps) {
  const [language, setLanguageState] =
    useState<SupportedLanguage>(defaultLanguage);
  const [isClient, setIsClient] = useState(false);

  // Only use useTranslation on the client side
  const { i18n } = useTranslation();

  // Track if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load language from i18n on mount (client side only)
  useEffect(() => {
    if (isClient && i18n) {
      const currentLanguage = i18n.language as SupportedLanguage;
      if (
        currentLanguage &&
        (currentLanguage === 'en' || currentLanguage === 'he')
      ) {
        setLanguageState(currentLanguage);
      }
    }
  }, [i18n, isClient]);

  // Listen for language changes from i18n and update our state
  useEffect(() => {
    if (isClient && i18n) {
      const handleLanguageChange = (lng: string) => {
        const newLanguage = lng as SupportedLanguage;
        if (newLanguage === 'en' || newLanguage === 'he') {
          setLanguageState(newLanguage);
        }
      };

      i18n.on('languageChanged', handleLanguageChange);

      return () => {
        i18n.off('languageChanged', handleLanguageChange);
      };
    }
  }, [i18n, isClient]);

  // Save language to i18n and update document direction
  const setLanguage = (newLanguage: SupportedLanguage) => {
    setLanguageState(newLanguage);

    if (isClient && i18n) {
      i18n.changeLanguage(newLanguage);
    }

    // Update document direction for RTL support (client side only)
    if (typeof document !== 'undefined') {
      document.documentElement.dir = newLanguage === 'he' ? 'rtl' : 'ltr';
      document.documentElement.lang = newLanguage;
    }
  };

  // Update document direction when language changes (client side only)
  useEffect(() => {
    if (isClient && typeof document !== 'undefined') {
      document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }, [language, isClient]);

  const isRTL = language === 'he';

  const value = {
    language,
    setLanguage,
    isRTL,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
