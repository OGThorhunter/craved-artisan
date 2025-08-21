import React from 'react';
import { Building2, Calculator, TrendingUp, TrendingDown, Scale, FileText } from 'lucide-react';

interface BalanceSheetData {
  asOf: string;
  assets: {
    current: {
      cash: number;
      accountsReceivable: number;
      inventory: number;
      prepaidExpenses: number;
      totalCurrent: number;
    };
    fixed: {
      equipment: number;
      vehicles: number;
      buildings: number;
      totalFixed: number;
    };
    totalAssets: number;
  };
  liabilities: {
    current: {
      accountsPayable: number;
      shortTermDebt: number;
      accruedExpenses: number;
      totalCurrent: number;
    };
    longTerm: {
      longTermDebt: number;
      deferredTaxes: number;
      totalLongTerm: number;
    };
    totalLiabilities: number;
  };
  equity: {
    commonStock: number;
    retainedEarnings: number;
    totalEquity: number;
  };
}

interface BalanceSheetStatementProps {
  data: BalanceSheetData;
}

export function BalanceSheetStatement({ data }: BalanceSheetStatementProps) {
  const { assets, liabilities, equity } = data;
  
  const formatCurrency = (amount: number) => `$${Math.abs(amount).toLocaleString()}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  
  const currentRatio = assets.current.totalCurrent / liabilities.current.totalCurrent;
  const debtToEquity = liabilities.totalLiabilities / equity.totalEquity;
  const workingCapital = assets.current.totalCurrent - liabilities.current.totalCurrent;
  const assetUtilization = (assets.current.totalCurrent / assets.totalAssets) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">Balance Sheet</h2>
              <p className="text-green-100">As of {new Date(data.asOf).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{formatCurrency(assets.totalAssets)}</div>
            <div className="text-green-100">Total Assets</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Assets Section */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Assets
          </h3>
          
          {/* Current Assets */}
          <div className="mb-4">
            <h4 className="font-semibold text-blue-700 mb-2">Current Assets</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-700">Cash & Cash Equivalents</span>
                  <span className="font-semibold text-blue-800">{formatCurrency(assets.current.cash)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Accounts Receivable</span>
                  <span className="font-semibold text-blue-800">{formatCurrency(assets.current.accountsReceivable)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Inventory</span>
                  <span className="font-semibold text-blue-800">{formatCurrency(assets.current.inventory)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Prepaid Expenses</span>
                  <span className="font-semibold text-blue-800">{formatCurrency(assets.current.prepaidExpenses)}</span>
                </div>
                <div className="border-t border-blue-300 pt-2 flex justify-between">
                  <span className="font-semibold text-blue-800">Total Current Assets</span>
                  <span className="text-xl font-bold text-blue-800">{formatCurrency(assets.current.totalCurrent)}</span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h5 className="font-semibold text-blue-800 mb-2">Current Assets Analysis</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Cash %</span>
                    <span>{((assets.current.cash / assets.current.totalCurrent) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AR %</span>
                    <span>{((assets.current.accountsReceivable / assets.current.totalCurrent) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inventory %</span>
                    <span>{((assets.current.inventory / assets.current.totalCurrent) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prepaid %</span>
                    <span>{((assets.current.prepaidExpenses / assets.current.totalCurrent) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Assets */}
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">Fixed Assets</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-700">Equipment</span>
                  <span className="font-semibold text-blue-800">{formatCurrency(assets.fixed.equipment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Vehicles</span>
                  <span className="font-semibold text-blue-800">{formatCurrency(assets.fixed.vehicles)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Buildings</span>
                  <span className="font-semibold text-blue-800">{formatCurrency(assets.fixed.buildings)}</span>
                </div>
                <div className="border-t border-blue-300 pt-2 flex justify-between">
                  <span className="font-semibold text-blue-800">Total Fixed Assets</span>
                  <span className="text-xl font-bold text-blue-800">{formatCurrency(assets.fixed.totalFixed)}</span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h5 className="font-semibold text-blue-800 mb-2">Fixed Assets Analysis</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Equipment %</span>
                    <span>{((assets.fixed.equipment / assets.fixed.totalFixed) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vehicles %</span>
                    <span>{((assets.fixed.vehicles / assets.fixed.totalFixed) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Buildings %</span>
                    <span>{((assets.fixed.buildings / assets.fixed.totalFixed) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Assets */}
          <div className="border-t border-blue-300 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xl font-bold text-blue-800">Total Assets</h4>
              <span className="text-2xl font-bold text-blue-800">{formatCurrency(assets.totalAssets)}</span>
            </div>
          </div>
        </div>

        {/* Liabilities Section */}
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
            <TrendingDown className="h-5 w-5 mr-2" />
            Liabilities
          </h3>
          
          {/* Current Liabilities */}
          <div className="mb-4">
            <h4 className="font-semibold text-red-700 mb-2">Current Liabilities</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-red-700">Accounts Payable</span>
                  <span className="font-semibold text-red-800">{formatCurrency(liabilities.current.accountsPayable)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700">Short-term Debt</span>
                  <span className="font-semibold text-red-800">{formatCurrency(liabilities.current.shortTermDebt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700">Accrued Expenses</span>
                  <span className="font-semibold text-red-800">{formatCurrency(liabilities.current.accruedExpenses)}</span>
                </div>
                <div className="border-t border-red-300 pt-2 flex justify-between">
                  <span className="font-semibold text-red-800">Total Current Liabilities</span>
                  <span className="text-xl font-bold text-red-800">{formatCurrency(liabilities.current.totalCurrent)}</span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <h5 className="font-semibold text-red-800 mb-2">Current Liabilities Analysis</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>AP %</span>
                    <span>{((liabilities.current.accountsPayable / liabilities.current.totalCurrent) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Short-term Debt %</span>
                    <span>{((liabilities.current.shortTermDebt / liabilities.current.totalCurrent) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accrued %</span>
                    <span>{((liabilities.current.accruedExpenses / liabilities.current.totalCurrent) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Long-term Liabilities */}
          <div>
            <h4 className="font-semibold text-red-700 mb-2">Long-term Liabilities</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-red-700">Long-term Debt</span>
                  <span className="font-semibold text-red-800">{formatCurrency(liabilities.longTerm.longTermDebt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700">Deferred Taxes</span>
                  <span className="font-semibold text-red-800">{formatCurrency(liabilities.longTerm.deferredTaxes)}</span>
                </div>
                <div className="border-t border-red-300 pt-2 flex justify-between">
                  <span className="font-semibold text-red-800">Total Long-term Liabilities</span>
                  <span className="text-xl font-bold text-red-800">{formatCurrency(liabilities.longTerm.totalLongTerm)}</span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <h5 className="font-semibold text-red-800 mb-2">Long-term Analysis</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Long-term Debt %</span>
                    <span>{((liabilities.longTerm.longTermDebt / liabilities.longTerm.totalLongTerm) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deferred Taxes %</span>
                    <span>{((liabilities.longTerm.deferredTaxes / liabilities.longTerm.totalLongTerm) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Liabilities */}
          <div className="border-t border-red-300 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xl font-bold text-red-800">Total Liabilities</h4>
              <span className="text-2xl font-bold text-red-800">{formatCurrency(liabilities.totalLiabilities)}</span>
            </div>
          </div>
        </div>

        {/* Equity Section */}
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
            <Scale className="h-5 w-5 mr-2" />
            Shareholders' Equity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-purple-700">Common Stock</span>
                <span className="font-semibold text-purple-800">{formatCurrency(equity.commonStock)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Retained Earnings</span>
                <span className="font-semibold text-purple-800">{formatCurrency(equity.retainedEarnings)}</span>
              </div>
              <div className="border-t border-purple-300 pt-2 flex justify-between">
                <span className="font-semibold text-purple-800">Total Equity</span>
                <span className="text-xl font-bold text-purple-800">{formatCurrency(equity.totalEquity)}</span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">Equity Analysis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Common Stock %</span>
                  <span>{((equity.commonStock / equity.totalEquity) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Retained Earnings %</span>
                  <span>{((equity.retainedEarnings / equity.totalEquity) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Ratios */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Key Financial Ratios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-blue-600">{currentRatio.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Current Ratio</div>
              <div className="text-xs text-gray-500">
                {currentRatio > 2 ? 'Excellent' : currentRatio > 1.5 ? 'Good' : currentRatio > 1 ? 'Fair' : 'Poor'}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-green-600">{debtToEquity.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Debt-to-Equity</div>
              <div className="text-xs text-gray-500">
                {debtToEquity < 0.5 ? 'Excellent' : debtToEquity < 1 ? 'Good' : debtToEquity < 2 ? 'Fair' : 'High Risk'}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(workingCapital)}</div>
              <div className="text-sm text-gray-600">Working Capital</div>
              <div className="text-xs text-gray-500">
                {workingCapital > 0 ? 'Positive' : 'Negative'}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-orange-600">{formatPercentage(assetUtilization)}</div>
              <div className="text-sm text-gray-600">Asset Utilization</div>
              <div className="text-xs text-gray-500">Current Assets</div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8" />
              <div>
                <h3 className="text-xl font-bold">Balance Sheet Summary</h3>
                <p className="text-gray-300">As of {new Date(data.asOf).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{formatCurrency(assets.totalAssets)}</div>
              <div className="text-gray-300">Total Assets</div>
              <div className="text-sm text-gray-400">
                = {formatCurrency(liabilities.totalLiabilities)} + {formatCurrency(equity.totalEquity)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
