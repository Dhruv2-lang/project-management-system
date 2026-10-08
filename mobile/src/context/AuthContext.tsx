import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError, setUnauthorizedHandler } from '../services/api';
import { authService } from '../services/authService';
import { tokenStorage } from '../services/tokenStorage';
import { User } from '../types';
import { SESSION_EXPIRED_MESSAGE } from '../utils/constants';

/**
 * loading         - checking the stored token at startup
 * authenticated   - valid session
 * unauthenticated - show Login / Register
 * offline         - token exists but the server could not be reached (token is kept)
 */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'offline';

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  sessionMessage: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  retryBootstrap: () => Promise<void>;
  clearSessionMessage: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  // Any 401 from the API client ends up here (token is already cleared by the client).
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setStatus('unauthenticated');
      setSessionMessage(SESSION_EXPIRED_MESSAGE);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const bootstrap = useCallback(async () => {
    setStatus('loading');
    const token = await tokenStorage.get();
    if (!token) {
      setStatus('unauthenticated');
      return;
    }
    try {
      const me = await authService.me();
      setUser(me);
      setStatus('authenticated');
    } catch (e) {
      if (e instanceof ApiError && e.kind === 'network') {
        setStatus('offline'); // can't validate; keep the token and let the user retry
      } else if (e instanceof ApiError && e.kind === 'session') {
        // handled by the unauthorized handler (token cleared + message set)
      } else {
        await tokenStorage.clear();
        setUser(null);
        setStatus('unauthenticated');
        setSessionMessage(SESSION_EXPIRED_MESSAGE);
      }
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { user: u, token } = await authService.login(email, password);
    await tokenStorage.set(token);
    setUser(u);
    setSessionMessage(null);
    setStatus('authenticated');
  }, []);

  const signUp = useCallback(async (fullName: string, email: string, password: string) => {
    const { user: u, token } = await authService.register(fullName, email, password);
    await tokenStorage.set(token);
    setUser(u);
    setSessionMessage(null);
    setStatus('authenticated');
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      /* logout is best-effort server-side; the local token is always removed below */
    }
    await tokenStorage.clear();
    setUser(null);
    setSessionMessage(null);
    setStatus('unauthenticated');
  }, []);

  const clearSessionMessage = useCallback(() => setSessionMessage(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, sessionMessage, signIn, signUp, signOut, retryBootstrap: bootstrap, clearSessionMessage }),
    [status, user, sessionMessage, signIn, signUp, signOut, bootstrap, clearSessionMessage],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
