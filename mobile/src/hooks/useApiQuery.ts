import { DependencyList, useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getErrorMessage } from '../services/api';

/**
 * Fetches data from the API (the only source of truth) with loading,
 * pull-to-refresh and error state. Stale responses are discarded when the
 * dependencies (filters) change quickly.
 */
export function useApiQuery<T>(fetcher: () => Promise<T>, deps: DependencyList) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestId = useRef(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const hasData = useRef(false);

  const run = useCallback(async (mode: 'initial' | 'refresh' | 'silent') => {
    const id = ++requestId.current;
    if (mode === 'initial' && !hasData.current) setLoading(true);
    if (mode === 'refresh') setRefreshing(true);
    try {
      const result = await fetcherRef.current();
      if (id !== requestId.current) return;
      hasData.current = true;
      setData(result);
      setError(null);
    } catch (e) {
      if (id !== requestId.current) return;
      setError(getErrorMessage(e));
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { run('initial'); }, deps);

  // Re-fetch when the screen regains focus (e.g. after saving in a form screen).
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      run('silent');
    }, [run]),
  );

  return {
    data,
    loading,
    refreshing,
    error,
    retry: useCallback(() => { hasData.current = false; return run('initial'); }, [run]),
    refresh: useCallback(() => run('refresh'), [run]),
    reload: useCallback(() => run('silent'), [run]),
  };
}
