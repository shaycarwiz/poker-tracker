import { AxiosError } from 'axios';
import { signOut } from 'next-auth/react';

export interface AuthError {
  code: string;
  message: string;
  status: number;
}

export class AuthErrorHandler {
  static handleAuthError(error: AxiosError): AuthError {
    // Handle network errors (no response) first
    if (!error.response) {
      return {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
        status: 500,
      };
    }

    const status = error.response.status;
    const errorData = error.response.data as any;

    let code = 'UNKNOWN_ERROR';
    let message = 'An unexpected error occurred';

    switch (status) {
      case 401:
        if (errorData?.code === 'TOKEN_EXPIRED') {
          code = 'TOKEN_EXPIRED';
          message = 'Your session has expired. Please sign in again.';
        } else if (errorData?.code === 'MISSING_TOKEN') {
          code = 'MISSING_TOKEN';
          message = 'Authentication required. Please sign in.';
        } else {
          code = 'UNAUTHORIZED';
          message = 'You are not authorized to perform this action.';
        }
        break;
      case 403:
        code = 'FORBIDDEN';
        message =
          'Access denied. You do not have permission to perform this action.';
        break;
      case 404:
        code = 'NOT_FOUND';
        message = 'The requested resource was not found.';
        break;
      case 429:
        code = 'RATE_LIMITED';
        message = 'Too many requests. Please try again later.';
        break;
      case 500:
        code = 'SERVER_ERROR';
        message = 'A server error occurred. Please try again later.';
        break;
      default:
        if (errorData?.message) {
          message = errorData.message;
        } else if (errorData?.error) {
          message = errorData.error;
        }
    }

    return {
      code,
      message,
      status,
    };
  }

  static async handleTokenRefreshFailure(error: AuthError): Promise<void> {
    console.error('Token refresh failed:', error);

    // Clear any stored tokens and redirect to login
    await signOut({
      redirect: true,
      callbackUrl: '/auth/signin?error=session_expired',
    });
  }

  static shouldRetryRequest(error: AxiosError): boolean {
    const status = error.response?.status;

    // Retry on network errors or 5xx server errors
    if (!status) {
      return true; // Network error
    }

    if (status >= 500 && status < 600) {
      return true; // Server error
    }

    if (status === 429) {
      return true; // Rate limited
    }

    return false;
  }

  static getRetryDelay(attempt: number): number {
    // Exponential backoff with jitter
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const jitter = Math.random() * 1000; // Add up to 1 second of jitter

    const delay = Math.min(baseDelay * Math.pow(2, attempt) + jitter, maxDelay);

    return delay;
  }

  static isAuthError(error: any): error is AxiosError {
    return (
      error?.isAxiosError === true &&
      error?.response?.status >= 400 &&
      error?.response?.status < 500
    );
  }

  static isTokenExpiredError(error: AxiosError): boolean {
    const errorData = error.response?.data as any;
    return (
      error.response?.status === 401 && errorData?.code === 'TOKEN_EXPIRED'
    );
  }

  static isRefreshTokenExpiredError(error: AxiosError): boolean {
    const errorData = error.response?.data as any;
    return (
      (error.response?.status === 401 &&
        (errorData?.code === 'INVALID_REFRESH_TOKEN' ||
          errorData?.message?.includes('refresh token'))) ||
      false
    );
  }
}

export const authErrorHandler = AuthErrorHandler;
