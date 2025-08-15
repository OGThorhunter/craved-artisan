// Analytics Types
export interface AnalyticsTrend {
  date: string;
  revenue: number;
  orders: number;
}

export interface AnalyticsTrendsResponse {
  success: boolean;
  data: AnalyticsTrend[];
  meta: {
    vendorId: string;
    range: 'daily' | 'weekly' | 'monthly';
    dataPoints: number;
    generatedAt: string;
  };
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  averageDeliveryTime: number;
  averageRating: number;
  totalReviews: number;
  totalProductsSold: number;
  totalCustomers: number;
  totalRevenueByMonth: Array<{ month: string; revenue: number }>;
  totalOrdersByMonth: Array<{ month: string; orders: number }>;
  totalRevenueByProduct: Array<{ productName: string; revenue: number }>;
  totalOrdersByProduct: Array<{ productName: string; orders: number }>;
  totalCustomersByCountry: Array<{ country: string; customers: number }>;
  totalRevenueByHour: Array<{ hour: string; revenue: number }>;
  totalOrdersByHour: Array<{ hour: string; orders: number }>;
  totalRevenueByDayOfWeek: Array<{ day: string; revenue: number }>;
  totalOrdersByDayOfWeek: Array<{ day: string; orders: number }>;
}

export interface AnalyticsSummaryResponse {
  success: boolean;
  data: AnalyticsSummary;
  meta: {
    vendorId: string;
    range: string;
    dataPoints: number;
    generatedAt: string;
  };
} 