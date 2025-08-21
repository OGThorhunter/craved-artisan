import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calculator, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface CashFlowData {
  period: {
    from: string;
    to: string;
  };
  operating: {
    netIncome: number;
    depreciation: number;
    changesInWorkingCapital: number;
    netOperatingCashFlow: number;
  };
  investing: {
    capitalExpenditures: number;
    assetSales: number;
    netInvestingCashFlow: number;
  };
  financing: {
    debtIssuance: number;
    debtRepayment: number;
    dividends: number;
    netFinancingCashFlow: number;
  };
  netCashFlow: number;
  beginningCash: number;
  endingCash: number;
}

interface CashFlowStatementProps {
  data: CashFlowData;
}

export function CashFlowStatement({ data }: CashFlowStatementProps) {
  const {
    period,
    operating,
    investing,
    financing,
    netCashFlow,
    beginningCash,
    endingCash
  } = data;
  
  const formatCurrency = (amount: number) => `$${Math.abs(amount).toLocaleString()}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  
  const operatingCashFlowRatio = operating.netOperatingCashFlow / Math.abs(investing.capitalExpenditures);
  const cashFlowCoverage = operating.netOperatingCashFlow / Math.abs(financing.debtRepayment);
  const freeCashFlow = operating.netOperatingCashFlow + investing.netInvestingCashFlow;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-8 w-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">Cash Flow Statement</h2>
              <p className="text-purple-100">
                {new Date(period.from).toLocaleDateString()} - {new Date(period.to).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow)}
            </div>
            <div className="text-purple-100">Net Cash Flow</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Operating Activities */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Operating Activities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-green-700">Net Income</span>
                <span className="font-semibold text-green-800">{formatCurrency(operating.netIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Depreciation & Amortization</span>
                <span className="font-semibold text-green-800">{formatCurrency(operating.depreciation)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Changes in Working Capital</span>
                <span className={`font-semibold ${operating.changesInWorkingCapital >= 0 ? 'text-green-800' : 'text-red-600'}`}>
                  {operating.changesInWorkingCapital >= 0 ? '+' : ''}{formatCurrency(operating.changesInWorkingCapital)}
                </span>
              </div>
              <div className="border-t border-green-300 pt-2 flex justify-between">
                <span className="font-semibold text-green-800">Net Operating Cash Flow</span>
                <span className="text-xl font-bold text-green-800">{formatCurrency(operating.netOperatingCashFlow)}</span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Operating Analysis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Cash Flow Quality</span>
                  <span className="font-semibold">
                    {operating.netOperatingCashFlow > operating.netIncome ? 'High' : 'Low'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Working Capital Impact</span>
                  <span className={`font-semibold ${operating.changesInWorkingCapital >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {operating.changesInWorkingCapital >= 0 ? 'Positive' : 'Negative'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Depreciation %</span>
                  <span className="font-semibold">
                    {((operating.depreciation / operating.netOperatingCashFlow) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Investing Activities */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
            <TrendingDown className="h-5 w-5 mr-2" />
            Investing Activities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-red-600">
                <span className="text-blue-700">Capital Expenditures</span>
                <span className="font-semibold">-{formatCurrency(investing.capitalExpenditures)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span className="text-blue-700">Asset Sales</span>
                <span className="font-semibold">+{formatCurrency(investing.assetSales)}</span>
              </div>
              <div className="border-t border-blue-300 pt-2 flex justify-between">
                <span className="font-semibold text-blue-800">Net Investing Cash Flow</span>
                <span className={`text-xl font-bold ${investing.netInvestingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {investing.netInvestingCashFlow >= 0 ? '+' : ''}{formatCurrency(investing.netInvestingCashFlow)}
                </span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Investing Analysis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Investment Intensity</span>
                  <span className="font-semibold">
                    {((investing.capitalExpenditures / operating.netOperatingCashFlow) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Asset Turnover</span>
                  <span className="font-semibold">
                    {investing.assetSales > 0 ? 'Active' : 'Passive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Growth Focus</span>
                  <span className="font-semibold">
                    {investing.capitalExpenditures > investing.assetSales ? 'High' : 'Low'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financing Activities */}
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
            <ArrowUpRight className="h-5 w-5 mr-2" />
            Financing Activities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-green-600">
                <span className="text-orange-700">Debt Issuance</span>
                <span className="font-semibold">+{formatCurrency(financing.debtIssuance)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span className="text-orange-700">Debt Repayment</span>
                <span className="font-semibold">-{formatCurrency(financing.debtRepayment)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span className="text-orange-700">Dividends</span>
                <span className="font-semibold">-{formatCurrency(financing.dividends)}</span>
              </div>
              <div className="border-t border-orange-300 pt-2 flex justify-between">
                <span className="font-semibold text-orange-800">Net Financing Cash Flow</span>
                <span className={`text-xl font-bold ${financing.netFinancingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {financing.netFinancingCashFlow >= 0 ? '+' : ''}{formatCurrency(financing.netFinancingCashFlow)}
                </span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">Financing Analysis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Debt Management</span>
                  <span className="font-semibold">
                    {financing.debtIssuance > financing.debtRepayment ? 'Net Borrowing' : 'Net Repayment'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Dividend Policy</span>
                  <span className="font-semibold">
                    {financing.dividends > 0 ? 'Active' : 'Conservative'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cash Flow Coverage</span>
                  <span className="font-semibold">
                    {cashFlowCoverage > 1 ? 'Strong' : 'Weak'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Net Cash Flow */}
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-purple-800">Net Cash Flow</h3>
            <div className="text-right">
              <div className={`text-3xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow)}
              </div>
              <div className="text-sm text-purple-600">
                {netCashFlow >= 0 ? 'Positive Cash Flow' : 'Negative Cash Flow'}
              </div>
            </div>
          </div>
        </div>

        {/* Cash Position */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Cash Position</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-gray-800">{formatCurrency(beginningCash)}</div>
              <div className="text-sm text-gray-600">Beginning Cash</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <div className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow)}
              </div>
              <div className="text-sm text-gray-600">Net Change</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-gray-800">{formatCurrency(endingCash)}</div>
              <div className="text-sm text-gray-600">Ending Cash</div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
          <h3 className="text-lg font-semibold text-indigo-800 mb-3 flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Key Cash Flow Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-indigo-200 text-center">
              <div className="text-2xl font-bold text-green-600">{operatingCashFlowRatio.toFixed(2)}</div>
              <div className="text-sm text-indigo-600">Operating CF Ratio</div>
              <div className="text-xs text-gray-500">
                {operatingCashFlowRatio > 1 ? 'Strong' : 'Weak'}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-indigo-200 text-center">
              <div className="text-2xl font-bold text-blue-600">{cashFlowCoverage.toFixed(2)}</div>
              <div className="text-sm text-indigo-600">Cash Flow Coverage</div>
              <div className="text-xs text-gray-500">
                {cashFlowCoverage > 1 ? 'Adequate' : 'Insufficient'}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-indigo-200 text-center">
              <div className={`text-2xl font-bold ${freeCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {freeCashFlow >= 0 ? '+' : ''}{formatCurrency(freeCashFlow)}
              </div>
              <div className="text-sm text-indigo-600">Free Cash Flow</div>
              <div className="text-xs text-gray-500">
                {freeCashFlow >= 0 ? 'Positive' : 'Negative'}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-indigo-200 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {((operating.netOperatingCashFlow / operating.netIncome) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-indigo-600">Cash Conversion</div>
              <div className="text-xs text-gray-500">Efficiency</div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8" />
              <div>
                <h3 className="text-xl font-bold">Cash Flow Summary</h3>
                <p className="text-gray-300">
                  Period: {new Date(period.from).toLocaleDateString()} - {new Date(period.to).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow)}
              </div>
              <div className="text-gray-300">Net Cash Flow</div>
              <div className="text-sm text-gray-400">
                Operating: {formatCurrency(operating.netOperatingCashFlow)} | 
                Investing: {formatCurrency(investing.netInvestingCashFlow)} | 
                Financing: {formatCurrency(financing.netFinancingCashFlow)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
