export { default as VendorHeader } from './VendorHeader';
export { default as VendorBio } from './VendorBio';
export { default as ProductCard } from './ProductCard';
export { default as ReviewBlock } from './ReviewBlock';
export { default as FulfillmentInfo } from './FulfillmentInfo';
export { default as ContactModal } from './ContactModal';

// Analytics components
export { KpiCard } from './analytics/KpiCard';
export { KpiCardTest } from './analytics/KpiCardTest';
export { TrendChart } from './analytics/TrendChart';
export { PerformanceKpis } from './analytics/PerformanceKpis';
export { TopProducts } from './analytics/TopProducts';
export { AiInsights } from './analytics/AiInsights';
export { ConversionFunnel } from './analytics/ConversionFunnel';
export { BestSellers } from './analytics/BestSellers';
export { CustomerInsights } from './analytics/CustomerInsights';
export { ProfitLossStatement } from './analytics/ProfitLossStatement';
export { CashFlowChart } from './analytics/CashFlowChart';
export { BalanceSheet } from './analytics/BalanceSheet';
export { StorefrontSnapshot } from './analytics/StorefrontSnapshot';
export { PriceOptimizer } from './analytics/PriceOptimizer';
export { TaxSummary } from './analytics/TaxSummary';

// Re-export types for convenience
export type { Vendor } from './VendorHeader';
// Removed conflicting Product type re-export to fix import issues
export type { Review } from './ReviewBlock'; 