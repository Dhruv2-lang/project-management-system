import { ApiSuccess, AuthPayload, User } from '../types';
import { api, unwrap } from './api';

export const authService = {
  async register(fullName: string, email: string, password: string): Promise<AuthPayload> {
    const res = await api.post<ApiSuccess<AuthPayload>>('/auth/register', {
      fullName: fullName.trim(),
      email: email.trim(),
      password,
    });
    return unwrap(res.data);
  },

  async login(email: string, password: string): Promise<AuthPayload> {
    const res = await api.post<ApiSuccess<AuthPayload>>('/auth/login', {
      email: email.trim(),
      password,
    });
    return unwrap(res.data);
  },

  async me(): Promise<User> {
    const res = await api.get<ApiSuccess<{ user: User }>>('/auth/me');
    return unwrap(res.data).user;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
};
