import { ApiSuccess, Task, TaskFilters, TaskInput } from '../types';
import { api, unwrap } from './api';

export const taskService = {
  async list(filters: TaskFilters = {}): Promise<Task[]> {
    const params: Record<string, string> = {};
    if (filters.search?.trim()) params.search = filters.search.trim();
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.projectId) params.projectId = filters.projectId;
    const res = await api.get<ApiSuccess<Task[]>>('/tasks', { params });
    return unwrap(res.data);
  },

  async get(id: string): Promise<Task> {
    const res = await api.get<ApiSuccess<Task>>(`/tasks/${id}`);
    return unwrap(res.data);
  },

  async create(input: TaskInput): Promise<Task> {
    const res = await api.post<ApiSuccess<Task>>('/tasks', input);
    return unwrap(res.data);
  },

  async update(id: string, input: TaskInput): Promise<Task> {
    const res = await api.put<ApiSuccess<Task>>(`/tasks/${id}`, input);
    return unwrap(res.data);
  },

  /** Convenience for the "mark complete" checkbox. */
  async setStatus(id: string, status: Task['status']): Promise<Task> {
    return taskService.update(id, { status });
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },
};
