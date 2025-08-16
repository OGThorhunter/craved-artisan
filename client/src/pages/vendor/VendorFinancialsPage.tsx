import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, BarChart3, PieChart, FileText, Download } from 'lucide-react';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';

interface FinancialMetric {
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

const VendorFinancialsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<string>('month');

  // Mock financial data
  const financialMetrics: FinancialMetric[] = [
    {
      label: 'Total Revenue',
      value: '$47,892.50',
      change: '+12.5%',
      changeType: 'positive',
      icon: <DollarSign className="w-6 h-6" />
    },
    {
      label: 'Net Profit',
      value: '$18,456.80',
      change: '+8.2%',
      changeType: 'positive',
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      label: 'Operating Costs',
      value: '$29,435.70',
      change: '+5.1%',
      changeType: 'negative',
      icon: <TrendingDown className="w-6 h-6" />
    },
    {
      label: 'Profit Margin',
      value: '38.6%',
      change: '+2.1%',
      changeType: 'positive',
      icon: <BarChart3 className="w-6 h-6" />
    }
  ];

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'positive': return <TrendingUp className="w-4 h-4" />;
      case 'negative': return <TrendingDown className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  return (
    <VendorDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#2C2C2C]">Financials</h1>
            <p className="text-gray-600 mt-2">Track your revenue, profits, and financial performance</p>
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
              aria-label="Select time range"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button className="bg-[#8B4513] hover:bg-[#A0522D] text-white px-4 py-2 rounded-lg transition-colors border-2 border-black shadow-md hover:shadow-lg flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Financial Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {financialMetrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-[#F7F2EC] text-[#5B6E02]`}>
                  {metric.icon}
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${getChangeColor(metric.changeType)}`}>
                  {getChangeIcon(metric.changeType)}
                  {metric.change}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-[#2C2C2C] mb-2">{metric.label}</h3>
              <p className="text-3xl font-bold text-[#2C2C2C]">{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Revenue Chart Section */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#2C2C2C]">Revenue Trend</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm rounded-lg bg-[#5B6E02] text-white">Daily</button>
              <button className="px-3 py-1 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">Weekly</button>
              <button className="px-3 py-1 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">Monthly</button>
            </div>
          </div>
          
          {/* Placeholder for chart */}
          <div className="h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Revenue chart will be displayed here</p>
              <p className="text-sm text-gray-400">Integration with charting library coming soon</p>
            </div>
          </div>
        </div>

        {/* Detailed Financial Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Revenue Sources */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-[#2C2C2C] mb-4">Top Revenue Sources</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#5B6E02] rounded-full"></div>
                  <span className="font-medium">Artisan Sourdough Bread</span>
                </div>
                <span className="font-semibold text-[#5B6E02]">$12,450.00</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#8B4513] rounded-full"></div>
                  <span className="font-medium">Handmade Soap Bars</span>
                </div>
                <span className="font-semibold text-[#5B6E02]">$8,920.00</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#A0522D] rounded-full"></div>
                  <span className="font-medium">Organic Honey</span>
                </div>
                <span className="font-semibold text-[#5B6E02]">$6,780.00</span>
              </div>
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-[#2C2C2C] mb-4">Expense Breakdown</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium">Ingredients & Materials</span>
                </div>
                <span className="font-semibold text-red-600">$18,240.00</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="font-medium">Packaging & Shipping</span>
                </div>
                <span className="font-semibold text-orange-600">$4,560.00</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">Marketing & Events</span>
                </div>
                <span className="font-semibold text-blue-600">$2,890.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Reports */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-[#2C2C2C] mb-4">Financial Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-[#5B6E02] hover:bg-[#F7F2EC] transition-all duration-300">
              <FileText className="w-6 h-6 text-[#5B6E02]" />
              <div className="text-left">
                <div className="font-semibold text-[#2C2C2C]">Profit & Loss</div>
                <div className="text-sm text-gray-600">Monthly P&L statement</div>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-[#5B6E02] hover:bg-[#F7F2EC] transition-all duration-300">
              <PieChart className="w-6 h-6 text-[#5B6E02]" />
              <div className="text-left">
                <div className="font-semibold text-[#2C2C2C]">Cash Flow</div>
                <div className="text-sm text-gray-600">Cash flow analysis</div>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-[#5B6E02] hover:bg-[#F7F2EC] transition-all duration-300">
              <BarChart3 className="w-6 h-6 text-[#5B6E02]" />
              <div className="text-left">
                <div className="font-semibold text-[#2C2C2C]">Tax Summary</div>
                <div className="text-sm text-gray-600">Tax preparation report</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </VendorDashboardLayout>
  );
};

export default VendorFinancialsPage;
