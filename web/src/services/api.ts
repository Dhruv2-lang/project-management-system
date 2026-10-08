import axios from 'axios';
import { clearToken, getToken } from '../utils/tokenStorage';

// Single place that reads the API base URL. Configure it with VITE_API_URL (see .env.example).
const baseURL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

if (!baseURL) {
  console.error('VITE_API_URL is not set. Copy web/.env.example to web/.env and restart the dev server.');
}

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

/** The auth context registers a callback here so a 401 anywhere ends the session in one place. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

// A 401 from these means "wrong credentials", not "session ended".
const CREDENTIAL_ENDPOINTS = ['/auth/login', '/auth/register'];

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? '';
      const isCredentialCall = CREDENTIAL_ENDPOINTS.some((path) => url.includes(path));
      // Only react when a token was actually in use, so parallel 401s end the session once.
      if (!isCredentialCall && getToken()) {
        clearToken();
        unauthorizedHandler?.();
      }
    }
    return Promise.reject(error);
  },
);
