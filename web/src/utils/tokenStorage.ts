// The JWT lives only in localStorage and is attached to requests by the API client.
// It is never rendered in the UI or written to logs.

const TOKEN_KEY = 'pms.token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage unavailable (e.g. private mode): the session simply will not persist */
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}
