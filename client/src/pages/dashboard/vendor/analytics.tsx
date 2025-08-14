// pages/dashboard/vendor/analytics.tsx
import { useState, useEffect } from "react";
import { useLocation } from 'wouter';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import { KpiCard } from "@/components/vendor/analytics/KpiCard";
import { TrendChart } from "@/components/vendor/analytics/TrendChart";
import ConversionFunnel from "@/components/analytics/ConversionFunnel";
import { BestSellers } from "@/components/vendor/analytics/BestSellers";
import { BestSellersList } from "@/components/vendor/analytics/BestSellersList";
import EnhancedBestSellers from "@/components/analytics/EnhancedBestSellers";
import { PerformanceKpis } from "@/components/vendor/analytics/PerformanceKpis";
import { CustomerInsights } from "@/components/vendor/analytics/CustomerInsights";
import { ProfitLossStatement } from "@/components/vendor/analytics/ProfitLossStatement";
import EnhancedProfitLoss from "@/components/analytics/EnhancedProfitLoss";
import { CashFlowChart } from "@/components/vendor/analytics/CashFlowChart";
import { BalanceSheet } from "@/components/vendor/analytics/BalanceSheet";
import { PortfolioBuilder } from "@/components/vendor/analytics/PortfolioBuilder";
import { PriceOptimizer } from "@/components/vendor/analytics/PriceOptimizer";
import { TaxSummary } from "@/components/vendor/analytics/TaxSummary";
import TrendChartNew from "@/components/charts/TrendChart";
import InspirationalQuote from "@/components/InspirationalQuote";
import AIForecastWidget from "@/components/analytics/AIForecastWidget";
import AISummaryBuilder from "@/components/analytics/AISummaryBuilder";
import InteractiveCashFlow from "@/components/analytics/InteractiveCashFlow";
import { mockKpis } from "@/mock/analyticsData";
import { DollarSign, TrendingUp, Package, Users } from "lucide-react";
import { flags } from "@/lib/flags";
import { 
  useVendorOverview, 
  useVendorBestSellers,
  useMockVendorOverview,
  useMockVendorBestSellers 
} from "@/hooks/analytics";
import FinancialsTab from "@/pages/vendor/FinancialsTab";
import ProductDeepDiveModal from "@/components/ProductDeepDiveModal";
import { Breadcrumbs } from "@/components/dashboard/vendor/Breadcrumbs";

type TabType = 'insights' | 'financials' | 'taxes' | 'pricing' | 'portfolio';

