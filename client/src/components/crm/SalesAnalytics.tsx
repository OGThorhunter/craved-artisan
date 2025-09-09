import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Calendar, 
  BarChart3, 
  PieChart, 
  LineChart,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

interface Opportunity {
  id: string;
  customerId: string;
  title: string;
  stage: 'lead' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  value: number;
  probability: number;
  expectedCloseDate: string;
  actualCloseDate?: string;
  source?: string;
  assignedTo?: string;
  status: 'active' | 'on_hold' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
}

interface SalesAnalyticsProps {
  opportunities: Opportunity[];
  timeRange: '7d' | '30d' | '90d' | '1y' | 'all';
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y' | 'all') => void;
}

const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({ 
  opportunities, 
  timeRange, 
  onTimeRangeChange 
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'deals' | 'conversion'>('revenue');
  const [forecastPeriod, setForecastPeriod] = useState<'30d' | '90d' | '6m' | '1y'>('90d');

  // Filter opportunities by time range
  const getFilteredOpportunities = () => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return opportunities;
    }

    return opportunities.filter(opp => new Date(opp.createdAt) >= startDate);
  };

  const filteredOpportunities = getFilteredOpportunities();

  // Calculate key metrics
  const calculateMetrics = () => {
    const totalValue = filteredOpportunities.reduce((sum, opp) => sum + opp.value, 0);
    const weightedValue = filteredOpportunities.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0);
    const wonDeals = filteredOpportunities.filter(opp => opp.stage === 'closed_won');
    const lostDeals = filteredOpportunities.filter(opp => opp.stage === 'closed_lost');
    const activeDeals = filteredOpportunities.filter(opp => opp.stage !== 'closed_won' && opp.stage !== 'closed_lost');
    
    const wonValue = wonDeals.reduce((sum, opp) => sum + opp.value, 0);
    const lostValue = lostDeals.reduce((sum, opp) => sum + opp.value, 0);
    const activeValue = activeDeals.reduce((sum, opp) => sum + opp.value, 0);
    const activeWeightedValue = activeDeals.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0);

    const totalDeals = wonDeals.length + lostDeals.length;
    const winRate = totalDeals > 0 ? (wonDeals.length / totalDeals) * 100 : 0;
    const averageDealSize = filteredOpportunities.length > 0 ? totalValue / filteredOpportunities.length : 0;
    const averageSalesCycle = calculateAverageSalesCycle(wonDeals);

    return {
      totalValue,
      weightedValue,
      wonValue,
      lostValue,
      activeValue,
      activeWeightedValue,
      totalDeals,
      wonDeals: wonDeals.length,
      lostDeals: lostDeals.length,
      activeDeals: activeDeals.length,
      winRate,
      averageDealSize,
      averageSalesCycle,
    };
  };

  const metrics = calculateMetrics();

  // Calculate average sales cycle
  const calculateAverageSalesCycle = (wonDeals: Opportunity[]) => {
    if (wonDeals.length === 0) return 0;
    
    const totalDays = wonDeals.reduce((sum, deal) => {
      const created = new Date(deal.createdAt);
      const closed = new Date(deal.actualCloseDate || deal.updatedAt);
      return sum + Math.ceil((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);
    
    return Math.round(totalDays / wonDeals.length);
  };

  // Stage distribution
  const getStageDistribution = () => {
    const distribution = filteredOpportunities.reduce((acc, opp) => {
      acc[opp.stage] = (acc[opp.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([stage, count]) => ({
      stage: stage.replace('_', ' '),
      count,
      percentage: (count / filteredOpportunities.length) * 100,
    }));
  };

  // Source distribution
  const getSourceDistribution = () => {
    const distribution = filteredOpportunities.reduce((acc, opp) => {
      const source = opp.source || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([source, count]) => ({
      source,
      count,
      percentage: (count / filteredOpportunities.length) * 100,
    }));
  };

  // Monthly trend data
  const getMonthlyTrends = () => {
    const monthlyData: Record<string, { revenue: number; deals: number }> = {};
    
    filteredOpportunities.forEach(opp => {
      const month = new Date(opp.createdAt).toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, deals: 0 };
      }
      monthlyData[month].revenue += opp.value;
      monthlyData[month].deals += 1;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        deals: data.deals,
      }));
  };

  // Forecast calculations
  const getForecast = () => {
    const activeDeals = filteredOpportunities.filter(opp => 
      opp.stage !== 'closed_won' && opp.stage !== 'closed_lost' && opp.status === 'active'
    );

    const weightedForecast = activeDeals.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0);
    const optimisticForecast = activeDeals.reduce((sum, opp) => sum + opp.value, 0);
    const conservativeForecast = activeDeals
      .filter(opp => opp.probability >= 50)
      .reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0);

    return {
      weighted: weightedForecast,
      optimistic: optimisticForecast,
      conservative: conservativeForecast,
      activeDeals: activeDeals.length,
    };
  };

  const forecast = getForecast();

  // Get stage color
  const getStageColor = (stage: string) => {
    const colorMap: Record<string, string> = {
      lead: 'bg-gray-100 text-gray-800',
      qualification: 'bg-blue-100 text-blue-800',
      proposal: 'bg-yellow-100 text-yellow-800',
      negotiation: 'bg-orange-100 text-orange-800',
      'closed won': 'bg-green-100 text-green-800',
      'closed lost': 'bg-red-100 text-red-800',
    };
    return colorMap[stage] || 'bg-gray-100 text-gray-800';
  };

  const stageDistribution = getStageDistribution();
  const sourceDistribution = getSourceDistribution();
  const monthlyTrends = getMonthlyTrends();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Analytics & Forecasting</h2>
          <p className="text-gray-600">Track performance and predict future sales</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
            <option value="all">All time</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pipeline</p>
              <p className="text-2xl font-bold text-gray-900">${metrics.totalValue.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Weighted: ${metrics.weightedValue.toLocaleString()}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Won Revenue</p>
              <p className="text-2xl font-bold text-green-600">${metrics.wonValue.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{metrics.wonDeals} deals won</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Win Rate</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.winRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">{metrics.totalDeals} total deals</p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Deal Size</p>
              <p className="text-2xl font-bold text-gray-900">${metrics.averageDealSize.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Avg cycle: {metrics.averageSalesCycle} days</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Forecast Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Sales Forecast</h3>
          <select
            value={forecastPeriod}
            onChange={(e) => setForecastPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="30d">Next 30 days</option>
            <option value="90d">Next 90 days</option>
            <option value="6m">Next 6 months</option>
            <option value="1y">Next year</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">${forecast.weighted.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Weighted Forecast</div>
            <div className="text-xs text-gray-500 mt-1">Most likely scenario</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">${forecast.optimistic.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Optimistic Forecast</div>
            <div className="text-xs text-gray-500 mt-1">All deals close</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">${forecast.conservative.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Conservative Forecast</div>
            <div className="text-xs text-gray-500 mt-1">50%+ probability only</div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Based on {forecast.activeDeals} active opportunities
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline by Stage</h3>
          <div className="space-y-3">
            {stageDistribution.map((item) => (
              <div key={item.stage} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStageColor(item.stage)}`}>
                    {item.stage}
                  </span>
                  <span className="text-sm text-gray-600">{item.count} deals</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Source Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads by Source</h3>
          <div className="space-y-3">
            {sourceDistribution.map((item) => (
              <div key={item.source} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900">{item.source}</span>
                  <span className="text-sm text-gray-600">{item.count} leads</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-600">Month</th>
                <th className="text-right py-2 text-sm font-medium text-gray-600">Revenue</th>
                <th className="text-right py-2 text-sm font-medium text-gray-600">Deals</th>
                <th className="text-right py-2 text-sm font-medium text-gray-600">Avg Deal Size</th>
              </tr>
            </thead>
            <tbody>
              {monthlyTrends.map((trend) => (
                <tr key={trend.month} className="border-b border-gray-100">
                  <td className="py-2 text-sm text-gray-900">
                    {new Date(trend.month + '-01').toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </td>
                  <td className="py-2 text-sm text-right font-medium text-gray-900">
                    ${trend.revenue.toLocaleString()}
                  </td>
                  <td className="py-2 text-sm text-right text-gray-600">
                    {trend.deals}
                  </td>
                  <td className="py-2 text-sm text-right text-gray-600">
                    ${trend.deals > 0 ? (trend.revenue / trend.deals).toLocaleString() : '0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Strengths</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {metrics.winRate > 30 && (
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Strong win rate of {metrics.winRate.toFixed(1)}%</span>
                </li>
              )}
              {metrics.averageDealSize > 10000 && (
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>High average deal size of ${metrics.averageDealSize.toLocaleString()}</span>
                </li>
              )}
              {metrics.averageSalesCycle < 60 && (
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Fast sales cycle of {metrics.averageSalesCycle} days</span>
                </li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Areas for Improvement</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {metrics.winRate < 20 && (
                <li className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span>Low win rate of {metrics.winRate.toFixed(1)}% - focus on qualification</span>
                </li>
              )}
              {metrics.averageSalesCycle > 120 && (
                <li className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span>Long sales cycle of {metrics.averageSalesCycle} days - streamline process</span>
                </li>
              )}
              {metrics.activeDeals < 10 && (
                <li className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span>Low pipeline volume - increase lead generation</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics;



