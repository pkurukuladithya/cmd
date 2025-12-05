import { apiClient } from './apiClient';
import type { User } from '../types';

export const fetchUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<User[]>('/api/users');
  return response.data;
};

export const updateUser = async (
  id: string,
  updates: Partial<Pick<User, 'name' | 'role'>>
): Promise<User> => {
  const response = await apiClient.patch<User>(`/api/users/${id}`, updates);
  return response.data;
};
