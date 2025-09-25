// Currency formatting utilities

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  decimalPlaces: number;
  locale: string;
}

export const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  ILS: {
    code: 'ILS',
    symbol: '₪',
    name: 'Israeli Shekel',
    decimalPlaces: 2,
    locale: 'he-IL',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimalPlaces: 2,
    locale: 'en-US',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimalPlaces: 2,
    locale: 'en-EU',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    decimalPlaces: 2,
    locale: 'en-GB',
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    decimalPlaces: 2,
    locale: 'en-CA',
  },
};

export const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_CONFIGS);

export function getCurrencyConfig(currencyCode: string): CurrencyConfig {
  const config = CURRENCY_CONFIGS[currencyCode];
  if (!config) {
    console.warn(`Unsupported currency: ${currencyCode}. Falling back to USD.`);
    return CURRENCY_CONFIGS.USD;
  }
  return config;
}

export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  options: {
    showSymbol?: boolean;
    showCode?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  const {
    showSymbol = true,
    showCode = false,
    minimumFractionDigits,
    maximumFractionDigits,
  } = options;

  const config = getCurrencyConfig(currencyCode);

  const formatOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: minimumFractionDigits ?? config.decimalPlaces,
    maximumFractionDigits: maximumFractionDigits ?? config.decimalPlaces,
  };

  // If we don't want to show the symbol, use decimal style instead
  if (!showSymbol) {
    formatOptions.style = 'decimal';
    delete formatOptions.currency;
  }

  const formatter = new Intl.NumberFormat(config.locale, formatOptions);
  let formatted = formatter.format(amount);

  // If we want to show the code instead of symbol
  if (showCode && !showSymbol) {
    formatted = `${formatted} ${currencyCode}`;
  }

  return formatted;
}

export function formatCurrencyCompact(
  amount: number,
  currencyCode: string = 'USD'
): string {
  const config = getCurrencyConfig(currencyCode);

  const formatter = new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currencyCode,
    notation: 'compact',
    maximumFractionDigits: 1,
  });

  return formatter.format(amount);
}

export function parseCurrencyAmount(
  value: string,
  currencyCode: string = 'USD'
): number {
  // Remove currency symbols and whitespace
  const cleanValue = value.replace(/[^\d.,-]/g, '');

  // Handle different decimal separators
  const normalizedValue = cleanValue.replace(',', '.');

  const amount = parseFloat(normalizedValue);

  if (isNaN(amount)) {
    return 0;
  }

  return amount;
}

export function validateCurrencyAmount(
  amount: number,
  currencyCode: string = 'USD'
): { isValid: boolean; error?: string } {
  const config = getCurrencyConfig(currencyCode);

  if (isNaN(amount)) {
    return { isValid: false, error: 'Invalid amount' };
  }

  if (amount < 0) {
    return { isValid: false, error: 'Amount cannot be negative' };
  }

  // Check if amount has too many decimal places
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  if (decimalPlaces > config.decimalPlaces) {
    return {
      isValid: false,
      error: `Amount cannot have more than ${config.decimalPlaces} decimal places`,
    };
  }

  return { isValid: true };
}

export function getCurrencySymbol(currencyCode: string): string {
  const config = getCurrencyConfig(currencyCode);
  return config.symbol;
}

export function getCurrencyName(currencyCode: string): string {
  const config = getCurrencyConfig(currencyCode);
  return config.name;
}

// Hook for using currency formatting in React components
export function useCurrencyFormatting(defaultCurrency: string = 'USD') {
  return {
    formatCurrency: (
      amount: number,
      currencyCode?: string,
      options?: Parameters<typeof formatCurrency>[2]
    ) => formatCurrency(amount, currencyCode || defaultCurrency, options),
    formatCurrencyCompact: (amount: number, currencyCode?: string) =>
      formatCurrencyCompact(amount, currencyCode || defaultCurrency),
    parseCurrencyAmount: (value: string, currencyCode?: string) =>
      parseCurrencyAmount(value, currencyCode || defaultCurrency),
    validateCurrencyAmount: (amount: number, currencyCode?: string) =>
      validateCurrencyAmount(amount, currencyCode || defaultCurrency),
    getCurrencySymbol: (currencyCode?: string) =>
      getCurrencySymbol(currencyCode || defaultCurrency),
    getCurrencyName: (currencyCode?: string) =>
      getCurrencyName(currencyCode || defaultCurrency),
  };
}
