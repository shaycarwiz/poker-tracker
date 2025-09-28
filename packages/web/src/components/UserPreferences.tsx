'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  SUPPORTED_CURRENCIES,
  getCurrencyName,
  getCurrencySymbol,
} from '@/lib/currency';

interface UserPreferencesProps {
  className?: string;
}

interface Preferences {
  preferredLanguage: string;
  defaultCurrency: string;
}

const SUPPORTED_LANGUAGES = [
  { code: 'he', name: 'Hebrew (עברית)' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'fr', name: 'French (Français)' },
];

// Use centralized currency configuration
const CURRENCY_OPTIONS = SUPPORTED_CURRENCIES.map((code) => ({
  code,
  name: `${getCurrencyName(code)} (${getCurrencySymbol(code)})`,
}));

export function UserPreferences({ className = '' }: UserPreferencesProps) {
  const { t } = useTranslation();
  const {
    preferences,
    isLoading,
    error: contextError,
    updatePreferences,
  } = useUserPreferences();
  const [localPreferences, setLocalPreferences] = useState<Preferences>({
    preferredLanguage: 'he',
    defaultCurrency: 'ILS',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Update local preferences when context preferences change
  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const handleLanguageChange = (newLanguage: string) => {
    setLocalPreferences((prev) => ({
      ...prev,
      preferredLanguage: newLanguage,
    }));
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setLocalPreferences((prev) => ({
      ...prev,
      defaultCurrency: newCurrency,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);

      await updatePreferences({
        preferredLanguage: localPreferences.preferredLanguage,
        defaultCurrency: localPreferences.defaultCurrency,
      });

      setSuccess(true);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save preferences:', err);
      setError(t('preferences.error'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {t('preferences.title')}
        </h2>
      </div>

      {(error || contextError) && (
        <ErrorMessage
          message={error || contextError || t('preferences.error')}
        />
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                {t('preferences.saved')}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Language Selection */}
        <div>
          <label
            htmlFor="language"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            {t('preferences.language')}
          </label>
          <select
            id="language"
            value={localPreferences.preferredLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            {t('preferences.selectLanguage')}
          </p>
        </div>

        {/* Currency Selection */}
        <div>
          <label
            htmlFor="currency"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            {t('preferences.currency')}
          </label>
          <select
            id="currency"
            value={localPreferences.defaultCurrency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            {CURRENCY_OPTIONS.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            {t('preferences.selectCurrency')}
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="px-6 py-2">
          {isSaving ? (
            <div className="flex items-center">
              <LoadingSpinner size="sm" className="mr-2" />
              {t('preferences.loading')}
            </div>
          ) : (
            t('preferences.save')
          )}
        </Button>
      </div>
    </div>
  );
}
