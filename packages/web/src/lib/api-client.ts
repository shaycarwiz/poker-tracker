import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getSession } from 'next-auth/react';
import { tokenManager } from './token-manager';
import { authErrorHandler } from './auth-error-handler';
import type {
  ApiResponse,
  PaginatedResponse,
  Session,
  StartSessionRequest,
  StartSessionResponse,
  Statistics,
} from '@/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request queue for handling concurrent requests during token refresh
const requestQueue: Array<{
  resolve: (value: any) => void;
  reject: (error: any) => void;
  config: AxiosRequestConfig;
}> = [];

let isRefreshing = false;

// Add request interceptor to include backend auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Skip token addition for refresh endpoint to avoid infinite loops
    if (config.url?.includes('/auth/refresh')) {
      return config;
    }

    const token = await tokenManager.getValidToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for automatic token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh is in progress, queue the request
        return new Promise((resolve, reject) => {
          requestQueue.push({
            resolve,
            reject,
            config: originalRequest,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await tokenManager.refreshToken();

        if (newToken) {
          // Process queued requests
          requestQueue.forEach(({ resolve, config }) => {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(config));
          });
          requestQueue.length = 0;

          // Retry original request
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } else {
          // Refresh failed, handle error appropriately
          const authError = authErrorHandler.handleAuthError(error);
          await authErrorHandler.handleTokenRefreshFailure(authError);
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Clear queue and handle refresh failure
        const authError = authErrorHandler.handleAuthError(
          refreshError as AxiosError
        );
        requestQueue.forEach(({ reject }) => {
          reject(refreshError);
        });
        requestQueue.length = 0;
        await authErrorHandler.handleTokenRefreshFailure(authError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other types of errors
    if (authErrorHandler.isAuthError(error)) {
      const authError = authErrorHandler.handleAuthError(error);
      console.error('Authentication error:', authError);
    }

    return Promise.reject(error);
  }
);

// Player API
export const playerApi = {
  getMe: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/players/me');
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/players/me/stats');
    return response.data;
  },

  updateBankroll: async (amount: number): Promise<ApiResponse<any>> => {
    const response = await apiClient.patch('/players/me/bankroll', { amount });
    return response.data;
  },
};

// Session API
export const sessionApi = {
  getAll: async (page = 1, limit = 10): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(
      `/sessions?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Session>> => {
    const response = await apiClient.get(`/sessions/${id}`);
    return response.data;
  },

  start: async (
    sessionData: StartSessionRequest
  ): Promise<ApiResponse<StartSessionResponse>> => {
    const response = await apiClient.post('/sessions', sessionData);
    return response.data;
  },

  end: async (
    id: string,
    finalCashOut: { amount: number; currency?: string },
    notes?: string
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/sessions/${id}/end`, {
      finalCashOut,
      notes,
    });
    return response.data;
  },

  addTransaction: async (
    id: string,
    type: string,
    amount: { amount: number; currency?: string },
    description?: string
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/sessions/${id}/transactions`, {
      type,
      amount,
      notes: description,
    });
    return response.data;
  },

  updateNotes: async (id: string, notes: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.patch(`/sessions/${id}/notes`, { notes });
    return response.data;
  },

  cancel: async (id: string, reason?: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/sessions/${id}/cancel`, { reason });
    return response.data;
  },

  getPlayerSessions: async (playerId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/sessions/player/${playerId}`);
    return response.data;
  },

  getActiveSession: async (
    playerId: string
  ): Promise<ApiResponse<Session | null>> => {
    const response = await apiClient.get(`/sessions/player/${playerId}/active`);
    return response.data;
  },
};

// Statistics API
export const statisticsApi = {
  getOverall: async (): Promise<ApiResponse<Statistics>> => {
    const response = await apiClient.get('/statistics/overall');
    return response.data;
  },

  getMonthly: async (
    year: number
  ): Promise<ApiResponse<Statistics['monthlyStats']>> => {
    const response = await apiClient.get(`/statistics/monthly?year=${year}`);
    return response.data;
  },
};

export default apiClient;
