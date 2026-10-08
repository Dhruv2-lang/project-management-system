import { ApiSuccess, Project, ProjectFilters, ProjectInput } from '../types';
import { api, unwrap } from './api';

export const projectService = {
  async list(filters: ProjectFilters = {}): Promise<Project[]> {
    const params: Record<string, string> = {};
    if (filters.search?.trim()) params.search = filters.search.trim();
    if (filters.status) params.status = filters.status;
    const res = await api.get<ApiSuccess<Project[]>>('/projects', { params });
    return unwrap(res.data);
  },

  async get(id: string): Promise<Project> {
    const res = await api.get<ApiSuccess<Project>>(`/projects/${id}`);
    return unwrap(res.data);
  },

  async create(input: ProjectInput): Promise<Project> {
    const res = await api.post<ApiSuccess<Project>>('/projects', input);
    return unwrap(res.data);
  },

  async update(id: string, input: ProjectInput): Promise<Project> {
    const res = await api.put<ApiSuccess<Project>>(`/projects/${id}`, input);
    return unwrap(res.data);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },
};
