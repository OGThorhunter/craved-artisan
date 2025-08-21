import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calculator, FileText } from 'lucide-react';

interface ProfitLossData {
  period: {
    from: string;
    to: string;
  };
  revenue: {
    grossSales: number;
    returns: number;
    discounts: number;
    netSales: number;
  };
  cogs: {
    directMaterials: number;
    directLabor: number;
    manufacturingOverhead: number;
    totalCogs: number;
  };
  grossProfit: number;
  operatingExpenses: {
    marketing: number;
    sales: number;
    admin: number;
    technology: number;
    total: number;
  };
  ebitda: number;
  interest: number;
  taxes: number;
  netIncome: number;
}

interface ProfitLossStatementProps {
  data: ProfitLossData;
}

export function ProfitLossStatement({ data }: ProfitLossStatementProps) {
  const {
    period,
    revenue,
    cogs,
    grossProfit,
    operatingExpenses,
    ebitda,
    interest,
    taxes,
    netIncome
  } = data;

  const grossMargin = (grossProfit / revenue.netSales) * 100;
  const operatingMargin = (ebitda / revenue.netSales) * 100;
  const netMargin = (netIncome / revenue.netSales) * 100;

  const formatCurrency = (amount: number) => `$${Math.abs(amount).toLocaleString()}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calculator className="h-8 w-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">Profit & Loss Statement</h2>
              <p className="text-blue-100">
                {new Date(period.from).toLocaleDateString()} - {new Date(period.to).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              {netIncome >= 0 ? '+' : ''}{formatCurrency(netIncome)}
            </div>
            <div className="text-blue-100">Net Income</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Revenue Section */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Revenue
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-green-700">Gross Sales</span>
                <span className="font-semibold text-green-800">{formatCurrency(revenue.grossSales)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Returns & Refunds</span>
                <span>-{formatCurrency(revenue.returns)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Discounts & Promotions</span>
                <span>-{formatCurrency(revenue.discounts)}</span>
              </div>
              <div className="border-t border-green-300 pt-2 flex justify-between">
                <span className="font-semibold text-green-800">Net Sales</span>
                <span className="text-xl font-bold text-green-800">{formatCurrency(revenue.netSales)}</span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Key Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Gross Margin</span>
                  <span className="font-semibold">{formatPercentage(grossMargin)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Operating Margin</span>
                  <span className="font-semibold">{formatPercentage(operatingMargin)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Margin</span>
                  <span className="font-semibold">{formatPercentage(netMargin)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COGS Section */}
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
            <TrendingDown className="h-5 w-5 mr-2" />
            Cost of Goods Sold
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-red-700">Direct Materials</span>
                <span className="font-semibold text-red-800">{formatCurrency(cogs.directMaterials)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-700">Direct Labor</span>
                <span className="font-semibold text-red-800">{formatCurrency(cogs.directLabor)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-700">Manufacturing Overhead</span>
                <span className="font-semibold text-red-800">{formatCurrency(cogs.manufacturingOverhead)}</span>
              </div>
              <div className="border-t border-red-300 pt-2 flex justify-between">
                <span className="font-semibold text-red-800">Total COGS</span>
                <span className="text-xl font-bold text-red-800">{formatCurrency(cogs.totalCogs)}</span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">COGS Analysis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Materials %</span>
                  <span>{((cogs.directMaterials / cogs.totalCogs) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Labor %</span>
                  <span>{((cogs.directLabor / cogs.totalCogs) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Overhead %</span>
                  <span>{((cogs.manufacturingOverhead / cogs.totalCogs) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gross Profit */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-blue-800">Gross Profit</h3>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-800">{formatCurrency(grossProfit)}</div>
              <div className="text-sm text-blue-600">Margin: {formatPercentage(grossMargin)}</div>
            </div>
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <h3 className="text-lg font-semibold text-orange-800 mb-3">Operating Expenses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-orange-700">Marketing & Advertising</span>
                <span className="font-semibold text-orange-800">{formatCurrency(operatingExpenses.marketing)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-700">Sales & Commissions</span>
                <span className="font-semibold text-orange-800">{formatCurrency(operatingExpenses.sales)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-700">Administrative</span>
                <span className="font-semibold text-orange-800">{formatCurrency(operatingExpenses.admin)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-700">Technology & IT</span>
                <span className="font-semibold text-orange-800">{formatCurrency(operatingExpenses.technology)}</span>
              </div>
              <div className="border-t border-orange-300 pt-2 flex justify-between">
                <span className="font-semibold text-orange-800">Total Operating Expenses</span>
                <span className="text-xl font-bold text-orange-800">{formatCurrency(operatingExpenses.total)}</span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">Expense Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Marketing %</span>
                  <span>{((operatingExpenses.marketing / operatingExpenses.total) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Sales %</span>
                  <span>{((operatingExpenses.sales / operatingExpenses.total) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Admin %</span>
                  <span>{((operatingExpenses.admin / operatingExpenses.total) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Technology %</span>
                  <span>{((operatingExpenses.technology / operatingExpenses.total) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* EBITDA */}
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-purple-800">EBITDA</h3>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-800">{formatCurrency(ebitda)}</div>
              <div className="text-sm text-purple-600">Margin: {formatPercentage(operatingMargin)}</div>
            </div>
          </div>
        </div>

        {/* Other Items */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Other Items</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-800">{formatCurrency(interest)}</div>
              <div className="text-sm text-gray-600">Interest Expense</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-800">{formatCurrency(taxes)}</div>
              <div className="text-sm text-gray-600">Income Taxes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-800">{formatCurrency(netIncome)}</div>
              <div className="text-sm text-gray-600">Net Income</div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8" />
              <div>
                <h3 className="text-xl font-bold">Financial Summary</h3>
                <p className="text-gray-300">Period: {new Date(period.from).toLocaleDateString()} - {new Date(period.to).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {netIncome >= 0 ? '+' : ''}{formatCurrency(netIncome)}
              </div>
              <div className="text-gray-300">Net Income</div>
              <div className="text-sm text-gray-400">Margin: {formatPercentage(netMargin)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
