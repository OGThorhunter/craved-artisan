import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  BarChart3,
  Flame,
  Target,
  Calendar,
  LineChart as LineChartIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface FinancialSummaryProps {
  vendorId: string;
  className?: string;
}

interface RevenueVsProfit {
  date: string;
  revenue: number;
  profit: number;
}

interface CogsTrend {
  date: string;
  cogs: number;
}

interface FinancialSummaryData {
  revenueVsProfit: RevenueVsProfit[];
  cogsTrend: CogsTrend[];
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  vendorId,
  className = ''
}) => {
  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['financial-summary', vendorId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/vendors/${vendorId}/financials/summary/test`,
        { withCredentials: true }
      );
      return response.data as FinancialSummaryData;
    },
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-red-600">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p>Failed to load financial summary</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  // Prepare chart data with formatted dates
  const revenueVsProfitData = summary.revenueVsProfit.map(item => ({
    ...item,
    date: formatDate(item.date)
  }));

  const cogsTrendData = summary.cogsTrend.map(item => ({
    ...item,
    date: formatDate(item.date)
  }));

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <LineChartIcon className="w-5 h-5 text-blue-600" />
          Financial Summary Charts
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Revenue vs Profit and COGS trends over time
        </p>
      </div>

      <div className="p-6 space-y-8">
        {/* Revenue vs Profit Chart */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            Revenue vs Profit Trend
          </h4>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueVsProfitData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatCurrency(value), 
                      name === 'revenue' ? 'Revenue' : 'Profit'
                    ]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Revenue"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Profit"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* COGS Trend Chart */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-600" />
            COGS Trend
          </h4>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cogsTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'COGS']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cogs" 
                    stroke="#FF6F61" 
                    strokeWidth={2}
                    dot={{ fill: '#FF6F61', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="COGS"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Data Points</p>
              <p className="text-xl font-bold text-gray-900">
                {summary.revenueVsProfit.length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Date Range</p>
              <p className="text-sm font-medium text-gray-900">
                {summary.revenueVsProfit.length > 0 && (
                  <>
                    {formatDate(summary.revenueVsProfit[0].date)} - {formatDate(summary.revenueVsProfit[summary.revenueVsProfit.length - 1].date)}
                  </>
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Chart Type</p>
              <p className="text-sm font-medium text-gray-900">Line Charts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 