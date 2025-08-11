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
  vendorId: string;
  vendorName: string;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  thisMonthRevenue: number;
  thisMonthOrders: number;
}

export interface AnalyticsSummaryResponse {
  success: boolean;
  data: AnalyticsSummary;
} 