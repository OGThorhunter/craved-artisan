import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Calculator,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Activity,
  Users,
  ShoppingCart,
  Percent,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Settings
} from 'lucide-react';

interface ROIData {
  timeRange: string;
  totalInvestment: number;
  totalRevenue: number;
  netProfit: number;
  roi: number;
  roas: number;
  costPerAcquisition: number;
  lifetimeValue: number;
  paybackPeriod: number;
  breakEvenPoint: number;
  profitMargin: number;
  revenueGrowth: number;
  costEfficiency: number;
  channelROI: Array<{
    channel: string;
    investment: number;
    revenue: number;
    roi: number;
    roas: number;
    efficiency: 'high' | 'medium' | 'low';
  }>;
  promotionROI: Array<{
    promotion: string;
    investment: number;
    revenue: number;
    roi: number;
    orders: number;
    customers: number;
    efficiency: 'high' | 'medium' | 'low';
  }>;
  segmentROI: Array<{
    segment: string;
    customers: number;
    investment: number;
    revenue: number;
    roi: number;
    avgOrderValue: number;
    efficiency: 'high' | 'medium' | 'low';
  }>;
  timeSeriesROI: Array<{
    date: string;
    investment: number;
    revenue: number;
    roi: number;
    cumulativeROI: number;
  }>;
  benchmarks: {
    industryROI: number;
    industryROAS: number;
    industryCPA: number;
    industryLTV: number;
  };
  recommendations: Array<{
    type: 'optimization' | 'investment' | 'warning' | 'success';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    priority: number;
  }>;
}

