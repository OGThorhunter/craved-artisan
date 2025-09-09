import React from 'react';
import { VendorFinancialDashboard } from '../components/VendorFinancialDashboard';
import { ProfitLossTable } from '../components/ProfitLossTable';
import { FreeCashFlowTable } from '../components/FreeCashFlowTable';
import { BalanceSheetTable } from '../components/BalanceSheetTable';
import TaxForecastCard from '../components/TaxForecastCard';
import { useAuth } from '../contexts/AuthContext';
import VendorDashboardLayout from '../layouts/VendorDashboardLayout';
import MotivationalQuote from '../components/dashboard/MotivationalQuote';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { getQuoteByCategory } from '../data/motivationalQuotes';

export const VendorFinancialPage: React.FC = () => {
  const { user } = useAuth();

  // Sample data for demonstration
  const sampleProfitLossData = {
    totalRevenue: 12345,
    cogs: 4000,
    opex: 3000,
    netProfit: 5345,
  };

  const sampleCashFlowData = {
    cashIn: 7000,
    cashOut: 1200,
    investingOutflow: 1200,
    financingInflow: 0,
  };

  const sampleBalanceSheetData = {
    assets: 15000,
    liabilities: 5000,
    equity: 10000,
  };

  return (
    <VendorDashboardLayout>
      <div className="py-8 bg-white min-h-screen">
        <div className="container-responsive">
          {/* Header */}
          <DashboardHeader 
            title="Financial Dashboard"
            description="Comprehensive financial tracking and reporting for your business operations"
          />

          {/* Motivational Quote */}
          <MotivationalQuote
            quote={getQuoteByCategory('success').quote}
            author={getQuoteByCategory('success').author}
            icon={getQuoteByCategory('success').icon}
            variant={getQuoteByCategory('success').variant}
          />
          
          {/* Current View Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Currently viewing: <span className="text-green-600 font-medium">Financial Overview</span></p>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Financial Overview
              </button>
            </div>
          </div>

        {/* Tax Forecast Section */}
        {user && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Tax Forecast & Obligations</h2>
            <TaxForecastCard vendorId={user?.id || 'mock-user-id'} />
          </div>
        )}

        {/* Live API Dashboard */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Live API Dashboard</h2>
          <VendorFinancialDashboard vendorId="vendor-1" />
        </div>

        {/* Component Examples */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Component Examples</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ProfitLossTable data={sampleProfitLossData} />
            <FreeCashFlowTable data={sampleCashFlowData} />
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <BalanceSheetTable data={sampleBalanceSheetData} />
          </div>
        </div>

        {/* Features Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="responsive-subheading text-gray-900 mb-2">Tax Forecast & Alerts</h3>
              <p className="text-gray-600">
                Quarterly tax projections with automated reminders and payment tracking.
              </p>
            </div>
            <div>
              <h3 className="responsive-subheading text-gray-900 mb-2">Profit & Loss Tracking</h3>
              <p className="text-gray-600">
                Monitor revenue, costs, and profitability with detailed breakdowns and visual indicators.
              </p>
            </div>
            <div>
              <h3 className="responsive-subheading text-gray-900 mb-2">Cash Flow Analysis</h3>
              <p className="text-gray-600">
                Track operating, investing, and financing cash flows to understand liquidity.
              </p>
            </div>
            <div>
              <h3 className="responsive-subheading text-gray-900 mb-2">Balance Sheet</h3>
              <p className="text-gray-600">
                View assets, liabilities, and equity with automatic balance validation.
              </p>
            </div>
            <div>
              <h3 className="responsive-subheading text-gray-900 mb-2">Time Range Filtering</h3>
              <p className="text-gray-600">
                Analyze data by monthly, quarterly, or yearly periods with easy switching.
              </p>
            </div>
            <div>
              <h3 className="responsive-subheading text-gray-900 mb-2">Historical Tracking</h3>
              <p className="text-gray-600">
                View historical snapshots and track financial performance over time.
              </p>
            </div>
          </div>
        </div>

        {/* Financial Data Disclaimer */}
        <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-black text-sm font-bold">!</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Data Disclaimer</h3>
              <p className="text-gray-700">
                All financial data displayed is for informational purposes only. Users are responsible for verifying the accuracy and security of their financial information. This dashboard does not constitute financial advice.
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </VendorDashboardLayout>
  );
}; 
