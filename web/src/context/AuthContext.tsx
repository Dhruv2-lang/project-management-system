import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService } from '../services/auth.service';
import { setUnauthorizedHandler } from '../services/api';
import { clearToken, getToken, setToken } from '../utils/tokenStorage';
import { isUnauthorized } from '../utils/errors';
import { useToast } from './ToastContext';
import type { LoginInput, RegisterInput, User } from '../types';

/**
 * loading         - checking a stored token with GET /auth/me
 * authenticated   - token is valid, `user` is set
 * unauthenticated - no token, or the server rejected it
 * error           - the server could not be reached; the token is kept so the user can retry
 */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  retry: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() => (getToken() ? 'loading' : 'unauthenticated'));

  // Any 401 on a protected call (expired/invalid token) ends the session here.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setStatus('unauthenticated');
      toast.error('Your session has expired. Please sign in again.');
    });
    return () => setUnauthorizedHandler(null);
  }, [toast]);

  const validateSession = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setStatus('unauthenticated');
      return;
    }
    setStatus('loading');
    try {
      setUser(await authService.me());
      setStatus('authenticated');
    } catch (err) {
      if (isUnauthorized(err)) {
        // The interceptor has already cleared the token and notified the user.
        clearToken();
        setUser(null);
        setStatus('unauthenticated');
      } else {
        setStatus('error');
      }
    }
  }, []);

  // On startup, validate any stored token with GET /auth/me.
  useEffect(() => {
    void validateSession();
  }, [validateSession]);

  const login = useCallback(async (input: LoginInput) => {
    const { user: nextUser, token } = await authService.login(input);
    setToken(token);
    setUser(nextUser);
    setStatus('authenticated');
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const { user: nextUser, token } = await authService.register(input);
    setToken(token);
    setUser(nextUser);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Logout is client-side anyway (JWTs are stateless), so a failed call must not trap the user.
    } finally {
      clearToken();
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, register, logout, retry: () => void validateSession() }),
    [user, status, login, register, logout, validateSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
