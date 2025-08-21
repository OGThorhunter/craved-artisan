import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/http';

export interface RecurringEntry {
  id: string;
  type: 'AR' | 'AP';
  name: string;
  amount: number;
  interval: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  nextDueDate: string;
  isActive: boolean;
  description?: string;
  vendorOrCustomer: string;
  category?: string;
}

export interface CreateRecurringEntryRequest {
  type: 'AR' | 'AP';
  name: string;
  amount: number;
  interval: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  description?: string;
  vendorOrCustomer: string;
  category?: string;
}

export interface UpdateRecurringEntryRequest {
  id: string;
  name?: string;
  amount?: number;
  interval?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate?: string;
  description?: string;
  vendorOrCustomer?: string;
  category?: string;
  isActive?: boolean;
}

// Mock data for development
const mockRecurringEntries: RecurringEntry[] = [
  {
    id: '1',
    type: 'AR',
    name: 'Monthly Subscription',
    amount: 299.99,
    interval: 'monthly',
    startDate: '2024-01-01',
    nextDueDate: '2024-12-01',
    isActive: true,
    description: 'Premium subscription service',
    vendorOrCustomer: 'TechCorp Inc.',
    category: 'Subscriptions'
  },
  {
    id: '2',
    type: 'AP',
    name: 'Office Rent',
    amount: 2500.00,
    interval: 'monthly',
    startDate: '2024-01-01',
    nextDueDate: '2024-12-01',
    isActive: true,
    description: 'Monthly office space rental',
    vendorOrCustomer: 'Property Management LLC',
    category: 'Rent'
  },
  {
    id: '3',
    type: 'AR',
    name: 'Quarterly Consulting',
    amount: 5000.00,
    interval: 'quarterly',
    startDate: '2024-01-01',
    nextDueDate: '2024-10-01',
    isActive: true,
    description: 'Business consulting services',
    vendorOrCustomer: 'Strategic Partners Ltd.',
    category: 'Services'
  },
  {
    id: '4',
    type: 'AP',
    name: 'Annual Insurance',
    amount: 12000.00,
    interval: 'yearly',
    startDate: '2024-01-01',
    nextDueDate: '2025-01-01',
    isActive: true,
    description: 'Business liability insurance',
    vendorOrCustomer: 'Secure Insurance Co.',
    category: 'Insurance'
  }
];

// Helper function to calculate next due date
const calculateNextDueDate = (startDate: string, interval: string): string => {
  const start = new Date(startDate);
  const today = new Date();
  
  if (start > today) return start.toISOString().split('T')[0];
  
  let next = new Date(start);
  while (next <= today) {
    switch (interval) {
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }
  }
  
  return next.toISOString().split('T')[0];
};

// Hook for fetching recurring entries
export function useRecurringEntries(vendorId: string) {
  return useQuery({
    queryKey: ['recurring-entries', vendorId],
    queryFn: async (): Promise<RecurringEntry[]> => {
      // In development, return mock data
      if (import.meta.env.DEV) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockRecurringEntries;
      }

      // In production, make actual API call
      const response = await http(`/api/analytics/recurring-entries/${vendorId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recurring entries');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for creating a new recurring entry
export function useCreateRecurringEntry(vendorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRecurringEntryRequest): Promise<RecurringEntry> => {
      // In development, simulate creation
      if (import.meta.env.DEV) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const newEntry: RecurringEntry = {
          id: Date.now().toString(),
          ...data,
          nextDueDate: calculateNextDueDate(data.startDate, data.interval),
          isActive: true
        };
        return newEntry;
      }

      // In production, make actual API call
      const response = await http(`/api/analytics/recurring-entries/${vendorId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create recurring entry');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch recurring entries
      queryClient.invalidateQueries({ queryKey: ['recurring-entries', vendorId] });
    },
  });
}

// Hook for updating a recurring entry
export function useUpdateRecurringEntry(vendorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateRecurringEntryRequest): Promise<RecurringEntry> => {
      // In development, simulate update
      if (import.meta.env.DEV) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const updatedEntry: RecurringEntry = {
          id: data.id,
          type: 'AR', // This would come from existing entry
          name: data.name || 'Updated Entry',
          amount: data.amount || 0,
          interval: data.interval || 'monthly',
          startDate: data.startDate || '2024-01-01',
          nextDueDate: calculateNextDueDate(data.startDate || '2024-01-01', data.interval || 'monthly'),
          isActive: data.isActive !== undefined ? data.isActive : true,
          description: data.description,
          vendorOrCustomer: data.vendorOrCustomer || 'Updated Vendor/Customer',
          category: data.category
        };
        return updatedEntry;
      }

      // In production, make actual API call
      const response = await http(`/api/analytics/recurring-entries/${vendorId}/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update recurring entry');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch recurring entries
      queryClient.invalidateQueries({ queryKey: ['recurring-entries', vendorId] });
    },
  });
}

// Hook for deleting a recurring entry
export function useDeleteRecurringEntry(vendorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: string): Promise<void> => {
      // In development, simulate deletion
      if (import.meta.env.DEV) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return;
      }

      // In production, make actual API call
      const response = await http(`/api/analytics/recurring-entries/${vendorId}/${entryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete recurring entry');
      }
    },
    onSuccess: () => {
      // Invalidate and refetch recurring entries
      queryClient.invalidateQueries({ queryKey: ['recurring-entries', vendorId] });
    },
  });
}

// Hook for toggling entry active status
export function useToggleRecurringEntry(vendorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entryId, isActive }: { entryId: string; isActive: boolean }): Promise<void> => {
      // In development, simulate toggle
      if (import.meta.env.DEV) {
        await new Promise(resolve => setTimeout(resolve, 200));
        return;
      }

      // In production, make actual API call
      const response = await http(`/api/analytics/recurring-entries/${vendorId}/${entryId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle recurring entry status');
      }
    },
    onSuccess: () => {
      // Invalidate and refetch recurring entries
      queryClient.invalidateQueries({ queryKey: ['recurring-entries', vendorId] });
    },
  });
}
