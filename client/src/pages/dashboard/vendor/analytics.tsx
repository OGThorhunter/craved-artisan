// pages/dashboard/vendor/analytics.tsx
import { useState } from "react";
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import { KpiCard } from "@/components/vendor/analytics/KpiCard";
import { TrendChart } from "@/components/vendor/analytics/TrendChart";
import { ConversionFunnel } from "@/components/vendor/analytics/ConversionFunnel";
import { BestSellers } from "@/components/vendor/analytics/BestSellers";
import { BestSellersList } from "@/components/vendor/analytics/BestSellersList";
import { PerformanceKpis } from "@/components/vendor/analytics/PerformanceKpis";
import { CustomerInsights } from "@/components/vendor/analytics/CustomerInsights";
import { ProfitLossStatement } from "@/components/vendor/analytics/ProfitLossStatement";
import { CashFlowChart } from "@/components/vendor/analytics/CashFlowChart";
import { BalanceSheet } from "@/components/vendor/analytics/BalanceSheet";
import { PortfolioBuilder } from "@/components/vendor/analytics/PortfolioBuilder";
import { PriceOptimizer } from "@/components/vendor/analytics/PriceOptimizer";
import { TaxSummary } from "@/components/vendor/analytics/TaxSummary";
import { mockKpis } from "@/mock/analyticsData";
import { DollarSign, TrendingUp, Package, Users, Receipt, Briefcase, BarChart3, Lightbulb, Tag } from "lucide-react";

type TabType = 'insights' | 'financials' | 'taxes' | 'pricing' | 'portfolio';

export default function VendorAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('insights');

  const icons = [
    <DollarSign key="revenue" size={20} />,
    <DollarSign key="monthly" size={20} />,
    <TrendingUp key="avg" size={20} />,
    <Package key="orders" size={20} />,
  ];

  const tabs = [
    { id: 'insights' as TabType, label: 'Insights', icon: Lightbulb },
    { id: 'financials' as TabType, label: 'Financials', icon: BarChart3 },
    { id: 'taxes' as TabType, label: 'Taxes', icon: Receipt },
    { id: 'pricing' as TabType, label: 'Pricing Optimizer', icon: Tag },
    { id: 'portfolio' as TabType, label: 'Portfolio Builder', icon: Briefcase },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'insights':
        return (
          <div className="space-y-8">
            {/* Trend Chart */}
            <TrendChart />
            
            {/* Conversion Funnel */}
            <ConversionFunnel />
            
            {/* Best Sellers List */}
            <BestSellers />
            
            {/* Best Sellers Compact List */}
            <BestSellersList />
            
            {/* Product Performance */}
            <PerformanceKpis />
            
            {/* Customer Insights */}
            <CustomerInsights />
          </div>
        );
      
      case 'financials':
        return (
          <div className="space-y-8">
            {/* Profit Loss Statement */}
            <ProfitLossStatement />
            
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

  return (
    <VendorDashboardLayout>
      <div className="p-6 space-y-6 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-[#333] mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600 mb-6">Track your business performance and key metrics</p>
          
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
          
          {/* Tab Navigation */}
          <div className="bg-[#F7F2EC] rounded-lg p-4 mb-8 shadow-sm">
            <nav className="flex space-x-6 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 py-3 px-4 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 min-w-fit
                      ${activeTab === tab.id
                        ? 'bg-[#5B6E02] text-white shadow-md transform scale-105'
                        : 'bg-white text-[#333] hover:bg-[#5B6E02] hover:text-white hover:shadow-md hover:transform hover:scale-105 border border-gray-200'
                      }
                    `}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="tab-content">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </VendorDashboardLayout>
  );
} 