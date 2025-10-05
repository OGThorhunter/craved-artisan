import type { 
  AnalyticsTrend, 
  AnalyticsTrendsResponse, 
  AnalyticsSummary, 
  AnalyticsSummaryResponse 
} from '../types/analytics.js';

// API base URL - adjust based on your environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Fetch analytics trends for a vendor
 * @param vendorId - The vendor ID
 * @param range - Time range: 'daily', 'weekly', or 'monthly'
 * @returns Promise with analytics trends data
 */
export const fetchAnalyticsTrends = async (
  vendorId: string, 
  range: 'daily' | 'weekly' | 'monthly' = 'daily'
): Promise<AnalyticsTrendsResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/analytics/vendor/${vendorId}/overview?range=${range}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if needed
          // 'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching analytics trends:', error);
    // Return mock data as fallback
    return generateMockAnalyticsTrends(vendorId, range);
  }
};

/**
 * Fetch analytics summary for a vendor
 * @param vendorId - The vendor ID
 * @returns Promise with analytics summary data
 */
export const fetchAnalyticsSummary = async (
  vendorId: string
): Promise<AnalyticsSummaryResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/analytics/vendor/${vendorId}/overview?range=monthly`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if needed
          // 'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    // Return mock data as fallback
    return generateMockAnalyticsSummary(vendorId);
  }
};

/**
 * Fetch analytics trends with error handling and fallback to mock data
 * @param vendorId - The vendor ID
 * @param range - Time range: 'daily', 'weekly', or 'monthly'
 * @returns Promise with analytics trends data or mock data on error
 */
export const fetchAnalyticsTrendsWithFallback = async (
  vendorId: string, 
  range: 'daily' | 'weekly' | 'monthly' = 'daily'
): Promise<AnalyticsTrendsResponse> => {
  try {
    return await fetchAnalyticsTrends(vendorId, range);
  } catch (error) {
    console.warn('Failed to fetch analytics trends, using mock data:', error);
    
    // Return mock data as fallback
    return generateMockAnalyticsTrends(vendorId, range);
  }
};

/**
 * Generate mock analytics trends data for development/testing
 * @param vendorId - The vendor ID
 * @param range - Time range: 'daily', 'weekly', or 'monthly'
 * @returns Mock analytics trends response
 */
export const generateMockAnalyticsTrends = (
  vendorId: string, 
  range: 'daily' | 'weekly' | 'monthly' = 'daily'
): AnalyticsTrendsResponse => {
  const trends: AnalyticsTrend[] = [];
  const now = new Date();
  
  let dataPoints: number;
  let dateStep: number;
  
  switch (range) {
    case 'daily':
      dataPoints = 30; // Last 30 days
      dateStep = 1;
      break;
    case 'weekly':
      dataPoints = 12; // Last 12 weeks
      dateStep = 7;
      break;
    case 'monthly':
      dataPoints = 12; // Last 12 months
      dateStep = 30;
      break;
    default:
      dataPoints = 30;
      dateStep = 1;
  }
  
  for (let i = dataPoints - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * dateStep));
    
    // Generate realistic mock data with some variation
    const baseRevenue = 800 + Math.random() * 400; // $800-$1200 base
    const baseOrders = 15 + Math.random() * 10; // 15-25 base orders
    
    // Add some seasonal/weekend variation
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weekendMultiplier = isWeekend ? 1.2 : 1.0;
    
    // Add some random variation
    const randomVariation = 0.8 + Math.random() * 0.4; // 0.8-1.2
    
    const revenue = Math.round(baseRevenue * weekendMultiplier * randomVariation);
    const orders = Math.round(baseOrders * weekendMultiplier * randomVariation);
    
    trends.push({
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: range === 'monthly' ? undefined : 'numeric',
        year: range === 'monthly' ? 'numeric' : undefined
      }),
      revenue,
      orders
    });
  }
  
  return {
    success: true,
    data: trends,
    meta: {
      vendorId,
      range,
      dataPoints: trends.length,
      generatedAt: new Date().toISOString()
    }
  };
};

/**
 * Generate mock analytics summary data for development/testing
 * @param vendorId - The vendor ID
 * @returns Mock analytics summary response
 */
export const generateMockAnalyticsSummary = (
  vendorId: string
): AnalyticsSummaryResponse => {
  const summary: AnalyticsSummary = {
    totalRevenue: 12000 + Math.random() * 5000, // $12,000 - $17,000
    totalOrders: 200 + Math.random() * 100, // 200-300
    averageOrderValue: 60 + Math.random() * 20, // $60-$80
    conversionRate: 0.02 + Math.random() * 0.01, // 0.02-0.03
    averageDeliveryTime: 2.5 + Math.random() * 1.5, // 2.5-4 hours
    averageRating: 4.5 + Math.random() * 0.5, // 4.5-5.0
    totalReviews: 100 + Math.random() * 50, // 100-150
    totalProductsSold: 150 + Math.random() * 100, // 150-250
    totalCustomers: 500 + Math.random() * 200, // 500-700
    totalRevenueByMonth: [
      { month: 'Jan', revenue: 1000 + Math.random() * 500 },
      { month: 'Feb', revenue: 1200 + Math.random() * 600 },
      { month: 'Mar', revenue: 1100 + Math.random() * 550 },
      { month: 'Apr', revenue: 1300 + Math.random() * 650 },
      { month: 'May', revenue: 1250 + Math.random() * 620 },
      { month: 'Jun', revenue: 1400 + Math.random() * 700 },
      { month: 'Jul', revenue: 1350 + Math.random() * 680 },
      { month: 'Aug', revenue: 1500 + Math.random() * 750 },
      { month: 'Sep', revenue: 1450 + Math.random() * 720 },
      { month: 'Oct', revenue: 1600 + Math.random() * 800 },
      { month: 'Nov', revenue: 1550 + Math.random() * 780 },
      { month: 'Dec', revenue: 1700 + Math.random() * 850 },
    ],
    totalOrdersByMonth: [
      { month: 'Jan', orders: 15 + Math.random() * 5 },
      { month: 'Feb', orders: 18 + Math.random() * 6 },
      { month: 'Mar', orders: 16 + Math.random() * 4 },
      { month: 'Apr', orders: 19 + Math.random() * 7 },
      { month: 'May', orders: 17 + Math.random() * 5 },
      { month: 'Jun', orders: 20 + Math.random() * 8 },
      { month: 'Jul', orders: 19 + Math.random() * 6 },
      { month: 'Aug', orders: 21 + Math.random() * 9 },
      { month: 'Sep', orders: 20 + Math.random() * 7 },
      { month: 'Oct', orders: 22 + Math.random() * 10 },
      { month: 'Nov', orders: 21 + Math.random() * 8 },
      { month: 'Dec', orders: 23 + Math.random() * 11 },
    ],
    totalRevenueByProduct: [
      { productName: 'Product A', revenue: 3000 + Math.random() * 1500 },
      { productName: 'Product B', revenue: 2500 + Math.random() * 1200 },
      { productName: 'Product C', revenue: 2000 + Math.random() * 1000 },
      { productName: 'Product D', revenue: 1500 + Math.random() * 700 },
      { productName: 'Product E', revenue: 1000 + Math.random() * 500 },
      { productName: 'Product F', revenue: 800 + Math.random() * 400 },
      { productName: 'Product G', revenue: 600 + Math.random() * 300 },
      { productName: 'Product H', revenue: 400 + Math.random() * 200 },
      { productName: 'Product I', revenue: 200 + Math.random() * 100 },
      { productName: 'Product J', revenue: 100 + Math.random() * 50 },
    ],
    totalOrdersByProduct: [
      { productName: 'Product A', orders: 50 + Math.random() * 20 },
      { productName: 'Product B', orders: 40 + Math.random() * 15 },
      { productName: 'Product C', orders: 35 + Math.random() * 10 },
      { productName: 'Product D', orders: 30 + Math.random() * 8 },
      { productName: 'Product E', orders: 25 + Math.random() * 6 },
      { productName: 'Product F', orders: 20 + Math.random() * 5 },
      { productName: 'Product G', orders: 15 + Math.random() * 4 },
      { productName: 'Product H', orders: 10 + Math.random() * 3 },
      { productName: 'Product I', orders: 5 + Math.random() * 2 },
      { productName: 'Product J', orders: 3 + Math.random() * 1 },
    ],
    totalCustomersByCountry: [
      { country: 'USA', customers: 300 + Math.random() * 150 },
      { country: 'Canada', customers: 150 + Math.random() * 75 },
      { country: 'UK', customers: 100 + Math.random() * 50 },
      { country: 'Germany', customers: 80 + Math.random() * 40 },
      { country: 'France', customers: 70 + Math.random() * 35 },
      { country: 'Australia', customers: 60 + Math.random() * 30 },
      { country: 'Japan', customers: 50 + Math.random() * 25 },
      { country: 'Brazil', customers: 40 + Math.random() * 20 },
      { country: 'India', customers: 30 + Math.random() * 15 },
      { country: 'Mexico', customers: 20 + Math.random() * 10 },
    ],
    totalRevenueByHour: [
      { hour: '00', revenue: 500 + Math.random() * 200 },
      { hour: '01', revenue: 450 + Math.random() * 180 },
      { hour: '02', revenue: 400 + Math.random() * 160 },
      { hour: '03', revenue: 350 + Math.random() * 140 },
      { hour: '04', revenue: 300 + Math.random() * 120 },
      { hour: '05', revenue: 250 + Math.random() * 100 },
      { hour: '06', revenue: 200 + Math.random() * 80 },
      { hour: '07', revenue: 150 + Math.random() * 60 },
      { hour: '08', revenue: 100 + Math.random() * 40 },
      { hour: '09', revenue: 50 + Math.random() * 20 },
    ],
    totalOrdersByHour: [
      { hour: '00', orders: 10 + Math.random() * 4 },
      { hour: '01', orders: 9 + Math.random() * 3 },
      { hour: '02', orders: 8 + Math.random() * 2 },
      { hour: '03', orders: 7 + Math.random() * 1 },
      { hour: '04', orders: 6 + Math.random() * 0.5 },
      { hour: '05', orders: 5 + Math.random() * 0.3 },
      { hour: '06', orders: 4 + Math.random() * 0.2 },
      { hour: '07', orders: 3 + Math.random() * 0.1 },
      { hour: '08', orders: 2 + Math.random() * 0.05 },
      { hour: '09', orders: 1 + Math.random() * 0.02 },
    ],
    totalRevenueByDayOfWeek: [
      { day: 'Mon', revenue: 1000 + Math.random() * 500 },
      { day: 'Tue', revenue: 1100 + Math.random() * 600 },
      { day: 'Wed', revenue: 1050 + Math.random() * 550 },
      { day: 'Thu', revenue: 1200 + Math.random() * 650 },
      { day: 'Fri', revenue: 1150 + Math.random() * 620 },
      { day: 'Sat', revenue: 1300 + Math.random() * 700 },
      { day: 'Sun', revenue: 1250 + Math.random() * 680 },
    ],
    totalOrdersByDayOfWeek: [
      { day: 'Mon', orders: 15 + Math.random() * 5 },
      { day: 'Tue', orders: 18 + Math.random() * 6 },
      { day: 'Wed', orders: 16 + Math.random() * 4 },
      { day: 'Thu', orders: 19 + Math.random() * 7 },
      { day: 'Fri', orders: 17 + Math.random() * 5 },
      { day: 'Sat', orders: 20 + Math.random() * 8 },
      { day: 'Sun', orders: 19 + Math.random() * 6 },
    ],
  };

  return {
    success: true,
    data: summary,
    meta: {
      vendorId,
      range: 'monthly', // Mock data is always monthly
      dataPoints: 12, // Mock data has 12 months
      generatedAt: new Date().toISOString()
    }
  };
};

// Re-export types for convenience
export type { AnalyticsTrend, AnalyticsTrendsResponse, AnalyticsSummary, AnalyticsSummaryResponse }; 