import { useQuery } from '@tanstack/react-query';
import { fetchVendorPulse } from '../api';
import type { PulseRange } from '../types';

/**
 * React Query hook for fetching vendor pulse data
 * @param vendorId - The vendor's unique identifier
 * @param range - Time range: 'today', 'week', or 'month'
 * @returns UseQueryResult with pulse data, loading state, and error handling
 */
export function usePulse(vendorId: string, range: PulseRange) {
  return useQuery({
    queryKey: ['vendor-pulse', vendorId, range],
    queryFn: () => fetchVendorPulse(vendorId, range),
    staleTime: 30_000, // Data considered fresh for 30 seconds
    refetchInterval: 60_000, // Refetch every minute for real-time updates
    enabled: !!vendorId, // Only run query when vendorId is available
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}
