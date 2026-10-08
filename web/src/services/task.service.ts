import { api } from './api';
import type { ApiList, ApiSuccess, Task, TaskInput, TaskListParams } from '../types';

export const taskService = {
  async list(params: TaskListParams = {}): Promise<Task[]> {
    const { data } = await api.get<ApiList<Task>>('/tasks', { params });
    return data.data;
  },

  async get(id: string): Promise<Task> {
    const { data } = await api.get<ApiSuccess<Task>>(`/tasks/${id}`);
    return data.data;
  },

  async create(input: TaskInput): Promise<Task> {
    const { data } = await api.post<ApiSuccess<Task>>('/tasks', input);
    return data.data;
  },

  async update(id: string, input: TaskInput): Promise<Task> {
    const { data } = await api.put<ApiSuccess<Task>>(`/tasks/${id}`, input);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },
};
