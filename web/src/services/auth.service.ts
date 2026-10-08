import { api } from './api';
import type { ApiSuccess, AuthPayload, LoginInput, RegisterInput, User } from '../types';

export const authService = {
  async register(input: RegisterInput): Promise<AuthPayload> {
    const { data } = await api.post<ApiSuccess<AuthPayload>>('/auth/register', input);
    return data.data;
  },

  async login(input: LoginInput): Promise<AuthPayload> {
    const { data } = await api.post<ApiSuccess<AuthPayload>>('/auth/login', input);
    return data.data;
  },

  /** Validates the stored token and returns the current user. */
  async me(): Promise<User> {
    const { data } = await api.get<ApiSuccess<{ user: User }>>('/auth/me');
    return data.data.user;
  },

  /** The server keeps no session; the client must also discard its token. */
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
};
