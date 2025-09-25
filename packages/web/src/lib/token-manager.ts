import { getSession, signOut } from 'next-auth/react';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class TokenManager {
  private static instance: TokenManager;
  private refreshPromise: Promise<TokenPair> | null = null;
  private refreshThreshold = 5 * 60 * 1000; // 5 minutes before expiry

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  async getValidToken(): Promise<string | null> {
    try {
      const session = await getSession();

      if (!session?.backendToken) {
        return null;
      }

      // Check if token is close to expiry using the stored expiration time
      if (
        session.tokenExpiresAt &&
        this.isTokenNearExpiryByTimestamp(session.tokenExpiresAt)
      ) {
        return await this.refreshToken();
      }

      return session.backendToken;
    } catch (error) {
      console.error('Error getting valid token:', error);
      return null;
    }
  }

  private isTokenNearExpiry(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now();
      const exp = payload.exp * 1000;
      const timeUntilExpiry = exp - now;

      return timeUntilExpiry < this.refreshThreshold;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true; // Assume expired if we can't parse
    }
  }

  private isTokenNearExpiryByTimestamp(expiresAt: number): boolean {
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;
    return timeUntilExpiry < this.refreshThreshold;
  }

  async refreshToken(): Promise<string | null> {
    // If refresh is already in progress, wait for it
    if (this.refreshPromise) {
      const result = await this.refreshPromise;
      return result?.accessToken || null;
    }

    this.refreshPromise = this.performTokenRefresh();

    try {
      const result = await this.refreshPromise;
      return result?.accessToken || null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Redirect to login on refresh failure
      await signOut({ redirect: true, callbackUrl: '/auth/signin' });
      return null;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<TokenPair> {
    const session = await getSession();

    if (!session?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: session.refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data: RefreshTokenResponse = await response.json();

    // Update the session with new tokens
    // Note: This would require updating the NextAuth session
    // For now, we'll return the tokens and let the caller handle storage

    const now = Date.now();
    const expiresAt = now + data.expiresIn * 1000;

    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
      expiresAt,
    };
  }

  async clearTokens(): Promise<void> {
    await signOut({ redirect: false });
  }
}

export const tokenManager = TokenManager.getInstance();
