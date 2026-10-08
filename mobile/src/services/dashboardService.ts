import { ApiSuccess, DashboardStats } from '../types';
import { api, unwrap } from './api';

export const dashboardService = {
  async get(): Promise<DashboardStats> {
    const res = await api.get<ApiSuccess<DashboardStats>>('/dashboard');
    return unwrap(res.data);
  },
};