const ROIAnalysis: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('roi');
  const [viewMode, setViewMode] = useState<'overview' | 'channels' | 'promotions' | 'segments'>('overview');
  const [showExport, setShowExport] = useState(false);

  // Mock ROI data
  const roiData: ROIData = {
    timeRange: '30d',
    totalInvestment: 25000,
    totalRevenue: 125750,
    netProfit: 100750,
    roi: 4.03,
    roas: 5.03,
    costPerAcquisition: 15.50,
    lifetimeValue: 141.35,
    paybackPeriod: 7.5,
    breakEvenPoint: 0.2,
    profitMargin: 80.1,
    revenueGrowth: 27.4,
    costEfficiency: 85.2,
    channelROI: [
      { channel: 'Email', investment: 5000, revenue: 45000, roi: 9.0, roas: 9.0, efficiency: 'high' },
      { channel: 'Social Media', investment: 8000, revenue: 35000, roi: 4.38, roas: 4.38, efficiency: 'medium' },
      { channel: 'Website', investment: 3000, revenue: 25000, roi: 8.33, roas: 8.33, efficiency: 'high' },
      { channel: 'SMS', investment: 1500, revenue: 15000, roi: 10.0, roas: 10.0, efficiency: 'high' },
      { channel: 'Push Notifications', investment: 500, revenue: 5750, roi: 11.5, roas: 11.5, efficiency: 'high' },
      { channel: 'Display Ads', investment: 6500, revenue: 10000, roi: 1.54, roas: 1.54, efficiency: 'low' }
    ],
    promotionROI: [
      { promotion: 'Holiday Sale 25% Off', investment: 5000, revenue: 45000, roi: 9.0, orders: 320, customers: 280, efficiency: 'high' },
      { promotion: 'New Customer Welcome', investment: 2000, revenue: 28000, roi: 14.0, orders: 280, customers: 280, efficiency: 'high' },
      { promotion: 'Free Shipping Over $50', investment: 3000, revenue: 22000, roi: 7.33, orders: 180, customers: 150, efficiency: 'high' },
      { promotion: 'VIP Exclusive 30% Off', investment: 1500, revenue: 18750, roi: 12.5, orders: 150, customers: 120, efficiency: 'high' },
      { promotion: 'Abandoned Cart Recovery', investment: 1000, revenue: 12000, roi: 12.0, orders: 120, customers: 100, efficiency: 'high' },
      { promotion: 'Bulk Order Discount', investment: 2000, revenue: 8000, roi: 4.0, orders: 80, customers: 60, efficiency: 'medium' },
      { promotion: 'Seasonal Collection', investment: 4000, revenue: 15000, roi: 3.75, orders: 120, customers: 100, efficiency: 'medium' },
      { promotion: 'Flash Sale 50% Off', investment: 3000, revenue: 10000, roi: 3.33, orders: 100, customers: 80, efficiency: 'medium' }
    ],
    segmentROI: [
      { segment: 'VIP Customers', customers: 120, investment: 5000, revenue: 45000, roi: 9.0, avgOrderValue: 375, efficiency: 'high' },
      { segment: 'New Customers', customers: 350, investment: 8000, revenue: 28000, roi: 3.5, avgOrderValue: 80, efficiency: 'medium' },
      { segment: 'Returning Customers', customers: 280, investment: 6000, revenue: 35000, roi: 5.83, avgOrderValue: 125, efficiency: 'high' },
      { segment: 'At-Risk Customers', customers: 140, investment: 3000, revenue: 17750, roi: 5.92, avgOrderValue: 127, efficiency: 'high' },
      { segment: 'Bulk Buyers', customers: 60, investment: 2000, revenue: 8000, roi: 4.0, avgOrderValue: 133, efficiency: 'medium' }
    ],
    timeSeriesROI: [
      { date: '2025-01-01', investment: 800, revenue: 3200, roi: 4.0, cumulativeROI: 4.0 },
      { date: '2025-01-02', investment: 900, revenue: 4100, roi: 4.56, cumulativeROI: 4.28 },
      { date: '2025-01-03', investment: 750, revenue: 3800, roi: 5.07, cumulativeROI: 4.49 },
      { date: '2025-01-04', investment: 1000, revenue: 4500, roi: 4.5, cumulativeROI: 4.51 },
      { date: '2025-01-05', investment: 1200, revenue: 5200, roi: 4.33, cumulativeROI: 4.52 },
      { date: '2025-01-06', investment: 1100, revenue: 4800, roi: 4.36, cumulativeROI: 4.53 },
      { date: '2025-01-07', investment: 950, revenue: 3900, roi: 4.11, cumulativeROI: 4.52 },
      { date: '2025-01-08', investment: 1050, revenue: 4200, roi: 4.0, cumulativeROI: 4.51 },
      { date: '2025-01-09', investment: 1150, revenue: 4600, roi: 4.0, cumulativeROI: 4.50 },
      { date: '2025-01-10', investment: 1300, revenue: 5100, roi: 3.92, cumulativeROI: 4.49 },
      { date: '2025-01-11', investment: 1200, revenue: 4800, roi: 4.0, cumulativeROI: 4.48 },
      { date: '2025-01-12', investment: 1100, revenue: 4400, roi: 4.0, cumulativeROI: 4.47 },
      { date: '2025-01-13', investment: 1200, revenue: 4700, roi: 3.92, cumulativeROI: 4.46 },
      { date: '2025-01-14', investment: 1300, revenue: 5000, roi: 3.85, cumulativeROI: 4.45 },
      { date: '2025-01-15', investment: 1400, revenue: 5300, roi: 3.79, cumulativeROI: 4.44 },
      { date: '2025-01-16', investment: 1250, revenue: 4900, roi: 3.92, cumulativeROI: 4.43 },
      { date: '2025-01-17', investment: 1150, revenue: 4600, roi: 4.0, cumulativeROI: 4.42 },
      { date: '2025-01-18', investment: 1200, revenue: 4800, roi: 4.0, cumulativeROI: 4.41 },
      { date: '2025-01-19', investment: 1300, revenue: 5100, roi: 3.92, cumulativeROI: 4.40 },
      { date: '2025-01-20', investment: 1400, revenue: 5400, roi: 3.86, cumulativeROI: 4.39 }
    ],
    benchmarks: {
      industryROI: 3.2,
      industryROAS: 4.1,
      industryCPA: 22.50,
      industryLTV: 125.00
    },
    recommendations: [
      {
        type: 'success',
        title: 'Excellent ROI Performance',
        description: 'Your current ROI of 4.03x exceeds industry average of 3.2x by 26%. Continue current strategies.',
        impact: 'high',
        effort: 'low',
        priority: 1
      },
      {
        type: 'optimization',
        title: 'Optimize Display Ads',
        description: 'Display ads show low ROI (1.54x). Consider reallocating budget to high-performing channels.',
        impact: 'high',
        effort: 'medium',
        priority: 2
      },
      {
        type: 'investment',
        title: 'Increase Email Marketing Investment',
        description: 'Email shows highest ROI (9.0x). Increase budget allocation for better returns.',
        impact: 'high',
        effort: 'low',
        priority: 3
      },
      {
        type: 'warning',
        title: 'Monitor CPA Trends',
        description: 'Cost per acquisition is below industry average but trending up. Monitor closely.',
        impact: 'medium',
        effort: 'low',
        priority: 4
      },
      {
        type: 'optimization',
        title: 'Focus on VIP Customers',
        description: 'VIP segment shows highest ROI (9.0x). Create more exclusive offers for this segment.',
        impact: 'high',
        effort: 'medium',
        priority: 5
      }
    ]
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatNumber = (num: number) => num.toLocaleString();

  const getEfficiencyColor = (efficiency: string) => {
    switch (efficiency) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEfficiencyIcon = (efficiency: string) => {
    switch (efficiency) {
      case 'high': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'optimization': return <Zap className="h-5 w-5 text-blue-500" />;
      case 'investment': return <TrendingUp className="h-5 w-5 text-purple-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default: return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'optimization': return 'bg-blue-50 border-blue-200';
      case 'investment': return 'bg-purple-50 border-purple-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return 'text-red-600 bg-red-100';
    if (priority <= 4) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ROI Analysis</h2>
          <p className="text-gray-600 mt-1">Comprehensive return on investment analysis and optimization insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            title="Export ROI data"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => console.log('Refresh ROI data')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Refresh ROI data"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Time Range and View Selector */}
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
            <label className="text-sm font-medium text-gray-700">View:</label>
            <div className="flex items-center space-x-2">
              {[
                { value: 'overview', label: 'Overview', icon: BarChart3 },
                { value: 'channels', label: 'Channels', icon: Target },
                { value: 'promotions', label: 'Promotions', icon: Award },
                { value: 'segments', label: 'Segments', icon: Users }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setViewMode(value as any)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    viewMode === value
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title={label}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key ROI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ROI</p>
              <p className="text-2xl font-bold text-gray-900">{roiData.roi.toFixed(2)}x</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowUpRight className="h-4 w-4 text-green-500" />
            <span className="ml-1 text-sm font-medium text-green-600">
              +{((roiData.roi - roiData.benchmarks.industryROI) / roiData.benchmarks.industryROI * 100).toFixed(1)}%
            </span>
            <span className="ml-1 text-sm text-gray-500">vs industry</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ROAS</p>
              <p className="text-2xl font-bold text-gray-900">{roiData.roas.toFixed(2)}x</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowUpRight className="h-4 w-4 text-green-500" />
            <span className="ml-1 text-sm font-medium text-green-600">
              +{((roiData.roas - roiData.benchmarks.industryROAS) / roiData.benchmarks.industryROAS * 100).toFixed(1)}%
            </span>
            <span className="ml-1 text-sm text-gray-500">vs industry</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Profit</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(roiData.netProfit)}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calculator className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-500">
              {formatPercentage(roiData.profitMargin)} margin
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Payback Period</p>
              <p className="text-2xl font-bold text-gray-900">{roiData.paybackPeriod} days</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="ml-1 text-sm font-medium text-green-600">Excellent</span>
          </div>
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Investment vs Revenue */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Investment vs Revenue</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Total Investment</span>
                  <span className="text-lg font-semibold text-gray-900">{formatCurrency(roiData.totalInvestment)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Total Revenue</span>
                  <span className="text-lg font-semibold text-gray-900">{formatCurrency(roiData.totalRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Net Profit</span>
                  <span className="text-lg font-semibold text-green-600">{formatCurrency(roiData.netProfit)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(roiData.netProfit / roiData.totalRevenue) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Profit Margin: {formatPercentage(roiData.profitMargin)}
                </p>
              </div>
            </div>
          </div>

          {/* Industry Benchmarks */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Industry Benchmarks</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">ROI</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900">{roiData.roi.toFixed(2)}x</span>
                    <span className="text-xs text-gray-500">vs {roiData.benchmarks.industryROI}x</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">ROAS</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900">{roiData.roas.toFixed(2)}x</span>
                    <span className="text-xs text-gray-500">vs {roiData.benchmarks.industryROAS}x</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">CPA</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(roiData.costPerAcquisition)}</span>
                    <span className="text-xs text-gray-500">vs {formatCurrency(roiData.benchmarks.industryCPA)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">LTV</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(roiData.lifetimeValue)}</span>
                    <span className="text-xs text-gray-500">vs {formatCurrency(roiData.benchmarks.industryLTV)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'channels' && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Channel ROI Performance</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {roiData.channelROI.map((channel) => (
                <div key={channel.channel} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getEfficiencyIcon(channel.efficiency)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{channel.channel}</p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(channel.investment)} investment • {formatCurrency(channel.revenue)} revenue
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{channel.roi.toFixed(2)}x</p>
                      <p className="text-xs text-gray-500">ROI</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{channel.roas.toFixed(2)}x</p>
                      <p className="text-xs text-gray-500">ROAS</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEfficiencyColor(channel.efficiency)}`}>
                      {channel.efficiency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'promotions' && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Promotion ROI Performance</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {roiData.promotionROI.map((promotion) => (
                <div key={promotion.promotion} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getEfficiencyIcon(promotion.efficiency)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{promotion.promotion}</p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(promotion.investment)} investment • {promotion.orders} orders • {promotion.customers} customers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{promotion.roi.toFixed(2)}x</p>
                      <p className="text-xs text-gray-500">ROI</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(promotion.revenue)}</p>
                      <p className="text-xs text-gray-500">Revenue</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEfficiencyColor(promotion.efficiency)}`}>
                      {promotion.efficiency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'segments' && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Customer Segment ROI</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {roiData.segmentROI.map((segment) => (
                <div key={segment.segment} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getEfficiencyIcon(segment.efficiency)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{segment.segment}</p>
                      <p className="text-xs text-gray-500">
                        {segment.customers} customers • {formatCurrency(segment.avgOrderValue)} AOV
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{segment.roi.toFixed(2)}x</p>
                      <p className="text-xs text-gray-500">ROI</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(segment.revenue)}</p>
                      <p className="text-xs text-gray-500">Revenue</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEfficiencyColor(segment.efficiency)}`}>
                      {segment.efficiency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Optimization Recommendations */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Optimization Recommendations</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {roiData.recommendations
              .sort((a, b) => a.priority - b.priority)
              .map((recommendation, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getRecommendationColor(recommendation.type)}`}>
                  <div className="flex items-start space-x-3">
                    {getRecommendationIcon(recommendation.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">{recommendation.title}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(recommendation.priority)}`}>
                            Priority {recommendation.priority}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            recommendation.impact === 'high' ? 'text-red-600 bg-red-100' :
                            recommendation.impact === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                            'text-green-600 bg-green-100'
                          }`}>
                            {recommendation.impact} impact
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{recommendation.description}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ROIAnalysis;

