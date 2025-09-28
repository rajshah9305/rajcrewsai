'use client';

import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

interface UseApiOptions extends AxiosRequestConfig {
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: AxiosError | null;
  refetch: () => Promise<void>;
}

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    
    if (error.response?.status === 500) {
      // Handle server errors
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export function useApi<T = any>(
  endpoint: string,
  options: UseApiOptions = {}
): UseApiResult<T> {
  const { enabled = true, refetchInterval, ...axiosConfig } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<AxiosError | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient({
        url: endpoint,
        ...axiosConfig,
      });
      
      setData(response.data);
    } catch (err) {
      setError(err as AxiosError);
    } finally {
      setLoading(false);
    }
  }, [endpoint, enabled, axiosConfig]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up refetch interval if specified
  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    const interval = setInterval(() => {
      fetchData();
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [fetchData, refetchInterval, enabled]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

// Utility functions for common API operations
export const apiUtils = {
  // GET request
  get: async <T = any>(endpoint: string, config?: AxiosRequestConfig) => {
    const response = await apiClient.get<T>(endpoint, config);
    return response.data;
  },

  // POST request
  post: async <T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig) => {
    const response = await apiClient.post<T>(endpoint, data, config);
    return response.data;
  },

  // PUT request
  put: async <T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig) => {
    const response = await apiClient.put<T>(endpoint, data, config);
    return response.data;
  },

  // DELETE request
  delete: async <T = any>(endpoint: string, config?: AxiosRequestConfig) => {
    const response = await apiClient.delete<T>(endpoint, config);
    return response.data;
  },

  // PATCH request
  patch: async <T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig) => {
    const response = await apiClient.patch<T>(endpoint, data, config);
    return response.data;
  },
};

// Custom hook for paginated data
export function usePaginatedApi<T = any>(
  endpoint: string,
  options: UseApiOptions & { page?: number; limit?: number } = {}
) {
  const { page = 1, limit = 10, ...restOptions } = options;
  
  const paginatedEndpoint = `${endpoint}?page=${page}&limit=${limit}`;
  const result = useApi<T>(paginatedEndpoint, restOptions);
  
  return {
    ...result,
    page,
    limit,
  };
}

// Custom hook for mutation operations (POST, PUT, DELETE)
export function useMutation<T = any, V = any>(
  method: 'post' | 'put' | 'delete' | 'patch',
  endpoint: string
) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<AxiosError | null>(null);

  const mutate = async (data?: V, config?: AxiosRequestConfig): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient({
        method,
        url: endpoint,
        data,
        ...config,
      });
      
      return response.data;
    } catch (err) {
      setError(err as AxiosError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    mutate,
    loading,
    error,
  };
}