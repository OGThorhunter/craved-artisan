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
  Calendar
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FinancialInsightsProps {
  vendorId: string;
  selectedYear?: number;
  selectedQuarter?: string;
  className?: string;
}

interface TopGain {
  date: string;
  netProfit: number;
  revenue: number;
  margin: number;
}

interface CostTrend {
  trend: 'improving' | 'worsening' | 'stable';
  percentage: number;
  direction: 'increasing' | 'decreasing' | 'stable';
  avgCostRatio: number;
}

interface BurnRate {
  monthly: number;
  runway: number;
  status: 'healthy' | 'caution' | 'critical';
  currentBalance: number;
}

interface FinancialInsightsData {
  topGains: TopGain[];
  costTrend: CostTrend;
  burnRate: BurnRate;
  period: {
    start: string;
    end: string;
    snapshotsCount: number;
  };
  summary: string;
}

export const FinancialInsights: React.FC<FinancialInsightsProps> = ({
  vendorId,
  selectedYear,
  selectedQuarter,
  className = ''
}) => {
  const { data: insights, isLoading, error } = useQuery({
    queryKey: ['financial-insights', vendorId, selectedYear, selectedQuarter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedYear) params.append('year', selectedYear.toString());
      if (selectedQuarter) params.append('quarter', selectedQuarter);
      
      const response = await axios.get(
        `/api/vendors/${vendorId}/financials/insights?${params.toString()}`,
        { withCredentials: true }
      );
      return response.data as FinancialInsightsData;
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'worsening':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <BarChart3 className="w-5 h-5 text-gray-600" />;
    }
  };

  const getBurnRateIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'caution':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'critical':
        return <Flame className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getBurnRateColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'caution':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Prepare chart data for topGains
  const chartData = insights?.topGains.map((gain, index) => ({
    name: formatDate(gain.date),
    profit: gain.netProfit,
    revenue: gain.revenue,
    margin: gain.margin,
    rank: index + 1
  })) || [];

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
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
          <p>Failed to load financial insights</p>
        </div>
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Financial Insights
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {insights.summary}
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Top Gains Section with Chart */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            Top Performing Periods
          </h4>
          {insights.topGains.length > 0 ? (
            <div className="space-y-4">
              {/* Bar Chart Visualization */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h5 className="text-sm font-medium text-gray-700 mb-3">Net Profit by Period</h5>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="name" 
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
                          name === 'profit' ? 'Net Profit' : name
                        ]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Bar 
                        dataKey="profit" 
                        fill="#10b981" 
                        radius={[4, 4, 0, 0]}
                        name="Net Profit"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Detailed List */}
              <div className="space-y-2">
                {insights.topGains.map((gain, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-700">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(gain.date)}
                        </p>
                        <p className="text-xs text-gray-600">
                          Revenue: {formatCurrency(gain.revenue)} | Margin: {gain.margin.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(gain.netProfit)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No profitable periods found in the selected timeframe.</p>
          )}
        </div>

        {/* Cost Trend Section */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
            {getTrendIcon(insights.costTrend.trend)}
            Cost Trend Analysis
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Average Cost Ratio</p>
              <p className="text-xl font-bold text-gray-900">
                {insights.costTrend.avgCostRatio.toFixed(1)}%
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Trend Direction</p>
              <p className="text-lg font-semibold capitalize">
                {insights.costTrend.direction}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Change</p>
              <p className={`text-lg font-semibold ${
                insights.costTrend.trend === 'improving' ? 'text-green-600' : 
                insights.costTrend.trend === 'worsening' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {insights.costTrend.percentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Burn Rate Section */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
            {getBurnRateIcon(insights.burnRate.status)}
            Cash Flow & Burn Rate
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Monthly Cash Flow</p>
              <p className={`text-xl font-bold ${
                insights.burnRate.monthly >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(insights.burnRate.monthly)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Current Balance</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(insights.burnRate.currentBalance)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Runway (Months)</p>
              <p className="text-xl font-bold text-gray-900">
                {insights.burnRate.runway === Infinity ? '∞' : insights.burnRate.runway.toFixed(1)}
              </p>
            </div>
            <div className={`p-4 rounded-lg border ${getBurnRateColor(insights.burnRate.status)}`}>
              <p className="text-sm">Status</p>
              <p className="text-lg font-semibold capitalize">
                {insights.burnRate.status}
              </p>
            </div>
          </div>
        </div>

        {/* Period Summary */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {formatDate(insights.period.start)} - {formatDate(insights.period.end)}
              </span>
            </div>
            <span>{insights.period.snapshotsCount} snapshots analyzed</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 