import type { 
  AnalyticsTrend, 
  AnalyticsTrendsResponse, 
  AnalyticsSummary, 
  AnalyticsSummaryResponse 
} from '../types/analytics';

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
      `${API_BASE_URL}/vendor/${vendorId}/analytics/trends?range=${range}`,
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
    throw error;
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
      `${API_BASE_URL}/vendor/${vendorId}/analytics/summary`,
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
    throw error;
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

// Re-export types for convenience
export type { AnalyticsTrend, AnalyticsTrendsResponse, AnalyticsSummary, AnalyticsSummaryResponse }; 