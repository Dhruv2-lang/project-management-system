import { api } from './api';
import type { ApiSuccess, DashboardStats } from '../types';

export const dashboardService = {
  async get(): Promise<DashboardStats> {
    const { data } = await api.get<ApiSuccess<DashboardStats>>('/dashboard');
    return data.data;
  },
};
