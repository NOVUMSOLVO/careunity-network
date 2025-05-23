/**
 * Mobile API client instance
 */

import { ApiClient } from '@shared/api-client';
import { MobileApiAdapter } from '@shared/api-client/mobile-adapter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

// Function to get the auth token from AsyncStorage
const getAuthToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem('auth_token');
};

// Create the API adapter
const apiAdapter = new MobileApiAdapter(getAuthToken);

// Create the API client instance
export const apiClient = new ApiClient(apiAdapter, {
  baseUrl: API_URL,
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
  onUnauthorized: () => {
    // Handle unauthorized requests
    // This would typically navigate to the login screen
    console.log('[API] Unauthorized request');
  },
  onError: (error) => {
    console.error('[API] Error:', error);
  }
});

// Export API functions for different resources
export const authApi = {
  login: async (email: string, password: string) => {
    return apiClient.post('/api/auth/login', { email, password });
  },
  register: async (userData: any) => {
    return apiClient.post('/api/auth/register', userData);
  },
  logout: async () => {
    return apiClient.post('/api/auth/logout');
  },
  getCurrentUser: async () => {
    return apiClient.get('/api/auth/me');
  },
  updateProfile: async (userData: any) => {
    return apiClient.put('/api/auth/profile', userData);
  },
  resetPassword: async (email: string) => {
    return apiClient.post('/api/auth/reset-password', { email });
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiClient.post('/api/auth/change-password', { currentPassword, newPassword });
  },
  verifyEmail: async (email: string, code: string) => {
    return apiClient.post('/api/auth/verify-email', { email, code });
  },
  resendVerificationEmail: async (email: string) => {
    return apiClient.post('/api/auth/resend-verification', { email });
  },
    return apiClient.post('/api/auth/reset-password', { email });
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiClient.post('/api/auth/change-password', { currentPassword, newPassword });
  },
};

export const serviceUserApi = {
  getAll: async () => {
    return apiClient.get('/api/service-users');
  },
  getById: async (id: number) => {
    return apiClient.get(`/api/service-users/${id}`);
  },
  create: async (data: any) => {
    return apiClient.post('/api/service-users', data);
  },
  update: async (id: number, data: any) => {
    return apiClient.put(`/api/service-users/${id}`, data);
  },
  delete: async (id: number) => {
    return apiClient.delete(`/api/service-users/${id}`);
  },
};

export const carePlanApi = {
  getAll: async (serviceUserId?: number) => {
    const endpoint = serviceUserId 
      ? `/api/service-users/${serviceUserId}/care-plans` 
      : '/api/care-plans';
    return apiClient.get(endpoint);
  },
  getById: async (id: number) => {
    return apiClient.get(`/api/care-plans/${id}`);
  },
  create: async (data: any) => {
    return apiClient.post('/api/care-plans', data);
  },
  update: async (id: number, data: any) => {
    return apiClient.put(`/api/care-plans/${id}`, data);
  },
  delete: async (id: number) => {
    return apiClient.delete(`/api/care-plans/${id}`);
  },
};

export const visitApi = {
  getAll: async (params?: { date?: string, caregiverId?: number }) => {
    return apiClient.get('/api/visits', { params: params as any });
  },
  getById: async (id: number) => {
    return apiClient.get(`/api/visits/${id}`);
  },
  create: async (data: any) => {
    return apiClient.post('/api/visits', data);
  },
  update: async (id: number, data: any) => {
    return apiClient.put(`/api/visits/${id}`, data);
  },
  complete: async (id: number, data: any) => {
    return apiClient.post(`/api/visits/${id}/complete`, data);
  },
  cancel: async (id: number, reason: string) => {
    return apiClient.post(`/api/visits/${id}/cancel`, { reason });
  },
};
