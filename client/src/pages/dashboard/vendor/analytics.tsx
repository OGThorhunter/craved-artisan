// pages/dashboard/vendor/analytics.tsx
import { useState, useEffect } from "react";
import { useLocation } from 'wouter';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import { useUrlTab } from '@/hooks/useUrlTab';
import ConversionFunnel from "@/components/analytics/ConversionFunnel";
import EnhancedBestSellers from "@/components/analytics/EnhancedBestSellers";
import { CustomerInsights } from "@/components/vendor/analytics/CustomerInsights";
import { PortfolioBuilder } from "@/components/vendor/analytics/PortfolioBuilder";
import StripeTaxDashboard from "@/components/stripe/StripeTaxDashboard";
import TrendChart from "@/components/charts/TrendChart";
import MotivationalQuote from "@/components/dashboard/MotivationalQuote";
import { getQuoteByCategory } from "@/data/motivationalQuotes";
// Removed: AIForecastWidget and AISummaryBuilder imports (components removed per user request)
import { DollarSign, TrendingUp, Package } from "lucide-react";
import { flags } from "@/lib/flags";
import { 
  useVendorOverview, 
  useVendorBestSellers,
  useMockVendorOverview,
  useMockVendorBestSellers 
} from "@/hooks/analytics";
// Removed useFinancials import - no longer needed for Business Snapshot
import ProductDeepDiveModal from "@/components/ProductDeepDiveModal";
// Removed unused imports

import { BusinessSnapshot } from "@/components/analytics/BusinessSnapshot";

type TabType = 'insights' | 'financial-statements' | 'taxes' | 'pricing' | 'portfolio';

