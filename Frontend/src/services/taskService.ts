import { apiClient } from './apiClient';
import type { Task } from '../types';
const API_URL = '/api/tasks';

const getTasks = async (): Promise<Task[]> => {
  const response = await apiClient.get<Task[]>(API_URL);
  return response.data;
};

const createTask = async (title: string): Promise<Task> => {
  const response = await apiClient.post<Task>(API_URL, { title });
  return response.data;
};

const updateTask = async (id: string, updatedData: Partial<Task>): Promise<Task> => {
  const response = await apiClient.put<Task>(`${API_URL}/${id}`, updatedData);
  return response.data;
};

const deleteTask = async (id: string): Promise<string> => {
  await apiClient.delete(`${API_URL}/${id}`);
  return id;
};

const taskService = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};

export default taskService;
