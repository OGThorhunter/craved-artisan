// Mock data exports
export { mockKpis, mockAnalyticsData } from './analyticsData';

// Storefront mock data
export { 
  mockStoreData, 
  mockProducts, 
  mockUpcomingEvents, 
  mockOrderWindows,
  type Product,
  type Event,
  type StoreData
} from './storefrontData';

// Enhanced analytics mock data
export {
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
  enhancedMockForecastData,
  type EnhancedKpiData,
  type FinancialMetrics,
  type BestSellerData,
  type ConversionData,
  type TaxData
} from './enhancedAnalyticsData';

// Mock API utilities
export {
  mockApiResponses,
  mockErrorResponses,
  mockDataUtils,
  allMockData
} from './mockDataLoader';

// Re-export types if needed
export type { 
  KpiData,
  SalesDataPoint,
  TopProduct,
  CustomerInsights,
  InventoryMetrics,
  PerformanceMetrics 
} from './analyticsData'; 