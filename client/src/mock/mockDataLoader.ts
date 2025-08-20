// Mock data loader utility for testing
import { mockStoreData, mockProducts, mockUpcomingEvents, mockOrderWindows } from './storefrontData';
import { 
  enhancedMockKpis, 
  enhancedMockTrendData, 
  enhancedMockFunnelData,
  enhancedMockBestSellers,
  enhancedMockFinancialMetrics,
  enhancedMockTaxData,
  enhancedMockCustomerInsights,
  enhancedMockInventoryMetrics,
  enhancedMockPerformanceMetrics,
  enhancedMockAIInsights,
  enhancedMockForecastData
} from './enhancedAnalyticsData';

// Simulate API delay for realistic testing
const simulateApiDelay = (min: number = 300, max: number = 800) => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Mock API responses with realistic structure
export const mockApiResponses = {
  // Storefront data
  getStoreData: async () => {
    await simulateApiDelay();
    return {
      success: true,
      data: mockStoreData,
      message: 'Store data loaded successfully'
    };
  },

  getProducts: async (filters?: any) => {
    await simulateApiDelay();
    
    let filteredProducts = [...mockProducts];
    
    // Apply filters if provided
    if (filters) {
      if (filters.category && filters.category !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === filters.category);
      }
      if (filters.availability && filters.availability !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.availability === filters.availability);
      }
      if (filters.search) {
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.description.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
    }
    
    return {
      success: true,
      data: filteredProducts,
      total: filteredProducts.length,
      message: 'Products loaded successfully'
    };
  },

  getEvents: async () => {
    await simulateApiDelay();
    return {
      success: true,
      data: mockUpcomingEvents,
      message: 'Events loaded successfully'
    };
  },

  getOrderWindows: async () => {
    await simulateApiDelay();
    return {
      success: true,
      data: mockOrderWindows,
      message: 'Order windows loaded successfully'
    };
  },

  // Analytics data
  getAnalyticsSummary: async (vendorId: string) => {
    await simulateApiDelay();
    return {
      success: true,
      data: {
        thisMonthRevenue: 28450,
        thisMonthOrders: 820,
        avgOrderValue: 34.67,
        totalRevenue: 28450,
        customerCount: 677,
        topProducts: enhancedMockBestSellers.slice(0, 3)
      },
      message: 'Analytics summary loaded successfully'
    };
  },

  getTrendData: async (vendorId: string, range: 'daily' | 'weekly' | 'monthly') => {
    await simulateApiDelay();
    return {
      success: true,
      data: enhancedMockTrendData[range] || [],
      message: `Trend data for ${range} loaded successfully`
    };
  },

  getKpis: async () => {
    await simulateApiDelay();
    return {
      success: true,
      data: enhancedMockKpis,
      message: 'KPIs loaded successfully'
    };
  },

  getConversionFunnel: async () => {
    await simulateApiDelay();
    return {
      success: true,
      data: enhancedMockFunnelData,
      message: 'Conversion funnel data loaded successfully'
    };
  },

  getBestSellers: async (vendorId: string, range: string = 'monthly', limit: number = 10) => {
    await simulateApiDelay();
    return {
      success: true,
      data: enhancedMockBestSellers.slice(0, limit),
      summary: {
        totalRevenue: enhancedMockBestSellers.reduce((sum, p) => sum + p.revenue, 0),
        totalOrders: enhancedMockBestSellers.reduce((sum, p) => sum + p.units, 0),
        avgOrderValue: enhancedMockBestSellers.reduce((sum, p) => sum + p.revenue, 0) / 
                      enhancedMockBestSellers.reduce((sum, p) => sum + p.units, 0)
      },
      message: 'Best sellers data loaded successfully'
    };
  },

  getFinancialMetrics: async () => {
    await simulateApiDelay();
    return {
      success: true,
      data: enhancedMockFinancialMetrics,
      message: 'Financial metrics loaded successfully'
    };
  },

  getTaxData: async () => {
    await simulateApiDelay();
    return {
      success: true,
      data: enhancedMockTaxData,
      message: 'Tax data loaded successfully'
    };
  },

  getCustomerInsights: async () => {
    await simulateApiDelay();
    return {
      success: true,
      data: enhancedMockCustomerInsights,
      message: 'Customer insights loaded successfully'
    };
  },

  getInventoryMetrics: async () => {
    await simulateApiDelay();
    return {
      success: true,
      data: enhancedMockInventoryMetrics,
      message: 'Inventory metrics loaded successfully'
    };
  },

  getPerformanceMetrics: async () => {
    await simulateApiDelay();
    return {
      success: true,
      data: enhancedMockPerformanceMetrics,
      message: 'Performance metrics loaded successfully'
    };
  },

  getAIInsights: async () => {
    await simulateApiDelay();
    return {
      success: true,
      data: enhancedMockAIInsights,
      message: 'AI insights loaded successfully'
    };
  },

  getForecastData: async () => {
    await simulateApiDelay();
    return {
      success: true,
      data: enhancedMockForecastData,
      message: 'Forecast data loaded successfully'
    };
  }
};

