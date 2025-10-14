import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { salesWindowsApi } from '../services/salesWindowsApi';
import { SalesWindow, SalesWindowStats } from '../types/sales-windows';

// Query keys
const QUERY_KEYS = {
  salesWindows: (filters?: any) => ['sales-windows', filters],
  salesWindow: (id: string) => ['sales-window', id],
  salesWindowsStats: () => ['sales-windows', 'stats']
};

/**
 * Hook to fetch all sales windows with optional filtering
 */
export function useSalesWindows(filters?: {
  status?: string;
  type?: string;
  page?: number;
  pageSize?: number;
  q?: string;
}) {
  return useQuery({
    queryKey: QUERY_KEYS.salesWindows(filters),
    queryFn: () => salesWindowsApi.getSalesWindows(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    refetchOnWindowFocus: true
  });
}

/**
 * Hook to fetch single sales window by ID
 */
export function useSalesWindow(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.salesWindow(id),
    queryFn: () => salesWindowsApi.getSalesWindow(id),
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });
}

/**
 * Hook to fetch sales windows statistics
 */
export function useSalesWindowsStats() {
  return useQuery({
    queryKey: QUERY_KEYS.salesWindowsStats(),
    queryFn: () => salesWindowsApi.getSalesWindowsStats(),
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2
  });
}

/**
 * Hook to create a new sales window
 */
export function useCreateSalesWindow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: salesWindowsApi.createSalesWindow,
    onSuccess: (data) => {
      // Invalidate and refetch sales windows list
      queryClient.invalidateQueries({ queryKey: ['sales-windows'] });
      toast.success(`Sales window "${data.name}" created successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create sales window');
    }
  });
}

/**
 * Hook to update a sales window
 */
export function useUpdateSalesWindow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SalesWindow> }) =>
      salesWindowsApi.updateSalesWindow(id, data),
    onSuccess: (data, variables) => {
      // Update cached data
      queryClient.setQueryData(QUERY_KEYS.salesWindow(variables.id), data);
      queryClient.invalidateQueries({ queryKey: ['sales-windows'] });
      toast.success(`Sales window "${data.name}" updated successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update sales window');
    }
  });
}

/**
 * Hook to open a sales window
 */
export function useOpenSalesWindow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: salesWindowsApi.openSalesWindow,
    onSuccess: (data) => {
      // Update cached data
      queryClient.setQueryData(QUERY_KEYS.salesWindow(data.id), data);
      queryClient.invalidateQueries({ queryKey: ['sales-windows'] });
      toast.success(`Sales window "${data.name}" is now OPEN and accepting orders!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to open sales window');
    }
  });
}

/**
 * Hook to close a sales window
 */
export function useCloseSalesWindow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: salesWindowsApi.closeSalesWindow,
    onSuccess: (data) => {
      // Update cached data
      queryClient.setQueryData(QUERY_KEYS.salesWindow(data.id), data);
      queryClient.invalidateQueries({ queryKey: ['sales-windows'] });
      toast.success(`Sales window "${data.name}" has been closed`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to close sales window');
    }
  });
}

/**
 * Hook to duplicate a sales window
 */
export function useDuplicateSalesWindow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: salesWindowsApi.duplicateSalesWindow,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sales-windows'] });
      toast.success(`Sales window duplicated as "${data.name}"`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to duplicate sales window');
    }
  });
}

/**
 * Hook to update sales window products
 */
export function useUpdateSalesWindowProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, products }: {
      id: string;
      products: Array<{
        productId: string;
        price_override?: number;
        qty_limit_per_customer?: number;
        active?: boolean;
      }>;
    }) => salesWindowsApi.updateSalesWindowProducts(id, products),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.salesWindow(variables.id) });
      toast.success('Products updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update products');
    }
  });
}

/**
 * Hook to create time slots for sales window
 */
export function useCreateTimeSlots() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, config }: {
      id: string;
      config: {
        slot_length_min: number;
        slot_capacity: number;
        start_time: string;
        end_time: string;
      };
    }) => salesWindowsApi.createTimeSlots(id, config),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.salesWindow(variables.id) });
      toast.success('Time slots created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create time slots');
    }
  });
}
