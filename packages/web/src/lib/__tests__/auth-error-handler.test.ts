import { AuthErrorHandler, AuthError } from '../auth-error-handler';
import { AxiosError } from 'axios';
import { signOut } from 'next-auth/react';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
}));

const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;

describe('AuthErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleAuthError', () => {
    it('should handle TOKEN_EXPIRED error', () => {
      const error = {
        response: {
          status: 401,
          data: { code: 'TOKEN_EXPIRED' },
        },
      } as AxiosError;

      const result = AuthErrorHandler.handleAuthError(error);

      expect(result).toEqual({
        code: 'TOKEN_EXPIRED',
        message: 'Your session has expired. Please sign in again.',
        status: 401,
      });
    });

    it('should handle MISSING_TOKEN error', () => {
      const error = {
        response: {
          status: 401,
          data: { code: 'MISSING_TOKEN' },
        },
      } as AxiosError;

      const result = AuthErrorHandler.handleAuthError(error);

      expect(result).toEqual({
        code: 'MISSING_TOKEN',
        message: 'Authentication required. Please sign in.',
        status: 401,
      });
    });

    it('should handle FORBIDDEN error', () => {
      const error = {
        response: {
          status: 403,
          data: {},
        },
      } as AxiosError;

      const result = AuthErrorHandler.handleAuthError(error);

      expect(result).toEqual({
        code: 'FORBIDDEN',
        message:
          'Access denied. You do not have permission to perform this action.',
        status: 403,
      });
    });

    it('should handle NOT_FOUND error', () => {
      const error = {
        response: {
          status: 404,
          data: {},
        },
      } as AxiosError;

      const result = AuthErrorHandler.handleAuthError(error);

      expect(result).toEqual({
        code: 'NOT_FOUND',
        message: 'The requested resource was not found.',
        status: 404,
      });
    });

    it('should handle RATE_LIMITED error', () => {
      const error = {
        response: {
          status: 429,
          data: {},
        },
      } as AxiosError;

      const result = AuthErrorHandler.handleAuthError(error);

      expect(result).toEqual({
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please try again later.',
        status: 429,
      });
    });

    it('should handle SERVER_ERROR', () => {
      const error = {
        response: {
          status: 500,
          data: {},
        },
      } as AxiosError;

      const result = AuthErrorHandler.handleAuthError(error);

      expect(result).toEqual({
        code: 'SERVER_ERROR',
        message: 'A server error occurred. Please try again later.',
        status: 500,
      });
    });

    it('should handle error with custom message', () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Custom error message' },
        },
      } as AxiosError;

      const result = AuthErrorHandler.handleAuthError(error);

      expect(result.message).toBe('Custom error message');
    });

    it('should handle error with error field', () => {
      const error = {
        response: {
          status: 400,
          data: { error: 'Custom error' },
        },
      } as AxiosError;

      const result = AuthErrorHandler.handleAuthError(error);

      expect(result.message).toBe('Custom error');
    });

    it('should handle network error', () => {
      const error = {
        isAxiosError: true,
      } as AxiosError;

      const result = AuthErrorHandler.handleAuthError(error);

      expect(result).toEqual({
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
        status: 500,
      });
    });
  });

  describe('handleTokenRefreshFailure', () => {
    it('should call signOut with correct parameters', async () => {
      const authError: AuthError = {
        code: 'TOKEN_EXPIRED',
        message: 'Token expired',
        status: 401,
      };

      await AuthErrorHandler.handleTokenRefreshFailure(authError);

      expect(mockSignOut).toHaveBeenCalledWith({
        redirect: true,
        callbackUrl: '/auth/signin?error=session_expired',
      });
    });
  });

  describe('shouldRetryRequest', () => {
    it('should return true for network errors', () => {
      const error = {
        isAxiosError: true,
      } as AxiosError;

      const result = AuthErrorHandler.shouldRetryRequest(error);

      expect(result).toBe(true);
    });

    it('should return true for 5xx server errors', () => {
      const error = {
        response: { status: 500 },
      } as AxiosError;

      const result = AuthErrorHandler.shouldRetryRequest(error);

      expect(result).toBe(true);
    });

    it('should return true for rate limiting', () => {
      const error = {
        response: { status: 429 },
      } as AxiosError;

      const result = AuthErrorHandler.shouldRetryRequest(error);

      expect(result).toBe(true);
    });

    it('should return false for 4xx client errors', () => {
      const error = {
        response: { status: 400 },
      } as AxiosError;

      const result = AuthErrorHandler.shouldRetryRequest(error);

      expect(result).toBe(false);
    });
  });

  describe('getRetryDelay', () => {
    it('should return increasing delay for each attempt', () => {
      const delay1 = AuthErrorHandler.getRetryDelay(0);
      const delay2 = AuthErrorHandler.getRetryDelay(1);
      const delay3 = AuthErrorHandler.getRetryDelay(2);

      expect(delay2).toBeGreaterThan(delay1);
      expect(delay3).toBeGreaterThan(delay2);
    });

    it('should not exceed maximum delay', () => {
      const delay = AuthErrorHandler.getRetryDelay(100);

      expect(delay).toBeLessThanOrEqual(30000);
    });
  });

  describe('isAuthError', () => {
    it('should return true for axios errors with 4xx status', () => {
      const error = {
        isAxiosError: true,
        response: { status: 401 },
      } as AxiosError;

      const result = AuthErrorHandler.isAuthError(error);

      expect(result).toBe(true);
    });

    it('should return false for non-axios errors', () => {
      const error = new Error('Not an axios error');

      const result = AuthErrorHandler.isAuthError(error);

      expect(result).toBe(false);
    });

    it('should return false for axios errors with 5xx status', () => {
      const error = {
        isAxiosError: true,
        response: { status: 500 },
      } as AxiosError;

      const result = AuthErrorHandler.isAuthError(error);

      expect(result).toBe(false);
    });
  });

  describe('isTokenExpiredError', () => {
    it('should return true for token expired error', () => {
      const error = {
        response: {
          status: 401,
          data: { code: 'TOKEN_EXPIRED' },
        },
      } as AxiosError;

      const result = AuthErrorHandler.isTokenExpiredError(error);

      expect(result).toBe(true);
    });

    it('should return false for other 401 errors', () => {
      const error = {
        response: {
          status: 401,
          data: { code: 'INVALID_TOKEN' },
        },
      } as AxiosError;

      const result = AuthErrorHandler.isTokenExpiredError(error);

      expect(result).toBe(false);
    });
  });

  describe('isRefreshTokenExpiredError', () => {
    it('should return true for invalid refresh token error', () => {
      const error = {
        response: {
          status: 401,
          data: { code: 'INVALID_REFRESH_TOKEN' },
        },
      } as AxiosError;

      const result = AuthErrorHandler.isRefreshTokenExpiredError(error);

      expect(result).toBe(true);
    });

    it('should return true for refresh token message', () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Invalid refresh token' },
        },
      } as AxiosError;

      const result = AuthErrorHandler.isRefreshTokenExpiredError(error);

      expect(result).toBe(true);
    });

    it('should return false for other errors', () => {
      const error = {
        response: {
          status: 401,
          data: { code: 'TOKEN_EXPIRED' },
        },
      } as AxiosError;

      const result = AuthErrorHandler.isRefreshTokenExpiredError(error);

      expect(result).toBe(false);
    });
  });
});
