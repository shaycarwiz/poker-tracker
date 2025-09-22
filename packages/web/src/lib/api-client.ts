import axios from 'axios';
import { getSession } from 'next-auth/react';
import type {
  ApiResponse,
  PaginatedResponse,
  Session,
  Statistics,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';



// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include backend auth token
apiClient.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.backendToken) {
      config.headers.Authorization = `Bearer ${session.backendToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/auth/signin';
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
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Session>> => {
    const response = await apiClient.get(`/sessions?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Session>> => {
    const response = await apiClient.get(`/sessions/${id}`);
    return response.data;
  },

  create: async (
    session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<Session>> => {
    const response = await apiClient.post('/sessions', session);
    return response.data;
  },

  update: async (
    id: string,
    session: Partial<Session>
  ): Promise<ApiResponse<Session>> => {
    const response = await apiClient.put(`/sessions/${id}`, session);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/sessions/${id}`);
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
