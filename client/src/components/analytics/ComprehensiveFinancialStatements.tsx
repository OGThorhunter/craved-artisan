import React, { useState } from 'react';
// Card usage removed - using simple div structure instead
import { Button } from '@/components/ui';
import { ProfitLossStatement } from './ProfitLossStatement';
import { BalanceSheetStatement } from './BalanceSheetStatement';
import { CashFlowStatement } from './CashFlowStatement';
import { AccountsReceivableManagement } from './AccountsReceivableManagement';
import { AccountsPayableManagement } from './AccountsPayableManagement';
import { RecurringManager } from './RecurringManager';
import { ComprehensiveFinancialsData } from '@/hooks/analytics/useFinancials';

type StatementTab = 'overview' | 'profit-loss' | 'balance-sheet' | 'cash-flow' | 'ar' | 'ap' | 'recurring';

interface Props {
  data: ComprehensiveFinancialsData;
  vendorId: string;
}

export function ComprehensiveFinancialStatements({ data, vendorId }: Props) {
  const [activeTab, setActiveTab] = useState<StatementTab>('overview');
  const [showCharts, setShowCharts] = useState(true);

  const tabs: Array<{ id: StatementTab; label: string; icon?: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'profit-loss', label: 'Profit & Loss' },
    { id: 'balance-sheet', label: 'Balance Sheet' },
    { id: 'cash-flow', label: 'Cash Flow' },
    { id: 'ar', label: 'Accounts Receivable' },
    { id: 'ap', label: 'Accounts Payable' },
    { id: 'recurring', label: 'Recurring Entries' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Revenue</h3>
                <div className="text-3xl font-bold text-green-600">
                  ${data.profitLoss.revenue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Net Income</h3>
                <div className="text-3xl font-bold text-blue-600">
                  ${data.profitLoss.netIncome.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Net Profit</div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cash Position</h3>
                <div className="text-3xl font-bold text-purple-600">
                  ${data.balanceSheet.cash.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Available Cash</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gross Margin</span>
                    <span className="font-semibold">
                      {((data.profitLoss.grossProfit / data.profitLoss.revenue) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Net Margin</span>
                    <span className="font-semibold">
                      {((data.profitLoss.netIncome / data.profitLoss.revenue) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Ratio</span>
                    <span className="font-semibold">
                      {(data.balanceSheet.currentAssets / data.balanceSheet.currentLiabilities).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Debt-to-Equity</span>
                    <span className="font-semibold">
                      {(data.balanceSheet.totalLiabilities / data.balanceSheet.equity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-[#5B6E02] hover:bg-[#4A5A01]"
                      onClick={() => setActiveTab('recurring')}
                    >
                      Manage Recurring Entries
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveTab('ar')}
                    >
                      View AR Summary
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveTab('ap')}
                    >
                      View AP Summary
                    </Button>
                  </div>
              </div>
            </div>
          </div>
        );

      case 'profit-loss':
        return <ProfitLossStatement data={data.profitLoss} />;

      case 'balance-sheet':
        return <BalanceSheetStatement data={data.balanceSheet} />;

      case 'cash-flow':
        return <CashFlowStatement data={data.cashFlow} />;

      case 'ar':
        return <AccountsReceivableManagement data={data.accountsReceivable} />;

      case 'ap':
        return <AccountsPayableManagement data={data.accountsPayable} />;

      case 'recurring':
        return <RecurringManager vendorId={vendorId} />;

      default:
        return <div>Select a tab to view financial data</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Comprehensive Financial Statements</h1>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showCharts}
              onChange={(e) => setShowCharts(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Show Charts</span>
          </label>
          <Button variant="outline">Export PDF</Button>
          <Button variant="outline">Export Excel</Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-[#5B6E02] text-[#5B6E02]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>
    </div>
  );
}
