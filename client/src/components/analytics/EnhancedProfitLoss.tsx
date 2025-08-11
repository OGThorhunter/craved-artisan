import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, RefreshCw, Download, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface ProfitLossData {
  income: {
    revenue: number;
    otherIncome: number;
  };
  expenses: {
    COGS: number;
    labor: number;
    marketing: number;
    other: number;
  };
  netProfit: number;
}

interface ProfitLossResponse {
  data: ProfitLossData;
  meta: {
    vendorId: string;
    vendorName: string;
    generatedAt: string;
  };
}

const fetchProfitLoss = async (vendorId: string) => {
  const response = await axios.get(`/api/vendor/${vendorId}/financials`);
  return response.data;
};

const EnhancedProfitLoss = () => {
  const { user } = useAuth();
  const [showChart, setShowChart] = useState<'bar' | 'pie'>('bar');

  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: ['profitLoss', user?.id],
    queryFn: () => fetchProfitLoss(user?.id || ''),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const data: ProfitLossResponse | null = response || null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleExportCSV = () => {
    if (!data?.data) return;
    
    const headers = ['Category', 'Amount', 'Type'];
    const csvContent = [
      headers.join(','),
      `Revenue,${data.data.income.revenue},Income`,
      `Other Income,${data.data.income.otherIncome},Income`,
      `COGS,${data.data.expenses.COGS},Expense`,
      `Labor,${data.data.expenses.labor},Expense`,
      `Marketing,${data.data.expenses.marketing},Expense`,
      `Other Expenses,${data.data.expenses.other},Expense`,
      `Net Profit,${data.data.netProfit},Net`
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profit-loss-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    console.log('Exporting P&L to PDF...');
    // In real app, this would generate a PDF report
    alert('📄 PDF export feature coming soon!');
  };

  const getProfitMargin = () => {
    if (!data?.data) return 0;
    const totalIncome = data.data.income.revenue + data.data.income.otherIncome;
    return totalIncome > 0 ? (data.data.netProfit / totalIncome) * 100 : 0;
  };

  const getProfitStatus = () => {
    if (!data?.data) return { color: 'text-gray-600', bg: 'bg-gray-100', text: 'No Data' };
    if (data.data.netProfit > 0) return { color: 'text-green-600', bg: 'bg-green-100', text: 'Profitable' };
    if (data.data.netProfit < 0) return { color: 'text-red-600', bg: 'bg-red-100', text: 'Loss' };
    return { color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Break Even' };
  };

  // Prepare data for charts
  const chartData = data?.data ? [
    { name: 'Revenue', value: data.data.income.revenue, type: 'income', color: '#10B981' },
    { name: 'Other Income', value: data.data.income.otherIncome, type: 'income', color: '#059669' },
    { name: 'COGS', value: data.data.expenses.COGS, type: 'expense', color: '#EF4444' },
    { name: 'Labor', value: data.data.expenses.labor, type: 'expense', color: '#DC2626' },
    { name: 'Marketing', value: data.data.expenses.marketing, type: 'expense', color: '#B91C1C' },
    { name: 'Other', value: data.data.expenses.other, type: 'expense', color: '#991B1B' }
  ] : [];

  const pieData = data?.data ? [
    { name: 'Revenue', value: data.data.income.revenue, color: '#10B981' },
    { name: 'Other Income', value: data.data.income.otherIncome, color: '#059669' },
    { name: 'COGS', value: data.data.expenses.COGS, color: '#EF4444' },
    { name: 'Labor', value: data.data.expenses.labor, color: '#DC2626' },
    { name: 'Marketing', value: data.data.expenses.marketing, color: '#B91C1C' },
    { name: 'Other', value: data.data.expenses.other, color: '#991B1B' }
  ] : [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="text-center text-gray-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p className="mb-4">Failed to load P&L data</p>
          <button
            onClick={() => refetch()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const profitStatus = getProfitStatus();
  const profitMargin = getProfitMargin();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profit & Loss Statement</h2>
          <p className="text-gray-600">Live financial performance from your orders</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => refetch()}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(data.data.income.revenue + data.data.income.otherIncome)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-900">
                {formatCurrency(data.data.expenses.COGS + data.data.expenses.labor + data.data.expenses.marketing + data.data.expenses.other)}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Net Profit</p>
              <p className={`text-2xl font-bold ${data.data.netProfit >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
                {formatCurrency(data.data.netProfit)}
              </p>
            </div>
            {data.data.netProfit >= 0 ? (
              <TrendingUp className="w-8 h-8 text-blue-500" />
            ) : (
              <TrendingDown className="w-8 h-8 text-red-500" />
            )}
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Profit Margin</p>
              <p className="text-2xl font-bold text-yellow-900">
                {profitMargin.toFixed(1)}%
              </p>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profitStatus.bg} ${profitStatus.color}`}>
              {profitStatus.text}
            </span>
          </div>
        </div>
      </div>

      {/* P&L Statement Table */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Breakdown</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          {/* Income Section */}
          <div className="mb-6">
            <h4 className="text-md font-semibold text-green-700 mb-3">Income</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Revenue</span>
                <span className="font-semibold text-green-600">{formatCurrency(data.data.income.revenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Other Income</span>
                <span className="font-semibold text-green-600">{formatCurrency(data.data.income.otherIncome)}</span>
              </div>
              <div className="border-t border-gray-300 pt-2 flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total Income</span>
                <span className="font-bold text-green-700">
                  {formatCurrency(data.data.income.revenue + data.data.income.otherIncome)}
                </span>
              </div>
            </div>
          </div>

          {/* Expenses Section */}
          <div className="mb-6">
            <h4 className="text-md font-semibold text-red-700 mb-3">Expenses</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Cost of Goods Sold (COGS)</span>
                <span className="font-semibold text-red-600">{formatCurrency(data.data.expenses.COGS)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Labor</span>
                <span className="font-semibold text-red-600">{formatCurrency(data.data.expenses.labor)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Marketing</span>
                <span className="font-semibold text-red-600">{formatCurrency(data.data.expenses.marketing)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Other Expenses</span>
                <span className="font-semibold text-red-600">{formatCurrency(data.data.expenses.other)}</span>
              </div>
              <div className="border-t border-gray-300 pt-2 flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total Expenses</span>
                <span className="font-bold text-red-700">
                  {formatCurrency(data.data.expenses.COGS + data.data.expenses.labor + data.data.expenses.marketing + data.data.expenses.other)}
                </span>
              </div>
            </div>
          </div>

          {/* Net Profit Section */}
          <div className="border-t-2 border-gray-300 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Net Profit</span>
              <span className={`text-xl font-bold ${data.data.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatCurrency(data.data.netProfit)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Visualization</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowChart('bar')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                showChart === 'bar'
                  ? 'bg-brand-green text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Bar Chart
            </button>
            <button
              onClick={() => setShowChart('pie')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                showChart === 'pie'
                  ? 'bg-brand-green text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pie Chart
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <ResponsiveContainer width="100%" height={300}>
            {showChart === 'bar' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Amount']}
                  labelFormatter={(label) => `${label}`}
                />
                <Legend />
                <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Amount']}
                />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Financial Insights</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• Your profit margin is <strong>{profitMargin.toFixed(1)}%</strong></p>
          <p>• COGS represents <strong>{((data.data.expenses.COGS / (data.data.income.revenue + data.data.income.otherIncome)) * 100).toFixed(1)}%</strong> of total income</p>
          <p>• Labor costs are <strong>{((data.data.expenses.labor / (data.data.income.revenue + data.data.income.otherIncome)) * 100).toFixed(1)}%</strong> of total income</p>
          {data.data.netProfit < 0 && (
            <p className="text-red-700 font-semibold">⚠️ Consider reviewing your cost structure to improve profitability</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedProfitLoss; 