export default function VendorAnalyticsPage() {
  const [location] = useLocation();
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  
  // Use real vendor ID from context or mock for development
  const vendorId = 'dev-user-id'; // This should come from auth context in production
  
  // Define allowed tabs with feature flag support
  const TABS: TabType[] = ['insights', 'financial-statements', 'taxes', 'pricing', 'portfolio'];
  const { tab: activeTab, setTab, allowed: allowedTabs } = useUrlTab(
    TABS,
    'insights',
    { 
      'financial-statements': flags.LIVE_ANALYTICS && flags.FINANCIALS
    }
  );
  
  // Debug tab changes
  useEffect(() => {
    console.log('=== TAB CHANGE DEBUG ===');
    console.log('Active tab changed to:', activeTab);
    console.log('Current URL:', window.location.href);
  }, [activeTab]);
  
  // Analytics data fetching with feature flag support
  const overviewQuery = useVendorOverview(vendorId, { interval: 'day' });
  const mockOverviewQuery = useMockVendorOverview(vendorId, { interval: 'day' });
    
  const bestSellersQuery = useVendorBestSellers(vendorId, { limit: 10 });
  const mockBestSellersQuery = useMockVendorBestSellers(vendorId, { limit: 10 });


  
  // Business Snapshot handles its own data fetching
  
  // Extract data with safe defaults based on feature flags
  const overviewData = flags.LIVE_ANALYTICS 
    ? (overviewQuery.data || { totals: { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 }, series: [] })
    : (mockOverviewQuery.data || { totals: { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 }, series: [] });
  
  const bestSellersData = flags.LIVE_ANALYTICS
    ? (bestSellersQuery.data || { items: [] })
    : (mockBestSellersQuery.data || { items: [] });
  
  // Loading states based on feature flags
  const isLoading = flags.LIVE_ANALYTICS
    ? (overviewQuery.isLoading || bestSellersQuery.isLoading)
    : (mockOverviewQuery.isLoading || mockBestSellersQuery.isLoading);

  // Debug information for development
  useEffect(() => {
    console.log('=== ANALYTICS PAGE DEBUG ===');
    console.log('Location changed to:', location);
    console.log('Active tab:', activeTab);
    console.log('Feature flag LIVE_ANALYTICS:', flags.LIVE_ANALYTICS);
    console.log('Feature flag FINANCIALS:', flags.FINANCIALS);
    console.log('Allowed tabs:', allowedTabs);
    console.log('Current URL:', window.location.href);
  }, [location, activeTab, allowedTabs]);

  // Removed unused icons array
  
  // Debug information
  useEffect(() => {
    console.log('=== ANALYTICS DATA DEBUG ===');
    console.log('Feature flag LIVE_ANALYTICS:', flags.LIVE_ANALYTICS);
    console.log('Feature flag FINANCIALS:', flags.FINANCIALS);
    console.log('Overview data:', overviewData);
    console.log('Best sellers data:', bestSellersData);
    console.log('Loading state:', isLoading);
    // Business Snapshot handles its own data fetching
  }, [overviewData, bestSellersData, isLoading]);

  const renderTabContent = () => {
    console.log('=== RENDER TAB CONTENT DEBUG ===');
    console.log('Active tab:', activeTab);
    console.log('Rendering content for tab:', activeTab);
    
    switch (activeTab) {
      case 'insights':
        console.log('Rendering insights tab content');
        return (
          <div className="space-y-8">
            {/* Loading State */}
            {isLoading && (
              <div className="bg-[#F7F2EC] rounded-lg p-8 border border-gray-200">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5B6E02]"></div>
                  <span className="ml-2 text-gray-600">Loading analytics data...</span>
                </div>
              </div>
            )}
            
            {/* Real-time Analytics Overview */}
            {!isLoading && flags.LIVE_ANALYTICS && (
              <div className="bg-[#F7F2EC] rounded-lg shadow-xl border border-gray-200 p-6 mb-8 hover:shadow-2xl transition-shadow duration-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Analytics Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-gray-600"><DollarSign size={20} /></div>
                      <span className="text-xs text-green-600">+12.5%</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">${overviewData.totals.totalRevenue.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-gray-600"><Package size={20} /></div>
                      <span className="text-xs text-green-600">+8.2%</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{overviewData.totals.totalOrders.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Orders</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-gray-600"><TrendingUp size={20} /></div>
                      <span className="text-xs text-green-600">+5.1%</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">${overviewData.totals.avgOrderValue.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Avg Order Value</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Removed: AI Summary Builder and AI Forecasting Widget per user request */}
            
            {/* Trend Chart with Revenue Data */}
            {Array.isArray(overviewData?.series) && overviewData.series.length > 0 && (
              <TrendChart data={overviewData.series} xKey="date" yKey="revenue" />
            )}
            
            {/* Conversion Funnel */}
            <ConversionFunnel />
            
            {/* Enhanced Best Sellers with Filters */}
            <EnhancedBestSellers />
            
            
            {/* Customer Insights */}
            <CustomerInsights />
          </div>
        );
      

      
      case 'financial-statements':
        console.log('Rendering business snapshot tab content');
        return <BusinessSnapshot vendorId={vendorId} />;
      
      case 'taxes':
        return (
          <div className="space-y-8">
            {/* Stripe Tax Dashboard */}
            <StripeTaxDashboard />
          </div>
        );
      
      case 'pricing':
        return (
          <div className="space-y-8">
            {/* Pricing & Inventory Insights Moved Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Pricing & Inventory Insights Moved
                  </h3>
                  <p className="text-blue-700 mb-4">
                    AI-powered pricing and inventory insights are now available directly in your workflow:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-2">📦 Products</h4>
                      <p className="text-sm text-gray-600 mb-3">Pricing insights and competitor analysis</p>
                      <button 
                        onClick={() => window.location.href = '/dashboard/vendor/products'}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Products →
                      </button>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-2">📋 Orders</h4>
                      <p className="text-sm text-gray-600 mb-3">Price sensitivity and cart abandonment insights</p>
                      <button 
                        onClick={() => window.location.href = '/dashboard/vendor/orders'}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Orders →
                      </button>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-2">📦 Inventory</h4>
                      <p className="text-sm text-gray-600 mb-3">Stockout alerts and supplier optimization</p>
                      <button 
                        onClick={() => window.location.href = '/dashboard/vendor/inventory'}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Inventory →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
      case 'financial-statements': return 'Business Snapshot';
      case 'taxes': return 'Taxes';
      case 'pricing': return 'Pricing Optimizer';
      case 'portfolio': return 'Portfolio Builder';
      default: return 'Insights';
    }
  };

  return (
    <VendorDashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="bg-[#F7F2EC] rounded-2xl shadow-xl p-6 mb-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
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
            <MotivationalQuote
              quote={getQuoteByCategory('motivation').quote}
              author={getQuoteByCategory('motivation').author}
              icon={getQuoteByCategory('motivation').icon}
              variant={getQuoteByCategory('motivation').variant}
            />
            
            {/* Financial Data Disclaimer */}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Financial Data Disclaimer</p>
                  <p className="mt-1">All financial data displayed is for informational purposes only. Users are responsible for verifying the accuracy and security of their financial information. This dashboard does not constitute financial advice.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-[#F7F2EC] rounded-lg shadow-xl border border-gray-200 mb-6 hover:shadow-2xl transition-shadow duration-300">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'insights', label: 'Insights', icon: '📊', tooltip: 'Sales performance, customer insights, and product analytics' },
                  { id: 'financial-statements' as const, label: 'Business Snapshot', icon: '📊', tooltip: 'Operational metrics, sales funnel, and payout information' },
                  { id: 'taxes', label: 'Taxes', icon: '📋', tooltip: 'Tax calculations, deductions, and reporting for compliance' },
                  { id: 'portfolio', label: 'Portfolio Builder', icon: '📈', tooltip: 'Product portfolio analysis and strategic recommendations' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setTab(tab.id as TabType)}
                    disabled={!allowedTabs.includes(tab.id as TabType)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-[#5B6E02] text-[#5B6E02]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } ${
                      !allowedTabs.includes(tab.id as TabType) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
          

          
          {/* Tab Content */}
          {isLoading ? (
            <div className="bg-[#F7F2EC] rounded-lg py-12 border border-gray-200">
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