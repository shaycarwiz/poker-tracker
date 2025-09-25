import { TokenManager } from '../token-manager';
import { getSession, signOut } from 'next-auth/react';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  getSession: jest.fn(),
  signOut: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('TokenManager', () => {
  let tokenManager: TokenManager;

  beforeEach(() => {
    tokenManager = TokenManager.getInstance();
    jest.clearAllMocks();
  });

  describe('getValidToken', () => {
    it('should return token when session exists and token is not near expiry', async () => {
      const mockSession = {
        backendToken: 'valid-token',
        tokenExpiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes from now
      };

      mockGetSession.mockResolvedValue(mockSession as any);

      const result = await tokenManager.getValidToken();

      expect(result).toBe('valid-token');
      expect(mockGetSession).toHaveBeenCalledTimes(1);
    });

    it('should return null when no session exists', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await tokenManager.getValidToken();

      expect(result).toBeNull();
    });

    it('should return null when no backend token exists', async () => {
      const mockSession = {
        backendToken: null,
        tokenExpiresAt: Date.now() + 10 * 60 * 1000,
      };

      mockGetSession.mockResolvedValue(mockSession as any);

      const result = await tokenManager.getValidToken();

      expect(result).toBeNull();
    });

    it('should refresh token when near expiry', async () => {
      const mockSession = {
        backendToken: 'expiring-token',
        refreshToken: 'refresh-token',
        tokenExpiresAt: Date.now() + 2 * 60 * 1000, // 2 minutes from now (near expiry)
      };

      const mockRefreshResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 900,
      };

      mockGetSession.mockResolvedValue(mockSession as any);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRefreshResponse),
      } as Response);

      const result = await tokenManager.getValidToken();

      expect(result).toBe('new-access-token');
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: 'refresh-token',
        }),
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockSession = {
        refreshToken: 'valid-refresh-token',
      };

      const mockRefreshResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 900,
      };

      mockGetSession.mockResolvedValue(mockSession as any);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRefreshResponse),
      } as Response);

      const result = await tokenManager.refreshToken();

      expect(result).toBe('new-access-token');
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: 'valid-refresh-token',
        }),
      });
    });

    it('should handle refresh failure and redirect to login', async () => {
      const mockSession = {
        refreshToken: 'invalid-refresh-token',
      };

      mockGetSession.mockResolvedValue(mockSession as any);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
      } as Response);

      const result = await tokenManager.refreshToken();

      expect(result).toBeNull();
      expect(mockSignOut).toHaveBeenCalledWith({
        redirect: true,
        callbackUrl: '/auth/signin',
      });
    });

    it('should handle concurrent refresh requests', async () => {
      const mockSession = {
        refreshToken: 'valid-refresh-token',
      };

      const mockRefreshResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 900,
      };

      mockGetSession.mockResolvedValue(mockSession as any);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRefreshResponse),
      } as Response);

      // Start multiple refresh requests simultaneously
      const promises = [
        tokenManager.refreshToken(),
        tokenManager.refreshToken(),
        tokenManager.refreshToken(),
      ];

      const results = await Promise.all(promises);

      // All should return the same token
      expect(results).toEqual([
        'new-access-token',
        'new-access-token',
        'new-access-token',
      ]);

      // Fetch should only be called once due to the singleton pattern
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearTokens', () => {
    it('should call signOut', async () => {
      await tokenManager.clearTokens();

      expect(mockSignOut).toHaveBeenCalledWith({ redirect: false });
    });
  });
});
