import React, { useState } from 'react';
import {
  Target,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  ShoppingCart,
  Percent,
  DollarSign,
  Zap,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Activity,
  Eye,
  MousePointer,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Award,
  Lightbulb
} from 'lucide-react';

interface ConversionData {
  timeRange: string;
  overallConversion: number;
  conversionTrend: number;
  totalVisitors: number;
  totalConversions: number;
  conversionValue: number;
  avgOrderValue: number;
  conversionFunnel: Array<{
    stage: string;
    visitors: number;
    conversions: number;
    rate: number;
    dropoff: number;
  }>;
  topPerformingPages: Array<{
    page: string;
    visitors: number;
    conversions: number;
    rate: number;
    value: number;
  }>;
  devicePerformance: Array<{
    device: string;
    visitors: number;
    conversions: number;
    rate: number;
    value: number;
  }>;
  trafficSourcePerformance: Array<{
    source: string;
    visitors: number;
    conversions: number;
    rate: number;
    value: number;
  }>;
  optimizationOpportunities: Array<{
    type: 'page' | 'funnel' | 'device' | 'source';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    potentialGain: number;
  }>;
  abTestResults: Array<{
    test: string;
    status: 'running' | 'completed' | 'paused';
    variant: string;
    visitors: number;
    conversions: number;
    rate: number;
    improvement: number;
  }>;
}

