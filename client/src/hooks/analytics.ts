import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/http';

interface VendorOverviewData {
  totals: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
  };
  series: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

interface VendorBestSellersData {
  items: Array<{
    productId: string;
    name: string;
    qtySold: number;
    totalRevenue: number;
  }>;
}

interface AnalyticsOptions {
  from?: string;
  to?: string;
  interval?: 'day' | 'week' | 'month';
  limit?: number;
}

export function useVendorOverview(vendorId: string, options: AnalyticsOptions = {}) {
  const { from, to, interval = 'day' } = options;
  
  return useQuery({
    queryKey: ['vendor-overview', vendorId, from, to, interval],
    queryFn: async (): Promise<VendorOverviewData> => {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      params.append('interval', interval);
      
      const response = await api.get(`/api/analytics/vendor/${vendorId}/overview?${params.toString()}`);
      return response.data;
    },
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export function useVendorBestSellers(vendorId: string, options: AnalyticsOptions = {}) {
  const { from, to, limit = 10 } = options;
  
  return useQuery({
    queryKey: ['vendor-best-sellers', vendorId, from, to, limit],
    queryFn: async (): Promise<VendorBestSellersData> => {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      params.append('limit', limit.toString());
      
      const response = await api.get(`/api/analytics/vendor/${vendorId}/best-sellers?${params.toString()}`);
      return response.data;
    },
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Fallback mock data for when the feature flag is disabled
export function useMockVendorOverview(vendorId: string, options: AnalyticsOptions = {}) {
  const { interval = 'day' } = options;
  
  return useQuery({
    queryKey: ['mock-vendor-overview', vendorId, interval],
    queryFn: async (): Promise<VendorOverviewData> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Import mock data
      const { mockAnalyticsData } = await import('@/mock/analyticsData');
      
      // Use appropriate data based on interval
      let series;
      if (interval === 'day') {
        series = mockAnalyticsData.salesData.daily.map(item => ({
          date: item.date,
          revenue: item.revenue,
          orders: item.orders
        }));
      } else if (interval === 'week') {
        // Generate weekly data from daily data
        series = mockAnalyticsData.salesData.daily.slice(0, 7).map((item, index) => ({
          date: `Week ${index + 1}`,
          revenue: item.revenue * 5, // Scale up for weekly view
          orders: item.orders * 5
        }));
      } else {
        series = mockAnalyticsData.salesData.monthly.map(item => ({
          date: item.month,
          revenue: item.revenue,
          orders: item.orders
        }));
      }
      
      const totalRevenue = series.reduce((sum, item) => sum + item.revenue, 0);
      const totalOrders = series.reduce((sum, item) => sum + item.orders, 0);
      
      return {
        totals: {
          totalRevenue,
          totalOrders,
          avgOrderValue: totalOrders ? +(totalRevenue / totalOrders).toFixed(2) : 0
        },
        series
      };
    },
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMockVendorBestSellers(vendorId: string, options: AnalyticsOptions = {}) {
  const { limit = 10 } = options;
  
  return useQuery({
    queryKey: ['mock-vendor-best-sellers', vendorId, limit],
    queryFn: async (): Promise<VendorBestSellersData> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Import mock data
      const { mockBestSellers, mockAnalyticsData } = await import('@/mock/analyticsData');
      
      // Combine best sellers from both sources and limit results
      const allBestSellers = [
        ...mockBestSellers.map(item => ({
          productId: `product_${item.name.replace(/\s+/g, '_').toLowerCase()}`,
          name: item.name,
          qtySold: item.unitsSold,
          totalRevenue: item.revenue,
          category: item.category,
          rating: item.rating,
          stockLevel: item.stockLevel,
          // Additional fields for EnhancedBestSellers component
          units: item.unitsSold,
          reorderRate: item.reorderRate,
          stock: item.stockLevel,
          trend: (Math.random() - 0.5) * 40, // Random trend between -20% and +20%
          trendData: item.trend.map((value, index) => ({
            date: new Date(Date.now() - (item.trend.length - index) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            value: value
          }))
        })),
        ...mockAnalyticsData.topProducts.map((item, index) => ({
          productId: `product_${item.name.replace(/\s+/g, '_').toLowerCase()}`,
          name: item.name,
          qtySold: item.sales,
          totalRevenue: item.revenue,
          category: 'General',
          rating: 4.5 + Math.random() * 0.5,
          stockLevel: 80 + Math.random() * 20,
          // Additional fields for EnhancedBestSellers component
          units: item.sales,
          reorderRate: 40 + Math.random() * 30, // Random reorder rate between 40-70%
          stock: 80 + Math.random() * 20,
          trend: (Math.random() - 0.5) * 40, // Random trend between -20% and +20%
          trendData: Array.from({ length: 15 }, (_, i) => ({
            date: new Date(Date.now() - (14 - i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            value: item.sales * (0.8 + Math.random() * 0.4) // Random variation around sales number
          }))
        }))
      ];
      
      return { 
        items: allBestSellers
          .sort((a, b) => b.totalRevenue - a.totalRevenue)
          .slice(0, limit)
      };
    },
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000,
  });
}
