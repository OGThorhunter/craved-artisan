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
      
      const now = new Date();
      const days = interval === 'day' ? 14 : interval === 'week' ? 12 : 12;
      const series = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        if (interval === 'day') {
          date.setDate(date.getDate() - i);
        } else if (interval === 'week') {
          date.setDate(date.getDate() - (i * 7));
        } else {
          date.setMonth(date.getMonth() - i);
        }
        
        series.push({
          date: date.toISOString().slice(0, 10),
          revenue: Math.floor(Math.random() * 1000) + 100,
          orders: Math.floor(Math.random() * 20) + 1
        });
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
      
      const items = [];
      const categories = ['Bread', 'Pastries', 'Coffee', 'Tea', 'Honey', 'Cheese'];
      
      for (let i = 0; i < limit; i++) {
        items.push({
          productId: `product_${i + 1}`,
          name: `${categories[i % categories.length]} Product ${i + 1}`,
          qtySold: Math.floor(Math.random() * 100) + 10,
          totalRevenue: Math.floor(Math.random() * 5000) + 500
        });
      }
      
      return { items: items.sort((a, b) => b.totalRevenue - a.totalRevenue) };
    },
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000,
  });
}