export default function VendorAnalyticsPage() {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('insights');
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  
  // Use real vendor ID from context or mock for development
  const vendorId = 'dev-user-id'; // This should come from auth context in production
  
  // Analytics data fetching with feature flag support
  const overviewQuery = flags.LIVE_ANALYTICS 
    ? useVendorOverview(vendorId, { interval: 'day' })
    : useMockVendorOverview(vendorId, { interval: 'day' });
    
  const bestSellersQuery = flags.LIVE_ANALYTICS
    ? useVendorBestSellers(vendorId, { limit: 10 })
    : useMockVendorBestSellers(vendorId, { limit: 10 });
  
  // Extract data with safe defaults
  const overviewData = overviewQuery.data || {
    totals: { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 },
    series: []
  };
  
  const bestSellersData = bestSellersQuery.data || { items: [] };
  
  // Loading states
  const isLoading = overviewQuery.isLoading || bestSellersQuery.isLoading;

  // Parse URL parameters to determine active tab
  useEffect(() => {
    console.log('=== ANALYTICS PAGE DEBUG ===');
    console.log('Location changed to:', location);
    console.log('Parsing URL parameters...');
    
    const urlParams = new URLSearchParams(location.split('?')[1]);
    const tabParam = urlParams.get('tab') as TabType;
    console.log('Tab parameter from URL:', tabParam);
    
    if (tabParam && ['insights', 'financials', 'taxes', 'pricing', 'portfolio'].includes(tabParam)) {
      console.log('Setting active tab to:', tabParam);
      setActiveTab(tabParam);
    } else {
      console.log('No valid tab parameter, defaulting to insights');
      setActiveTab('insights');
    }
  }, [location]);

  // Monitor activeTab changes
  useEffect(() => {
    console.log('=== ACTIVE TAB CHANGED ===');
    console.log('Current active tab is now:', activeTab);
  }, [activeTab]);

  const icons = [
    <DollarSign key="revenue" size={20} />,
    <DollarSign key="monthly" size={20} />,
    <TrendingUp key="avg" size={20} />,
    <Package key="orders" size={20} />,
  ];
  
  // Debug information
  useEffect(() => {
    console.log('=== ANALYTICS DATA DEBUG ===');
    console.log('Feature flag LIVE_ANALYTICS:', flags.LIVE_ANALYTICS);
    console.log('Overview data:', overviewData);
    console.log('Best sellers data:', bestSellersData);
    console.log('Loading state:', isLoading);
  }, [overviewData, bestSellersData, isLoading]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'insights':
        return (
          <div className="space-y-8">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading analytics data...</span>
              </div>
            )}
            
            {/* Real-time Analytics Overview */}
            {!isLoading && flags.LIVE_ANALYTICS && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard
                  title="Total Revenue"
                  value={`$${overviewData.totals.totalRevenue.toLocaleString()}`}
                  icon={<DollarSign size={20} />}
                  trend="+12.5%"
                  trendDirection="up"
                />
                <KpiCard
                  title="Total Orders"
                  value={overviewData.totals.totalOrders.toLocaleString()}
                  icon={<Package size={20} />}
                  trend="+8.2%"
                  trendDirection="up"
                />
                <KpiCard
                  title="Avg Order Value"
                  value={`$${overviewData.totals.avgOrderValue.toFixed(2)}`}
                  icon={<TrendingUp size={20} />}
                  trend="+5.1%"
                  trendDirection="up"
                />
              </div>
            )}
            
            {/* AI Summary Builder - This Month's Performance */}
            <AISummaryBuilder />
            
            {/* AI Forecasting Widget */}
            <AIForecastWidget />
            
            {/* New Trend Chart */}
            <TrendChartNew />
            
            {/* Original Trend Chart */}
            <TrendChart />
            
            {/* Conversion Funnel */}
            <ConversionFunnel />
            
            {/* Enhanced Best Sellers with Filters */}
            <EnhancedBestSellers 
              onProductClick={(product) => {
                setSelectedProduct({ id: product.productId, name: product.name });
                setIsProductModalOpen(true);
              }}
            />
            
            {/* Product Performance */}
            <PerformanceKpis />
            
            {/* Customer Insights */}
            <CustomerInsights />
          </div>
        );
      
      case 'financials':
        return <FinancialsTab vendorId={vendorId} />;
      
      case 'taxes':
        return (
          <div className="space-y-8">
            {/* Tax Summary */}
            <TaxSummary />
          </div>
        );
      
      case 'pricing':
        return (
          <div className="space-y-8">
            {/* Price Optimizer */}
            <PriceOptimizer />
          </div>
        );
      
      case 'portfolio':
        return (
          <div className="space-y-8">
            {/* Portfolio Builder */}
            <PortfolioBuilder />
          </div>
        );
      
      default:
        return null;
    }
  };

  const getTabDisplayName = (tab: TabType) => {
    switch (tab) {
      case 'insights': return 'Insights';
      case 'financials': return 'Financials';
      case 'taxes': return 'Taxes';
      case 'pricing': return 'Pricing Optimizer';
      case 'portfolio': return 'Portfolio Builder';
      default: return 'Insights';
    }
  };

  return (
    <VendorDashboardLayout>
      <div className="p-6 space-y-6 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs />
          <div className="bg-[#F7F2EC] rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Currently viewing: <span className="font-semibold text-[#5B6E02]">{getTabDisplayName(activeTab)}</span>
                </p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#5B6E02] text-white">
                  {getTabDisplayName(activeTab)}
                </div>
              </div>
            </div>
            <InspirationalQuote />
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'insights', label: 'Insights', icon: '📊' },
                  { id: 'financials', label: 'Financials', icon: '💰' },
                  { id: 'taxes', label: 'Taxes', icon: '📋' },
                  { id: 'pricing', label: 'Pricing Optimizer', icon: '🎯' },
                  { id: 'portfolio', label: 'Portfolio Builder', icon: '📈' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      const newUrl = tab.id === 'insights' 
                        ? '/dashboard/vendor/analytics'
                        : `/dashboard/vendor/analytics?tab=${tab.id}`;
                      window.history.pushState({}, '', newUrl);
                      setActiveTab(tab.id as TabType);
                    }}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-[#5B6E02] text-[#5B6E02]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
          
          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {mockKpis.map((kpi, idx) => (
              <KpiCard 
                key={idx} 
                label={kpi.label}
                value={kpi.value}
                delta={kpi.delta}
                icon={icons[idx]}
              />
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="tab-content">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B6E02] mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading analytics data...</p>
                </div>
              </div>
            ) : (
              renderTabContent()
            )}
          </div>
        </div>
      </div>
      
      {/* Product Deep Dive Modal */}
      {selectedProduct && (
        <ProductDeepDiveModal
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false);
            setSelectedProduct(null);
          }}
          vendorId={vendorId}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
        />
      )}
    </VendorDashboardLayout>
  );
} 