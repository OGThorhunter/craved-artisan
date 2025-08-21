import React from 'react';
import { DollarSign, TrendingUp, Package, BarChart3 } from 'lucide-react';

interface FinancialsData {
  kpis: {
    revenue: number;
    profit: number;
    orders: number;
    avgOrderValue: number;
  };
  series: Array<{
    date: string;
    revenue: number;
    profit: number;
    orders: number;
  }>;
}

interface FinancialsPanelProps {
  data: FinancialsData;
}

export function FinancialsPanel({ data }: FinancialsPanelProps) {
  const { kpis, series } = data;

  const icons = [
    <DollarSign key="revenue" size={20} />,
    <TrendingUp key="profit" size={20} />,
    <Package key="orders" size={20} />,
    <BarChart3 key="avgOrder" size={20} />,
  ];

  const kpiItems = [
    { label: 'Total Revenue', value: `$${kpis.revenue.toLocaleString()}`, icon: icons[0] },
    { label: 'Total Profit', value: `$${kpis.profit.toLocaleString()}`, icon: icons[1] },
    { label: 'Total Orders', value: kpis.orders.toLocaleString(), icon: icons[2] },
    { label: 'Avg Order Value', value: `$${kpis.avgOrderValue.toFixed(2)}`, icon: icons[3] },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financial Dashboard</h2>
          <p className="text-gray-600">Track your revenue, profit, and order metrics</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiItems.map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600">{item.icon}</div>
              <span className="text-xs text-green-600">+12.5%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{item.value}</div>
            <div className="text-sm text-gray-600">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Trends</h3>
        <div className="h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Chart component will be implemented here</p>
            <p className="text-sm text-gray-400">{series.length} data points available</p>
          </div>
        </div>
      </div>

      {/* Data Summary */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Data Points</p>
            <p className="text-2xl font-bold text-gray-900">{series.length}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Date Range</p>
            <p className="text-2xl font-bold text-gray-900">
              {series.length > 0 ? `${series[0].date} - ${series[series.length - 1].date}` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">
              ${series.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
