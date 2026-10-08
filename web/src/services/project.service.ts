import { api } from './api';
import type { ApiList, ApiSuccess, Project, ProjectInput, ProjectListParams } from '../types';

export const projectService = {
  async list(params: ProjectListParams = {}): Promise<Project[]> {
    const { data } = await api.get<ApiList<Project>>('/projects', { params });
    return data.data;
  },

  async get(id: string): Promise<Project> {
    const { data } = await api.get<ApiSuccess<Project>>(`/projects/${id}`);
    return data.data;
  },

  async create(input: ProjectInput): Promise<Project> {
    const { data } = await api.post<ApiSuccess<Project>>('/projects', input);
    return data.data;
  },

  async update(id: string, input: ProjectInput): Promise<Project> {
    const { data } = await api.put<ApiSuccess<Project>>(`/projects/${id}`, input);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },
};
