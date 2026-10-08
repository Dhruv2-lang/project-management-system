import axios from 'axios';
import type { ApiErrorBody } from '../types';

function errorBody(err: unknown): Partial<ApiErrorBody> | undefined {
  if (!axios.isAxiosError(err)) return undefined;
  const data: unknown = err.response?.data;
  return data && typeof data === 'object' ? (data as Partial<ApiErrorBody>) : undefined;
}

export function isUnauthorized(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 401;
}

/** Turns any thrown value into a message that is safe and useful to show the user. */
export function getErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return err.code === 'ECONNABORTED'
        ? 'The request timed out. Please try again.'
        : 'Unable to reach the server. Check your connection and try again.';
    }
    const message = errorBody(err)?.message;
    if (message) return message;
    if (err.response.status === 429) return 'Too many requests. Please wait a moment and try again.';
    if (err.response.status >= 500) return 'The server ran into a problem. Please try again later.';
  }
  return fallback;
}

/** Maps the backend's 422 `errors: [{ field, message }]` list to `{ field: message }` for inline display. */
export function getFieldErrors(err: unknown): Record<string, string> {
  const result: Record<string, string> = {};
  const errors = errorBody(err)?.errors;
  if (Array.isArray(errors)) {
    for (const item of errors) {
      if (item?.field && item.message && !(item.field in result)) result[item.field] = item.message;
    }
  }
  return result;
}
