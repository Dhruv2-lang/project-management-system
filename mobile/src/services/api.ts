import axios, { AxiosError, AxiosInstance } from 'axios';
import { API_URL, REQUEST_TIMEOUT_MS } from '../config';
import { ApiErrorBody, ApiSuccess } from '../types';
import {
  GENERIC_ERROR_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  SESSION_EXPIRED_MESSAGE,
} from '../utils/constants';
import { tokenStorage } from './tokenStorage';

export type ApiErrorKind = 'network' | 'session' | 'validation' | 'rate_limit' | 'server' | 'client';

/** The only error type UI code ever sees - never a raw AxiosError. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly fieldErrors: Record<string, string>;

  constructor(
    kind: ApiErrorKind,
    message: string,
    status?: number,
    fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/** Auth endpoints where a 401 means "wrong credentials", not "expired session". */
const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register'];

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

/** AuthContext registers itself here so a 401 anywhere logs the user out. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

function isPublicAuthRequest(url: string | undefined): boolean {
  return !!url && PUBLIC_AUTH_PATHS.some((p) => url.startsWith(p));
}

api.interceptors.request.use(async (config) => {
  if (!isPublicAuthRequest(config.url)) {
    const token = await tokenStorage.get();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
  }
  return config;
});

function toApiError(error: AxiosError<ApiErrorBody>): ApiError {
  const response = error.response;

  // No response at all: offline, DNS failure, refused connection, timeout...
  if (!response) {
    return new ApiError('network', NETWORK_ERROR_MESSAGE);
  }

  const status = response.status;
  const body = response.data;
  const serverMessage =
    body && typeof body === 'object' && typeof body.message === 'string' ? body.message : undefined;

  const hadToken = !!error.config?.headers?.get?.('Authorization');
  if (status === 401 && hadToken && !isPublicAuthRequest(error.config?.url)) {
    return new ApiError('session', SESSION_EXPIRED_MESSAGE, status);
  }

  if (status === 422) {
    const fieldErrors: Record<string, string> = {};
    for (const e of body?.errors ?? []) {
      // Accept both "name" and nested paths like "body.name".
      const key = e.field?.split('.').pop();
      if (key && !fieldErrors[key]) fieldErrors[key] = e.message;
    }
    return new ApiError('validation', serverMessage ?? 'Please check the highlighted fields.', status, fieldErrors);
  }
  if (status === 429) {
    return new ApiError('rate_limit', 'Too many attempts. Please wait a few minutes and try again.', status);
  }
  if (status >= 500) {
    return new ApiError('server', 'The server ran into a problem. Please try again in a moment.', status);
  }
  return new ApiError('client', serverMessage ?? GENERIC_ERROR_MESSAGE, status);
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const apiError = toApiError(error);
    if (apiError.kind === 'session') {
      await tokenStorage.clear();
      unauthorizedHandler?.();
    }
    return Promise.reject(apiError);
  },
);

/** Unwraps the `{ success, data }` envelope. */
export function unwrap<T>(body: ApiSuccess<T>): T {
  return body.data;
}

/** Safe, user-presentable message for any thrown value. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return GENERIC_ERROR_MESSAGE;
}