const ConversionOptimization: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('conversion');
  const [viewMode, setViewMode] = useState<'overview' | 'funnel' | 'pages' | 'devices' | 'sources'>('overview');

  // Mock conversion data
  const conversionData: ConversionData = {
    timeRange: '30d',
    overallConversion: 12.5,
    conversionTrend: 15.2,
    totalVisitors: 10000,
    totalConversions: 1250,
    conversionValue: 125750,
    avgOrderValue: 100.60,
    conversionFunnel: [
      { stage: 'Homepage', visitors: 10000, conversions: 8500, rate: 85.0, dropoff: 0 },
      { stage: 'Product Page', visitors: 8500, conversions: 4200, rate: 49.4, dropoff: 50.6 },
      { stage: 'Add to Cart', visitors: 4200, conversions: 2800, rate: 66.7, dropoff: 33.3 },
      { stage: 'Checkout', visitors: 2800, conversions: 1800, rate: 64.3, dropoff: 35.7 },
      { stage: 'Purchase', visitors: 1800, conversions: 1250, rate: 69.4, dropoff: 30.6 }
    ],
    topPerformingPages: [
      { page: '/products/holiday-sale', visitors: 2500, conversions: 450, rate: 18.0, value: 45000 },
      { page: '/products/new-arrivals', visitors: 1800, conversions: 280, rate: 15.6, value: 28000 },
      { page: '/products/featured', visitors: 2200, conversions: 320, rate: 14.5, value: 32000 },
      { page: '/products/clearance', visitors: 1500, conversions: 200, rate: 13.3, value: 20000 },
      { page: '/products/seasonal', visitors: 1200, conversions: 150, rate: 12.5, value: 15000 }
    ],
    devicePerformance: [
      { device: 'Desktop', visitors: 4500, conversions: 650, rate: 14.4, value: 65000 },
      { device: 'Mobile', visitors: 4000, conversions: 450, rate: 11.3, value: 45000 },
      { device: 'Tablet', visitors: 1500, conversions: 150, rate: 10.0, value: 15750 }
    ],
    trafficSourcePerformance: [
      { source: 'Email', visitors: 3000, conversions: 600, rate: 20.0, value: 60000 },
      { source: 'Social Media', visitors: 2500, conversions: 350, rate: 14.0, value: 35000 },
      { source: 'Organic Search', visitors: 2000, conversions: 200, rate: 10.0, value: 20000 },
      { source: 'Paid Search', visitors: 1500, conversions: 75, rate: 5.0, value: 7500 },
      { source: 'Direct', visitors: 1000, conversions: 25, rate: 2.5, value: 2500 }
    ],
    optimizationOpportunities: [
      {
        type: 'funnel',
        title: 'Product Page Optimization',
        description: 'Product page has 50.6% dropoff rate. Optimize product images, descriptions, and CTAs.',
        impact: 'high',
        effort: 'medium',
        potentialGain: 25.0
      },
      {
        type: 'device',
        title: 'Mobile Experience Improvement',
        description: 'Mobile conversion rate (11.3%) is significantly lower than desktop (14.4%).',
        impact: 'high',
        effort: 'high',
        potentialGain: 20.0
      },
      {
        type: 'source',
        title: 'Paid Search Optimization',
        description: 'Paid search shows very low conversion (5.0%). Review keywords and landing pages.',
        impact: 'medium',
        effort: 'medium',
        potentialGain: 15.0
      },
      {
        type: 'page',
        title: 'Homepage CTA Enhancement',
        description: 'Homepage has 15% dropoff. Improve call-to-action buttons and navigation.',
        impact: 'medium',
        effort: 'low',
        potentialGain: 10.0
      }
    ],
    abTestResults: [
      { test: 'Checkout Button Color', status: 'completed', variant: 'Green Button', visitors: 1000, conversions: 180, rate: 18.0, improvement: 12.5 },
      { test: 'Product Page Layout', status: 'running', variant: 'Grid Layout', visitors: 500, conversions: 85, rate: 17.0, improvement: 8.3 },
      { test: 'Email Subject Lines', status: 'completed', variant: 'Personalized', visitors: 2000, conversions: 400, rate: 20.0, improvement: 15.0 },
      { test: 'Mobile Navigation', status: 'paused', variant: 'Hamburger Menu', visitors: 300, conversions: 45, rate: 15.0, improvement: 5.0 }
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

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused': return <XCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Conversion Optimization</h2>
          <p className="text-gray-600 mt-1">Analyze and optimize conversion rates across your funnel</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => console.log('Export conversion data')}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            title="Export conversion data"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => console.log('Refresh conversion data')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Refresh conversion data"
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
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">View:</label>
            <div className="flex items-center space-x-2">
              {[
                { value: 'overview', label: 'Overview', icon: BarChart3 },
                { value: 'funnel', label: 'Funnel', icon: Target },
                { value: 'pages', label: 'Pages', icon: Eye },
                { value: 'devices', label: 'Devices', icon: Activity },
                { value: 'sources', label: 'Sources', icon: Users }
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

      {/* Key Conversion Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(conversionData.overallConversion)}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {getTrendIcon(conversionData.conversionTrend)}
            <span className={`ml-1 text-sm font-medium ${getTrendColor(conversionData.conversionTrend)}`}>
              +{formatPercentage(conversionData.conversionTrend)}
            </span>
            <span className="ml-1 text-sm text-gray-500">vs previous</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Visitors</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(conversionData.totalVisitors)}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversions</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(conversionData.totalConversions)}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(conversionData.conversionValue)}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion Funnel */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Conversion Funnel</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {conversionData.conversionFunnel.map((stage, index) => (
                  <div key={stage.stage} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{stage.stage}</p>
                        <p className="text-xs text-gray-500">{formatNumber(stage.visitors)} visitors</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatPercentage(stage.rate)}</p>
                      <p className="text-xs text-gray-500">
                        {stage.dropoff > 0 ? `${formatPercentage(stage.dropoff)} dropoff` : 'Entry point'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* A/B Test Results */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">A/B Test Results</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {conversionData.abTestResults.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{test.test}</p>
                        <p className="text-xs text-gray-500">{test.variant}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatPercentage(test.rate)}</p>
                      <p className="text-xs text-green-600">+{formatPercentage(test.improvement)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'funnel' && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Detailed Conversion Funnel</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {conversionData.conversionFunnel.map((stage, index) => (
                <div key={stage.stage} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{stage.stage}</h4>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatPercentage(stage.rate)}</p>
                      <p className="text-xs text-gray-500">{formatNumber(stage.conversions)} conversions</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${stage.rate}%` }}
                    ></div>
                  </div>
                  {index < conversionData.conversionFunnel.length - 1 && (
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                      <ArrowDownRight className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Optimization Opportunities */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Optimization Opportunities</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {conversionData.optimizationOpportunities.map((opportunity, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">{opportunity.title}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(opportunity.impact)}`}>
                        {opportunity.impact} impact
                      </span>
                      <span className="text-xs text-gray-500">
                        +{formatPercentage(opportunity.potentialGain)} potential
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{opportunity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionOptimization;












