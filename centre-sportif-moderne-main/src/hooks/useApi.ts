import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface ApiResponse<T> {
  data: T;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      setData(response.data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Une erreur est survenue';
      setError(message);
      toast({
        title: 'Erreur',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

interface UseMutationResult<T, P> {
  mutate: (params: P) => Promise<T | null>;
  loading: boolean;
  error: string | null;
}

export function useMutation<T, P>(
  apiCall: (params: P) => Promise<ApiResponse<T>>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
    successMessage?: string;
  }
): UseMutationResult<T, P> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (params: P): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall(params);
      
      if (options?.successMessage) {
        toast({
          title: 'Succès',
          description: options.successMessage,
        });
      }
      
      options?.onSuccess?.(response.data);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Une erreur est survenue';
      setError(message);
      
      toast({
        title: 'Erreur',
        description: message,
        variant: 'destructive',
      });
      
      options?.onError?.(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}
