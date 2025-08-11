import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/http';

interface ProductOverviewData {
  totals: {
    revenue: number;
    qtySold: number;
    orders: number;
  };
  series: Array<{
    date: string;
    revenue: number;
    qty: number;
  }>;
  priceHistory?: Array<{
    date: string;
    price: number;
  }>;
}

interface ProductAnalyticsOptions {
  from?: string;
  to?: string;
}

export function useProductOverview(vendorId: string, productId: string, options: ProductAnalyticsOptions = {}) {
  const { from, to } = options;
  
  return useQuery({
    queryKey: ['product-overview', vendorId, productId, from, to],
    queryFn: async (): Promise<ProductOverviewData> => {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      
      const response = await api.get(`/analytics/vendor/${vendorId}/product/${productId}/overview?${params.toString()}`);
      return response.data;
    },
    enabled: !!vendorId && !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Fallback mock data for when the feature flag is disabled
export function useMockProductOverview(vendorId: string, productId: string, options: ProductAnalyticsOptions = {}) {
  const { from, to } = options;
  
  return useQuery({
    queryKey: ['mock-product-overview', vendorId, productId, from, to],
    queryFn: async (): Promise<ProductOverviewData> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const now = new Date();
      const fromDate = from ? new Date(from) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const toDate = to ? new Date(to) : now;
      
      // Generate mock series data
      const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
      const series = [];
      
      for (let i = 0; i < days; i++) {
        const date = new Date(fromDate.getTime() + i * 24 * 60 * 60 * 1000);
        series.push({
          date: date.toISOString().slice(0, 10),
          revenue: Math.floor(Math.random() * 500) + 50,
          qty: Math.floor(Math.random() * 20) + 1
        });
      }
      
      const totals = series.reduce((acc, item) => ({
        revenue: acc.revenue + item.revenue,
        qtySold: acc.qtySold + item.qty,
        orders: acc.orders + Math.floor(item.qty / 3) + 1
      }), { revenue: 0, qtySold: 0, orders: 0 });
      
      // Generate mock price history
      const priceHistory = series.slice(0, 5).map((item, index) => ({
        date: item.date,
        price: Math.floor(Math.random() * 50) + 10 + index
      }));
      
      return {
        totals,
        series,
        priceHistory
      };
    },
    enabled: !!vendorId && !!productId,
    staleTime: 5 * 60 * 1000,
  });
}