// Mock error responses for testing error handling
export const mockErrorResponses = {
  networkError: {
    success: false,
    error: 'Network Error',
    message: 'Failed to connect to server. Please check your internet connection.',
    status: 0
  },
  
  serverError: {
    success: false,
    error: 'Internal Server Error',
    message: 'Something went wrong on our end. Please try again later.',
    status: 500
  },
  
  notFound: {
    success: false,
    error: 'Not Found',
    message: 'The requested resource was not found.',
    status: 404
  },
  
  unauthorized: {
    success: false,
    error: 'Unauthorized',
    message: 'You are not authorized to access this resource.',
    status: 401
  },
  
  rateLimit: {
    success: false,
    error: 'Rate Limit Exceeded',
    message: 'Too many requests. Please wait a moment before trying again.',
    status: 429
  }
};

// Utility functions for testing
export const mockDataUtils = {
  // Generate random data variations
  generateRandomVariation: (baseValue: number, variance: number = 0.1) => {
    const variation = (Math.random() - 0.5) * 2 * variance;
    return Math.round(baseValue * (1 + variation));
  },

  // Simulate data updates
  simulateDataUpdate: async (data: any, updateFunction: (data: any) => any) => {
    await simulateApiDelay(100, 300);
    return updateFunction(data);
  },

  // Generate test scenarios
  generateTestScenario: (scenario: 'success' | 'loading' | 'error' | 'empty') => {
    switch (scenario) {
      case 'success':
        return { loading: false, error: null, data: mockProducts };
      case 'loading':
        return { loading: true, error: null, data: null };
      case 'error':
        return { loading: false, error: 'Failed to load data', data: null };
      case 'empty':
        return { loading: false, error: null, data: [] };
      default:
        return { loading: false, error: null, data: mockProducts };
    }
  },

  // Mock search functionality
  mockSearch: async (query: string, data: any[]) => {
    await simulateApiDelay(200, 500);
    if (!query.trim()) return data;
    
    return data.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(query.toLowerCase())) ||
      (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase())))
    );
  },

  // Mock filtering functionality
  mockFilter: async (filters: any, data: any[]) => {
    await simulateApiDelay(100, 300);
    let filteredData = [...data];
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        filteredData = filteredData.filter(item => item[key] === value);
      }
    });
    
    return filteredData;
  },

  // Mock sorting functionality
  mockSort: async (data: any[], field: string, direction: 'asc' | 'desc' = 'asc') => {
    await simulateApiDelay(50, 150);
    return [...data].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }
};

// Export all mock data for easy access
export const allMockData = {
  storefront: {
    storeData: mockStoreData,
    products: mockProducts,
    events: mockUpcomingEvents,
    orderWindows: mockOrderWindows
  },
  analytics: {
    kpis: enhancedMockKpis,
    trendData: enhancedMockTrendData,
    funnelData: enhancedMockFunnelData,
    bestSellers: enhancedMockBestSellers,
    financialMetrics: enhancedMockFinancialMetrics,
    taxData: enhancedMockTaxData,
    customerInsights: enhancedMockCustomerInsights,
    inventoryMetrics: enhancedMockInventoryMetrics,
    performanceMetrics: enhancedMockPerformanceMetrics,
    aiInsights: enhancedMockAIInsights,
    forecastData: enhancedMockForecastData
  }
};

export default mockApiResponses;
