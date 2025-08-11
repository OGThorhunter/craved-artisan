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

type TabType = 'insights' | 'financials' | 'taxes' | 'pricing' | 'portfolio';

export default function VendorAnalyticsPage() {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('insights');

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'insights':
        return (
          <div className="space-y-8">
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
            <EnhancedBestSellers />
            
            {/* Product Performance */}
            <PerformanceKpis />
            
            {/* Customer Insights */}
            <CustomerInsights />
          </div>
        );
      
      case 'financials':
        return (
          <div className="space-y-8">
            {/* Interactive Cash Flow */}
            <InteractiveCashFlow />
            
            {/* Profit Loss Statement */}
            <EnhancedProfitLoss />
            
            {/* Cash Flow Chart */}
            <CashFlowChart />
            
            {/* Balance Sheet */}
            <BalanceSheet />
          </div>
        );
      
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
            {/* Debug Info - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
                <div className="font-bold text-yellow-800 mb-2">🔍 Debug Info:</div>
                <div className="text-sm text-yellow-700">
                  <div>Active Tab: <span className="font-mono">{activeTab}</span></div>
                  <div>Current URL: <span className="font-mono">{location}</span></div>
                  <div>Tab Display Name: <span className="font-mono">{getTabDisplayName(activeTab)}</span></div>
                </div>
              </div>
            )}
            {renderTabContent()}
          </div>
        </div>
      </div>
    </VendorDashboardLayout>
  );
} 