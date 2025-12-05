import { apiClient } from './apiClient';
import type { AuthResponse, User } from '../types';

export const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/api/auth/register', { name, email, password });
  return response.data;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/api/auth/login', { email, password });
  return response.data;
};

export const getProfile = async (): Promise<User> => {
  const response = await apiClient.get<{ user: User }>('/api/auth/me');
  return response.data.user;
};

export const getGoogleAuthUrl = async (): Promise<string> => {
  const response = await apiClient.get<{ url: string }>('/api/auth/google/url');
  return response.data.url;
};

export const completeGoogleSignup = async (payload: {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
}): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/api/auth/google/complete', payload);
  return response.data;
};
