import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Eye,
  MousePointer,
  ShoppingCart,
  Percent,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Award,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Activity,
  PieChart,
  LineChart,
  BarChart
} from 'lucide-react';

interface AnalyticsData {
  timeRange: string;
  totalPromotions: number;
  activePromotions: number;
  totalRevenue: number;
  totalDiscounts: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
  conversionRate: number;
  roi: number;
  costPerAcquisition: number;
  lifetimeValue: number;
  trends: {
    revenue: { current: number; previous: number; change: number };
    orders: { current: number; previous: number; change: number };
    customers: { current: number; previous: number; change: number };
    conversion: { current: number; previous: number; change: number };
  };
  topPromotions: Array<{
    id: string;
    name: string;
    revenue: number;
    orders: number;
    conversionRate: number;
    roi: number;
  }>;
  channelPerformance: Array<{
    channel: string;
    revenue: number;
    orders: number;
    conversionRate: number;
    cost: number;
    roas: number;
  }>;
  customerSegments: Array<{
    segment: string;
    customers: number;
    revenue: number;
    avgOrderValue: number;
    conversionRate: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    revenue: number;
    orders: number;
    customers: number;
    conversions: number;
  }>;
}

const PromotionAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie' | 'scatter'>('line');
  const [showExport, setShowExport] = useState(false);

  // Mock analytics data
  const analyticsData: AnalyticsData = {
    timeRange: '30d',
    totalPromotions: 15,
    activePromotions: 8,
    totalRevenue: 125750,
    totalDiscounts: 18750,
    totalOrders: 1250,
    totalCustomers: 890,
    avgOrderValue: 100.60,
    conversionRate: 12.5,
    roi: 4.2,
    costPerAcquisition: 15.50,
    lifetimeValue: 141.35,
    trends: {
      revenue: { current: 125750, previous: 98750, change: 27.4 },
      orders: { current: 1250, previous: 980, change: 27.6 },
      customers: { current: 890, previous: 720, change: 23.6 },
      conversion: { current: 12.5, previous: 10.2, change: 22.5 }
    },
    topPromotions: [
      { id: '1', name: 'Holiday Sale 25% Off', revenue: 45000, orders: 320, conversionRate: 15.2, roi: 5.8 },
      { id: '2', name: 'New Customer Welcome', revenue: 28000, orders: 280, conversionRate: 18.5, roi: 6.2 },
      { id: '3', name: 'Free Shipping Over $50', revenue: 22000, orders: 180, conversionRate: 12.8, roi: 4.1 },
      { id: '4', name: 'VIP Exclusive 30% Off', revenue: 18750, orders: 150, conversionRate: 20.0, roi: 7.5 },
      { id: '5', name: 'Abandoned Cart Recovery', revenue: 12000, orders: 120, conversionRate: 8.5, roi: 3.2 }
    ],
    channelPerformance: [
      { channel: 'Email', revenue: 45000, orders: 320, conversionRate: 15.2, cost: 2500, roas: 18.0 },
      { channel: 'Social Media', revenue: 35000, orders: 280, conversionRate: 12.8, cost: 3000, roas: 11.7 },
      { channel: 'Website', revenue: 25000, orders: 200, conversionRate: 10.5, cost: 1500, roas: 16.7 },
      { channel: 'SMS', revenue: 15000, orders: 120, conversionRate: 18.0, cost: 800, roas: 18.8 },
      { channel: 'Push Notifications', revenue: 5750, orders: 45, conversionRate: 8.2, cost: 200, roas: 28.8 }
    ],
    customerSegments: [
      { segment: 'VIP Customers', customers: 120, revenue: 45000, avgOrderValue: 375, conversionRate: 25.0 },
      { segment: 'New Customers', customers: 350, revenue: 28000, avgOrderValue: 80, conversionRate: 18.5 },
      { segment: 'Returning Customers', customers: 280, revenue: 35000, avgOrderValue: 125, conversionRate: 15.2 },
      { segment: 'At-Risk Customers', customers: 140, revenue: 17750, avgOrderValue: 127, conversionRate: 8.5 }
    ],
    timeSeriesData: [
      { date: '2025-01-01', revenue: 3200, orders: 32, customers: 28, conversions: 4 },
      { date: '2025-01-02', revenue: 4100, orders: 41, customers: 35, conversions: 6 },
      { date: '2025-01-03', revenue: 3800, orders: 38, customers: 32, conversions: 5 },
      { date: '2025-01-04', revenue: 4500, orders: 45, customers: 38, conversions: 7 },
      { date: '2025-01-05', revenue: 5200, orders: 52, customers: 42, conversions: 8 },
      { date: '2025-01-06', revenue: 4800, orders: 48, customers: 40, conversions: 7 },
      { date: '2025-01-07', revenue: 3900, orders: 39, customers: 33, conversions: 6 },
      { date: '2025-01-08', revenue: 4200, orders: 42, customers: 36, conversions: 6 },
      { date: '2025-01-09', revenue: 4600, orders: 46, customers: 39, conversions: 7 },
      { date: '2025-01-10', revenue: 5100, orders: 51, customers: 43, conversions: 8 },
      { date: '2025-01-11', revenue: 4800, orders: 48, customers: 40, conversions: 7 },
      { date: '2025-01-12', revenue: 4400, orders: 44, customers: 37, conversions: 6 },
      { date: '2025-01-13', revenue: 4700, orders: 47, customers: 39, conversions: 7 },
      { date: '2025-01-14', revenue: 5000, orders: 50, customers: 42, conversions: 8 },
      { date: '2025-01-15', revenue: 5300, orders: 53, customers: 44, conversions: 8 },
      { date: '2025-01-16', revenue: 4900, orders: 49, customers: 41, conversions: 7 },
      { date: '2025-01-17', revenue: 4600, orders: 46, customers: 38, conversions: 7 },
      { date: '2025-01-18', revenue: 4800, orders: 48, customers: 40, conversions: 7 },
      { date: '2025-01-19', revenue: 5100, orders: 51, customers: 43, conversions: 8 },
      { date: '2025-01-20', revenue: 5400, orders: 54, customers: 45, conversions: 9 }
    ]
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatNumber = (num: number) => num.toLocaleString();

  const getTrendIcon = (change: number) => {
    if (change > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'line': return <LineChart className="h-4 w-4" />;
      case 'bar': return <BarChart className="h-4 w-4" />;
      case 'pie': return <PieChart className="h-4 w-4" />;
      case 'scatter': return <BarChart3 className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Promotion Analytics</h2>
          <p className="text-gray-600 mt-1">Comprehensive performance insights and optimization recommendations</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            title="Export analytics data"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => console.log('Refresh analytics')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Refresh analytics data"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Time Range:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Select time range"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
              <option value="custom">Custom range</option>
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Chart Type:</label>
            <div className="flex items-center space-x-2">
              {['line', 'bar', 'pie', 'scatter'].map((type) => (
                <button
                  key={type}
                  onClick={() => setChartType(type as any)}
                  className={`p-2 rounded-lg ${
                    chartType === type
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title={`${type} chart`}
                >
                  {getChartIcon(type)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.totalRevenue)}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {getTrendIcon(analyticsData.trends.revenue.change)}
            <span className={`ml-1 text-sm font-medium ${getTrendColor(analyticsData.trends.revenue.change)}`}>
              {formatPercentage(analyticsData.trends.revenue.change)}
            </span>
            <span className="ml-1 text-sm text-gray-500">vs previous period</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.totalOrders)}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {getTrendIcon(analyticsData.trends.orders.change)}
            <span className={`ml-1 text-sm font-medium ${getTrendColor(analyticsData.trends.orders.change)}`}>
              {formatPercentage(analyticsData.trends.orders.change)}
            </span>
            <span className="ml-1 text-sm text-gray-500">vs previous period</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(analyticsData.conversionRate)}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {getTrendIcon(analyticsData.trends.conversion.change)}
            <span className={`ml-1 text-sm font-medium ${getTrendColor(analyticsData.trends.conversion.change)}`}>
              {formatPercentage(analyticsData.trends.conversion.change)}
            </span>
            <span className="ml-1 text-sm text-gray-500">vs previous period</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ROI</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.roi.toFixed(1)}x</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="ml-1 text-sm font-medium text-green-600">Excellent performance</span>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Promotions */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Top Performing Promotions</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.topPromotions.map((promotion, index) => (
                <div key={promotion.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{promotion.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(promotion.revenue)} • {promotion.orders} orders
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatPercentage(promotion.conversionRate)}</p>
                    <p className="text-xs text-gray-500">Conv. Rate</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Channel Performance */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Channel Performance</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.channelPerformance.map((channel) => (
                <div key={channel.channel} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{channel.channel}</p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(channel.revenue)} • {channel.orders} orders
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{channel.roas.toFixed(1)}x</p>
                    <p className="text-xs text-gray-500">ROAS</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Segments Performance */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Customer Segment Performance</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analyticsData.customerSegments.map((segment) => (
              <div key={segment.segment} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">{segment.segment}</h4>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Customers: {formatNumber(segment.customers)}</p>
                  <p className="text-xs text-gray-500">Revenue: {formatCurrency(segment.revenue)}</p>
                  <p className="text-xs text-gray-500">AOV: {formatCurrency(segment.avgOrderValue)}</p>
                  <p className="text-xs text-gray-500">Conv. Rate: {formatPercentage(segment.conversionRate)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Time Series Chart Placeholder */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Performance Over Time</h3>
        </div>
        <div className="p-6">
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart visualization would be implemented here</p>
              <p className="text-sm text-gray-400">Using libraries like Chart.js or Recharts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Optimization Recommendations */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Optimization Recommendations</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-green-900">High Performing Segment</h4>
                <p className="text-sm text-green-700">
                  VIP customers show 25% conversion rate. Consider increasing VIP-exclusive promotions.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-900">Underperforming Channel</h4>
                <p className="text-sm text-yellow-700">
                  Push notifications have low conversion (8.2%). Consider optimizing messaging or timing.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Optimization Opportunity</h4>
                <p className="text-sm text-blue-700">
                  Email campaigns show 18x ROAS. Increase email frequency for better revenue growth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionAnalytics;
