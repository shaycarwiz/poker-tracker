import { useCallback } from 'react';
import {
  getErrorMessageWithFallback,
  SupportedLanguage,
} from '@/lib/error-codes';

/**
 * Hook for handling API errors with localization
 */
export function useErrorHandler(language: SupportedLanguage = 'en') {
  const handleError = useCallback(
    (error: any): string => {
      // Handle different error response formats
      if (error?.code) {
        return getErrorMessageWithFallback(error.code, language);
      }

      if (error?.error && typeof error.error === 'string') {
        // Check if it's an error code (uppercase with underscores)
        if (error.error.match(/^[A-Z_]+$/)) {
          return getErrorMessageWithFallback(error.error, language);
        }
        // Otherwise treat as a message
        return error.error;
      }

      if (error?.message) {
        return error.message;
      }

      if (typeof error === 'string') {
        return error;
      }

      // Fallback for unknown error format
      return getErrorMessageWithFallback('SYSTEM_UNKNOWN_ERROR', language);
    },
    [language]
  );

  const handleApiError = useCallback(
    (response: any): string => {
      if (response?.success === false) {
        return handleError(response);
      }

      return getErrorMessageWithFallback('SYSTEM_UNKNOWN_ERROR', language);
    },
    [handleError, language]
  );

  return {
    handleError,
    handleApiError,
  };
}
