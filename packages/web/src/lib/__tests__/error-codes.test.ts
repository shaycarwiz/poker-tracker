import {
  getErrorMessage,
  getErrorMessageWithFallback,
  isValidErrorCode,
} from '../error-codes';

describe('Error Codes', () => {
  describe('getErrorMessage', () => {
    it('should return English error message for valid error code', () => {
      const message = getErrorMessage('AUTH_INVALID_TOKEN', 'en');
      expect(message).toBe('Invalid or expired token');
    });

    it('should return Hebrew error message for valid error code', () => {
      const message = getErrorMessage('AUTH_INVALID_TOKEN', 'he');
      expect(message).toBe('אסימון לא תקין או פג תוקף');
    });

    it('should return fallback message for invalid error code', () => {
      const message = getErrorMessage('INVALID_CODE', 'en');
      expect(message).toBe('An unknown error occurred');
    });

    it('should default to English when no language specified', () => {
      const message = getErrorMessage('AUTH_INVALID_TOKEN');
      expect(message).toBe('Invalid or expired token');
    });
  });

  describe('getErrorMessageWithFallback', () => {
    it('should return Hebrew message for valid error code', () => {
      const message = getErrorMessageWithFallback('AUTH_INVALID_TOKEN', 'he');
      expect(message).toBe('אסימון לא תקין או פג תוקף');
    });

    it('should fallback to Hebrew unknown error for invalid error code in Hebrew', () => {
      const message = getErrorMessageWithFallback('INVALID_CODE', 'he');
      expect(message).toBe('אירעה שגיאה לא ידועה');
    });

    it('should return system unknown error for completely invalid code', () => {
      const message = getErrorMessageWithFallback('COMPLETELY_INVALID', 'he');
      expect(message).toBe('אירעה שגיאה לא ידועה');
    });
  });

  describe('isValidErrorCode', () => {
    it('should return true for valid error codes', () => {
      expect(isValidErrorCode('AUTH_INVALID_TOKEN')).toBe(true);
      expect(isValidErrorCode('VALIDATION_NAME_REQUIRED')).toBe(true);
      expect(isValidErrorCode('BUSINESS_SESSION_NOT_FOUND')).toBe(true);
    });

    it('should return false for invalid error codes', () => {
      expect(isValidErrorCode('INVALID_CODE')).toBe(false);
      expect(isValidErrorCode('')).toBe(false);
      expect(isValidErrorCode('random_string')).toBe(false);
    });
  });

  describe('Error message coverage', () => {
    it('should have Hebrew translations for all English error codes', () => {
      const { ERROR_MESSAGES } = require('../error-codes');
      const englishCodes = Object.keys(ERROR_MESSAGES.en);
      const hebrewCodes = Object.keys(ERROR_MESSAGES.he);

      // All English codes should have Hebrew translations
      englishCodes.forEach((code) => {
        expect(hebrewCodes).toContain(code);
      });

      // All Hebrew codes should have English translations
      hebrewCodes.forEach((code) => {
        expect(englishCodes).toContain(code);
      });
    });
  });
});
