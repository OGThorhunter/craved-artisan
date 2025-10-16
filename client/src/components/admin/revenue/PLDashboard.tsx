import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users,
  AlertCircle,
  Download,
  RefreshCw,
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import Button from '../../ui/Button';
import Card from '../../ui/Card';

type ViewMode = 'monthly' | 'yearly';

export const PLDashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  // Fetch monthly P&L
  const { data: monthlyData, isLoading: monthlyLoading, refetch: refetchMonthly } = useQuery({
    queryKey: ['admin', 'pl', 'monthly', selectedMonth],
    queryFn: async () => {
      const response = await fetch(`/api/admin/pl/monthly?month=${selectedMonth}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch monthly P&L');
      const result = await response.json();
      return result.data;
    },
    enabled: viewMode === 'monthly',
  });

  // Fetch yearly P&L
  const { data: yearlyData, isLoading: yearlyLoading, refetch: refetchYearly } = useQuery({
    queryKey: ['admin', 'pl', 'yearly', selectedYear],
    queryFn: async () => {
      const response = await fetch(`/api/admin/pl/yearly?year=${selectedYear}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch yearly P&L');
      const result = await response.json();
      return result.data;
    },
    enabled: viewMode === 'yearly',
  });

  // Fetch trend data (last 12 months)
  const { data: trendData } = useQuery({
    queryKey: ['admin', 'pl', 'trend'],
    queryFn: async () => {
      const now = new Date();
      const end = new Date(now.getFullYear(), now.getMonth(), 1);
      const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      
      const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
      const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}`;
      
      const response = await fetch(`/api/admin/pl/trend?start=${startStr}&end=${endStr}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch P&L trend');
      const result = await response.json();
      return result.data;
    },
  });

  const isLoading = viewMode === 'monthly' ? monthlyLoading : yearlyLoading;
  const currentData = viewMode === 'monthly' ? monthlyData : yearlyData;

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Generate month options (last 24 months)
  const monthOptions = Array.from({ length: 24 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return {
      value: `${year}-${String(month).padStart(2, '0')}`,
      label: new Date(year, month - 1).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      }),
    };
  });

  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Prepare cost breakdown for pie chart
  const getCostBreakdown = (data: any) => {
    if (!data) return [];

    const breakdown = viewMode === 'monthly' ? [
      { name: 'Hosting', value: data.hostingCostCents / 100 },
      { name: 'Redis', value: data.redisCostCents / 100 },
      { name: 'Database', value: data.databaseCostCents / 100 },
      { name: 'Email', value: data.emailCostCents / 100 },
      { name: 'Storage', value: data.storageCostCents / 100 },
      { name: 'Payment Processing', value: data.paymentProcessingCostCents / 100 },
      { name: 'Staff', value: data.staffCostCents / 100 },
      { name: 'Other', value: data.otherCostsCents / 100 },
    ] : [
      { name: 'Staff', value: data.staffCostCents / 100 },
      { name: 'Infrastructure', value: (data.totalCostCents - data.staffCostCents) / 100 },
    ];

    return breakdown.filter(item => item.value > 0);
  };

  // Prepare trend chart data
  const getTrendChartData = () => {
    if (!trendData || trendData.length === 0) return [];

    return trendData.map((snapshot: any) => ({
      month: new Date(snapshot.month).toLocaleDateString('en-US', { 
        month: 'short',
        year: '2-digit',
      }),
      revenue: snapshot.totalRevenueCents / 100,
      costs: snapshot.totalCostCents / 100,
      profit: snapshot.netProfitCents / 100,
    }));
  };

  const COLORS = ['#7F232E', '#5B6E02', '#E8A14C', '#4A90E2', '#9B59B6', '#E74C3C', '#2ECC71', '#95A5A6'];

  const handleRefresh = () => {
    if (viewMode === 'monthly') {
      refetchMonthly();
    } else {
      refetchYearly();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profit & Loss</h2>
          <p className="text-sm text-gray-600 mt-1">
            Platform financial overview with revenue, costs, and profitability
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setViewMode('yearly')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
            </button>
          </div>

          {/* Period Selector */}
          {viewMode === 'monthly' ? (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white"
              aria-label="Select month"
            >
              {monthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white"
              aria-label="Select year"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          )}

          <Button
            variant="secondary"
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      )}

      {!isLoading && !currentData && (
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600">
            P&L snapshot not found for this period. Data may not have been generated yet.
          </p>
        </Card>
      )}

      {!isLoading && currentData && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(currentData.totalRevenueCents)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Costs</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(currentData.totalCostCents)}
                  </p>
                  {viewMode === 'monthly' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Staff: {formatCurrency(currentData.staffCostCents)}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Profit</p>
                  <p className={`text-2xl font-bold mt-1 ${
                    currentData.netProfitCents >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(currentData.netProfitCents)}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  currentData.netProfitCents >= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {currentData.netProfitCents >= 0 ? (
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profit Margin</p>
                  <p className={`text-2xl font-bold mt-1 ${
                    currentData.profitMarginPercent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercent(currentData.profitMarginPercent)}
                  </p>
                  {viewMode === 'monthly' && currentData.staffCount > 0 && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {currentData.staffCount} staff
                    </p>
                  )}
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  currentData.profitMarginPercent >= 20 ? 'bg-green-100' :
                  currentData.profitMarginPercent >= 10 ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <DollarSign className={`w-6 h-6 ${
                    currentData.profitMarginPercent >= 20 ? 'text-green-600' :
                    currentData.profitMarginPercent >= 10 ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                </div>
              </div>
            </Card>
          </div>

          {/* P&L Table */}
          {viewMode === 'monthly' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit & Loss Statement</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium text-gray-700">Revenue</span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(currentData.totalRevenueCents)}
                  </span>
                </div>

                <div className="pl-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Hosting</span>
                    <span className="text-gray-900">{formatCurrency(currentData.hostingCostCents)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Redis</span>
                    <span className="text-gray-900">{formatCurrency(currentData.redisCostCents)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Database</span>
                    <span className="text-gray-900">{formatCurrency(currentData.databaseCostCents)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Email Services</span>
                    <span className="text-gray-900">{formatCurrency(currentData.emailCostCents)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Storage</span>
                    <span className="text-gray-900">{formatCurrency(currentData.storageCostCents)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Processing</span>
                    <span className="text-gray-900">{formatCurrency(currentData.paymentProcessingCostCents)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Staff Salaries</span>
                    <span className="text-gray-900">{formatCurrency(currentData.staffCostCents)}</span>
                  </div>
                  {currentData.otherCostsCents > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Other Costs</span>
                      <span className="text-gray-900">{formatCurrency(currentData.otherCostsCents)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center py-2 border-t border-b">
                  <span className="font-medium text-gray-700">Total Costs</span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(currentData.totalCostCents)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="font-bold text-gray-900">Net Profit</span>
                  <span className={`font-bold text-lg ${
                    currentData.netProfitCents >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(currentData.netProfitCents)}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profit Trend Chart */}
            {trendData && trendData.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">12-Month Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getTrendChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => formatCurrency(value * 100)} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Revenue"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="costs" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      name="Costs"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#7F232E" 
                      strokeWidth={2}
                      name="Profit"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Cost Breakdown Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getCostBreakdown(currentData)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${formatCurrency(entry.value * 100)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getCostBreakdown(currentData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value * 100)} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default PLDashboard;

