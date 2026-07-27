import { useState, useEffect, useCallback } from 'react';
import { apiCall } from '@/lib/api';

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useFetch<T = any>(
  method: string,
  path: string | null,
  requireAuth: boolean = false
): UseFetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!!path);
  const [error, setError] = useState<Error | null>(null);

  const executeFetch = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall<T>(method, path, undefined, requireAuth);
      setData(response);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [method, path, requireAuth]);

  useEffect(() => {
    executeFetch();
  }, [executeFetch]);

  return {
    data,
    loading,
    error,
    refetch: executeFetch,
  };
}
