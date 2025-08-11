import React, { useState } from 'react';
import { flags } from '@/lib/flags';
import { 
  useVendorPNL, 
  useVendorCashFlow, 
  useVendorBalanceSheet,
  useMockVendorPNL,
  useMockVendorCashFlow,
  useMockVendorBalanceSheet
} from '@/hooks/financials';
import { DollarSign, TrendingUp, TrendingDown, Download, Calendar, BarChart3 } from 'lucide-react';

interface FinancialsTabProps {
  vendorId: string;
}

export default function FinancialsTab({ vendorId }: FinancialsTabProps) {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'custom'>('month');
  const [customFrom, setCustomFrom] = useState<string>('');
  const [customTo, setCustomTo] = useState<string>('');
  const [cashFlowMethod, setCashFlowMethod] = useState<'direct' | 'indirect'>('direct');
  const [balanceSheetDate, setBalanceSheetDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Calculate date range
  const getDateRange = () => {
    const now = new Date();
    let from: string | undefined;
    let to: string | undefined;

    if (dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      from = weekAgo.toISOString();
      to = now.toISOString();
    } else if (dateRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      from = monthAgo.toISOString();
      to = now.toISOString();
    } else {
      from = customFrom ? new Date(customFrom).toISOString() : undefined;
      to = customTo ? new Date(customTo).toISOString() : undefined;
    }

    return { from, to };
  };

  const { from, to } = getDateRange();

  // Data fetching with feature flag support
  const pnlQuery = flags.FINANCIALS 
    ? useVendorPNL(vendorId, { from, to })
    : useMockVendorPNL(vendorId, { from, to });

  const cashFlowQuery = flags.FINANCIALS
    ? useVendorCashFlow(vendorId, { from, to, method: cashFlowMethod })
    : useMockVendorCashFlow(vendorId, { from, to, method: cashFlowMethod });

  const balanceSheetQuery = flags.FINANCIALS
    ? useVendorBalanceSheet(vendorId, { asOf: balanceSheetDate })
    : useMockVendorBalanceSheet(vendorId, { asOf: balanceSheetDate });

  // Extract data with safe defaults
  const pnlData = pnlQuery.data || {
    revenue: 0, cogs: 0, fees: { platform: 0, stripe: 0, total: 0 },
    grossProfit: 0, expenses: 0, netIncome: 0
  };

  const cashFlowData = cashFlowQuery.data || {
    method: 'direct',
    inflows: { sales: 0 },
    outflows: { cogs: 0, fees: 0 },
    net: 0
  };

  const balanceSheetData = balanceSheetQuery.data || {
    assets: { cash: 0, inventory: 0 },
    liabilities: { payables: 0, taxesPayable: 0 },
    equity: 0
  };

  const isLoading = pnlQuery.isLoading || cashFlowQuery.isLoading || balanceSheetQuery.isLoading;

  // Export functions
  const exportPNL = () => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    window.open(`/api/financials/vendor/${vendorId}/pnl.csv?${params.toString()}`, '_blank');
  };

  const exportCashFlow = () => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    params.append('method', cashFlowMethod);
    window.open(`/api/financials/vendor/${vendorId}/cash-flow.csv?${params.toString()}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading financial data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financial Dashboard</h2>
          <p className="text-gray-600">Track your revenue, expenses, and cash flow</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {flags.FINANCIALS ? 'Live Data' : 'Mock Data'}
          </span>
        </div>
      </div>

      {/* Date Range Controls */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
          </div>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as 'week' | 'month' | 'custom')}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            aria-label="Select date range"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="custom">Custom</option>
          </select>

          {dateRange === 'custom' && (
            <>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                aria-label="Start date"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                aria-label="End date"
              />
            </>
          )}
        </div>
      </div>

      {/* P&L Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ${pnlData.revenue.toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">COGS</p>
              <p className="text-2xl font-bold text-red-600">
                ${pnlData.cogs.toLocaleString()}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gross Profit</p>
              <p className="text-2xl font-bold text-blue-600">
                ${pnlData.grossProfit.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Platform Fees</p>
              <p className="text-2xl font-bold text-orange-600">
                ${pnlData.fees.platform.toLocaleString()}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stripe Fees</p>
              <p className="text-2xl font-bold text-purple-600">
                ${pnlData.fees.stripe.toLocaleString()}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Income</p>
              <p className={`text-2xl font-bold ${pnlData.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${pnlData.netIncome.toLocaleString()}
              </p>
            </div>
            <TrendingUp className={`h-8 w-8 ${pnlData.netIncome >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
        </div>
      </div>

      {/* Cash Flow Section */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Cash Flow</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Method:</span>
            <select
              value={cashFlowMethod}
              onChange={(e) => setCashFlowMethod(e.target.value as 'direct' | 'indirect')}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              aria-label="Select cash flow method"
            >
              <option value="direct">Direct</option>
              <option value="indirect">Indirect</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Inflows</p>
            <p className="text-xl font-bold text-green-600">
              ${cashFlowData.inflows?.sales?.toLocaleString() || '0'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Outflows</p>
            <p className="text-xl font-bold text-red-600">
              ${((cashFlowData.outflows?.cogs || 0) + (cashFlowData.outflows?.fees || 0)).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Net Cash Flow</p>
            <p className={`text-xl font-bold ${cashFlowData.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${cashFlowData.net.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Balance Sheet Section */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Balance Sheet</h3>
          <input
            type="date"
            value={balanceSheetDate}
            onChange={(e) => setBalanceSheetDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            aria-label="Balance sheet date"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Assets</h4>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Cash: ${balanceSheetData.assets.cash.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Inventory: ${balanceSheetData.assets.inventory.toLocaleString()}</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Liabilities</h4>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Payables: ${balanceSheetData.liabilities.payables.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Taxes: ${balanceSheetData.liabilities.taxesPayable.toLocaleString()}</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Equity</h4>
            <p className={`text-lg font-bold ${balanceSheetData.equity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${balanceSheetData.equity.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
        <div className="flex space-x-4">
          <button
            onClick={exportPNL}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export P&L (CSV)</span>
          </button>
          <button
            onClick={exportCashFlow}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Cash Flow (CSV)</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {!pnlData.revenue && !cashFlowData.net && !balanceSheetData.equity && (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Financial Data Available</h3>
          <p className="text-gray-600">
            {flags.FINANCIALS 
              ? "No financial transactions found for the selected period. Try adjusting your date range."
              : "Mock financial data will appear here when available."
            }
          </p>
        </div>
      )}
    </div>
  );
}
