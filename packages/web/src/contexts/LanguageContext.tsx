'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem(
      'poker-tracker-language'
    ) as SupportedLanguage;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'he')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Save language to localStorage and update document direction
  const setLanguage = (newLanguage: SupportedLanguage) => {
    setLanguageState(newLanguage);
    localStorage.setItem('poker-tracker-language', newLanguage);

    // Update document direction for RTL support
    document.documentElement.dir = newLanguage === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLanguage;
  };

  // Update document direction when language changes
  useEffect(() => {
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

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
