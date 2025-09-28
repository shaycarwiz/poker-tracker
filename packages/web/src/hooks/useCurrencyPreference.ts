import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { SUPPORTED_CURRENCIES } from '@/lib/currency';

/**
 * Hook to get the user's default currency preference
 * @param fallbackCurrency - Currency to use if no preference is set (defaults to 'USD')
 * @returns The user's default currency or fallback currency
 */
export function useCurrencyPreference(
  fallbackCurrency: string = 'USD'
): string {
  const { preferences, isLoading } = useUserPreferences();

  // If preferences are still loading, return fallback
  if (isLoading) {
    return fallbackCurrency;
  }

  // If user has a default currency preference, use it
  if (preferences?.defaultCurrency) {
    // Validate that the preferred currency is supported
    if (SUPPORTED_CURRENCIES.includes(preferences.defaultCurrency)) {
      return preferences.defaultCurrency;
    }
    // If preferred currency is not supported, log warning and use fallback
    console.warn(
      `User's preferred currency '${preferences.defaultCurrency}' is not supported. Using fallback '${fallbackCurrency}'.`
    );
  }

  return fallbackCurrency;
}

/**
 * Hook to get currency-related utilities with user's default currency
 * @param fallbackCurrency - Currency to use if no preference is set (defaults to 'USD')
 * @returns Object with currency utilities and the default currency
 */
export function useCurrencyPreferenceWithUtils(
  fallbackCurrency: string = 'USD'
) {
  const defaultCurrency = useCurrencyPreference(fallbackCurrency);
  const { preferences, isLoading } = useUserPreferences();

  return {
    defaultCurrency,
    isLoading,
    hasPreference: !!preferences?.defaultCurrency,
    supportedCurrencies: SUPPORTED_CURRENCIES,
  };
}
