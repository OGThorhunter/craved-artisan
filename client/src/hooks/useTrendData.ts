import { useQuery } from '@tanstack/react-query';
import { fetchAnalyticsTrends, fetchAnalyticsSummary } from '../services/analytics';
import type { 
  AnalyticsTrendsResponse,
  AnalyticsSummaryResponse,
  AnalyticsSummary
} from '../types/analytics';

/**
 * React Query hook for fetching analytics trend data
 * @param vendorId - The vendor ID
 * @param range - Time range: 'daily', 'weekly', or 'monthly'
 * @returns React Query result with analytics trends data
 */
export function useTrendData(vendorId: string, range: 'daily' | 'weekly' | 'monthly' = 'daily') {
  return useQuery<AnalyticsTrendsResponse>({
    queryKey: ['trendData', vendorId, range],
    queryFn: async () => {
      return await fetchAnalyticsTrends(vendorId, range);
    },
    enabled: !!vendorId, // Only run query if vendorId is provided
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 2, // Retry failed requests 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

/**
 * React Query hook for fetching analytics summary data
 * @param vendorId - The vendor ID
 * @returns React Query result with analytics summary data
 */
export function useAnalyticsSummary(vendorId: string) {
  return useQuery<AnalyticsSummaryResponse>({
    queryKey: ['analyticsSummary', vendorId],
    queryFn: async () => {
      return await fetchAnalyticsSummary(vendorId);
    },
    enabled: !!vendorId, // Only run query if vendorId is provided
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
    cacheTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    retry: 2, // Retry failed requests 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

/**
 * React Query hook for fetching analytics data with fallback to mock data
 * @param vendorId - The vendor ID
 * @param range - Time range: 'daily', 'weekly', or 'monthly'
 * @returns React Query result with analytics trends data (with fallback)
 */
export function useTrendDataWithFallback(vendorId: string, range: 'daily' | 'weekly' | 'monthly' = 'daily') {
  return useQuery<AnalyticsTrendsResponse>({
    queryKey: ['trendDataWithFallback', vendorId, range],
    queryFn: async () => {
      try {
        return await fetchAnalyticsTrends(vendorId, range);
      } catch (error) {
        console.warn('Failed to fetch analytics trends, using mock data:', error);
        // Import the fallback function dynamically to avoid circular dependencies
        const { generateMockAnalyticsTrends } = await import('../services/analytics');
        return generateMockAnalyticsTrends(vendorId, range);
      }
    },
    enabled: !!vendorId, // Only run query if vendorId is provided
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: false, // Don't retry since we have fallback
  });
}

/**
 * React Query hook for prefetching analytics data
 * @param queryClient - The React Query client instance
 * @param vendorId - The vendor ID
 * @param range - Time range: 'daily', 'weekly', or 'monthly'
 */
export async function prefetchTrendData(
  queryClient: any,
  vendorId: string,
  range: 'daily' | 'weekly' | 'monthly' = 'daily'
) {
  await queryClient.prefetchQuery({
    queryKey: ['trendData', vendorId, range],
    queryFn: async () => {
      return await fetchAnalyticsTrends(vendorId, range);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * React Query hook for prefetching analytics summary data
 * @param queryClient - The React Query client instance
 * @param vendorId - The vendor ID
 */
export async function prefetchAnalyticsSummary(queryClient: any, vendorId: string) {
  await queryClient.prefetchQuery({
    queryKey: ['analyticsSummary', vendorId],
    queryFn: async () => {
      return await fetchAnalyticsSummary(vendorId);
    },
    staleTime: 10 * 60 * 1000,
  });
}

// Re-export types for convenience
export type { AnalyticsTrend, AnalyticsTrendsResponse, AnalyticsSummary, AnalyticsSummaryResponse } from '../types/analytics'; 