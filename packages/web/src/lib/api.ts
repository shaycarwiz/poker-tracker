import axios from 'axios';
import type {
  ApiResponse,
  PaginatedResponse,
  Session,
  Statistics,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export const sessionApi = {
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Session>> => {
    const response = await api.get(`/api/sessions?page=${page}&limit=${limit}`);

    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Session>> => {
    const response = await api.get(`/api/sessions/${id}`);

    return response.data;
  },

  create: async (
    session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<Session>> => {
    const response = await api.post('/api/sessions', session);

    return response.data;
  },

  update: async (
    id: string,
    session: Partial<Session>
  ): Promise<ApiResponse<Session>> => {
    const response = await api.put(`/api/sessions/${id}`, session);

    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/sessions/${id}`);

    return response.data;
  },
};

export const statisticsApi = {
  getOverall: async (): Promise<ApiResponse<Statistics>> => {
    const response = await api.get('/api/statistics/overall');

    return response.data;
  },

  getMonthly: async (
    year: number
  ): Promise<ApiResponse<Statistics['monthlyStats']>> => {
    const response = await api.get(`/api/statistics/monthly?year=${year}`);

    return response.data;
  },
};

export default api;
