import React from 'react';
import { VendorFinancialDashboard } from '../components/VendorFinancialDashboard';
import { ProfitLossTable } from '../components/ProfitLossTable';
import { FreeCashFlowTable } from '../components/FreeCashFlowTable';
import { BalanceSheetTable } from '../components/BalanceSheetTable';

export const VendorFinancialPage: React.FC = () => {
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vendor Financial Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive financial tracking and reporting for vendors
          </p>
        </div>

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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Profit & Loss Tracking</h3>
              <p className="text-gray-600">
                Monitor revenue, costs, and profitability with detailed breakdowns and visual indicators.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Cash Flow Analysis</h3>
              <p className="text-gray-600">
                Track operating, investing, and financing cash flows to understand liquidity.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Balance Sheet</h3>
              <p className="text-gray-600">
                View assets, liabilities, and equity with automatic balance validation.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Time Range Filtering</h3>
              <p className="text-gray-600">
                Analyze data by monthly, quarterly, or yearly periods with easy switching.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Snapshot Generation</h3>
              <p className="text-gray-600">
                Automatically generate financial snapshots with real-time data calculations.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Historical Tracking</h3>
              <p className="text-gray-600">
                View historical snapshots and track financial performance over time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 