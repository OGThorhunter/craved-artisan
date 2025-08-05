// pages/dashboard/vendor/analytics.tsx
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
import { DollarSign, TrendingUp, Package, Users } from "lucide-react";

export default function VendorAnalyticsPage() {
  const icons = [
    <DollarSign key="revenue" size={20} />,
    <DollarSign key="monthly" size={20} />,
    <TrendingUp key="avg" size={20} />,
    <Package key="orders" size={20} />,
  ];

  return (
    <VendorDashboardLayout>
      <div className="p-6 space-y-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-[#333] mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600 mb-6">Track your business performance and key metrics</p>
          
          {/* 1. KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          
          {/* 2. Trend Chart */}
          <div className="mt-8">
            <TrendChart />
          </div>
          
          {/* 3. Conversion Funnel */}
          <div className="mt-8">
            <ConversionFunnel />
          </div>
          
          {/* 4. Best Sellers List */}
          <div className="mt-8">
            <BestSellers />
          </div>
          
          {/* 4.5. Best Sellers Compact List */}
          <div className="mt-8">
            <BestSellersList />
          </div>
          
          {/* 5. Product Performance */}
          <div className="mt-8">
            <PerformanceKpis />
          </div>
          
          {/* 6. Customer Insights */}
          <div className="mt-8">
            <CustomerInsights />
          </div>
          
          {/* 7. Profit Loss Statement */}
          <div className="mt-8">
            <ProfitLossStatement />
          </div>
          
          {/* 8. Cash Flow Chart */}
          <div className="mt-8">
            <CashFlowChart />
          </div>
          
          {/* 9. Balance Sheet */}
          <div className="mt-8">
            <BalanceSheet />
          </div>
          
          {/* 10. Portfolio Builder */}
          <div className="mt-8">
            <PortfolioBuilder />
          </div>
          
          {/* 11. Price Optimizer */}
          <div className="mt-8">
            <PriceOptimizer />
          </div>
          
          {/* 12. Tax Summary */}
          <div className="mt-8">
            <TaxSummary />
          </div>
        </div>
      </div>
    </VendorDashboardLayout>
  );
} 