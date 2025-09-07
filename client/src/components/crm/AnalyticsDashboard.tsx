import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Target, 
  Calendar, 
  Filter,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Settings,
  PieChart,
  LineChart,
  Activity,
  Mail,
  MessageSquare,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Award,
  Trophy,
  ArrowUp,
  ArrowDown,
  Minus,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalCustomers: number;
    totalRevenue: number;
    totalOpportunities: number;
    conversionRate: number;
    averageDealSize: number;
    customerLifetimeValue: number;
    churnRate: number;
    growthRate: number;
  };
  sales: {
    revenue: {
      current: number;
      previous: number;
      change: number;
      changePercent: number;
    };
    deals: {
      won: number;
      lost: number;
      inProgress: number;
      total: number;
    };
    pipeline: {
      totalValue: number;
      averageDealSize: number;
      averageSalesCycle: number;
    };
  };
  customers: {
    new: number;
    returning: number;
    churned: number;
    total: number;
    segments: {
      name: string;
      count: number;
      percentage: number;
    }[];
  };
  marketing: {
    campaigns: {
      total: number;
      active: number;
      completed: number;
      scheduled: number;
    };
    communications: {
      emails: number;
      calls: number;
      meetings: number;
      total: number;
    };
    automation: {
      rules: number;
      triggered: number;
      completed: number;
      conversionRate: number;
    };
  };
  performance: {
    topPerforming: {
      customers: Array<{
        id: string;
        name: string;
        revenue: number;
        growth: number;
      }>;
      campaigns: Array<{
        id: string;
        name: string;
        openRate: number;
        clickRate: number;
        conversionRate: number;
      }>;
      opportunities: Array<{
        id: string;
        name: string;
        value: number;
        probability: number;
        stage: string;
      }>;
    };
    trends: {
      revenue: Array<{
        date: string;
        value: number;
      }>;
      customers: Array<{
        date: string;
        value: number;
      }>;
      conversions: Array<{
        date: string;
        value: number;
      }>;
    };
  };
  kpis: {
    salesVelocity: number;
    leadResponseTime: number;
    customerSatisfaction: number;
    netPromoterScore: number;
    customerAcquisitionCost: number;
    customerLifetimeValue: number;
    revenuePerEmployee: number;
    dealCloseRate: number;
  };
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
  timeRange: '7d' | '30d' | '90d' | '1y' | 'all';
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y' | 'all') => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  data,
  timeRange,
  onTimeRangeChange,
  onRefresh,
  isLoading = false,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('revenue');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'comparative'>('overview');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Toggle card expansion
  const toggleCard = (cardId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  // Get change indicator
  const getChangeIndicator = (change: number) => {
    if (change > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  // Get change color
  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Format number
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive insights into your CRM performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                viewMode === 'overview' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                viewMode === 'detailed' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Detailed
            </button>
            <button
              onClick={() => setViewMode('comparative')}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                viewMode === 'comparative' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Comparative
            </button>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Time Range</h3>
          <div className="flex space-x-2">
            {['7d', '30d', '90d', '1y', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => onTimeRangeChange(range as any)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  timeRange === range
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {range === '7d' ? '7 Days' : 
                 range === '30d' ? '30 Days' :
                 range === '90d' ? '90 Days' :
                 range === '1y' ? '1 Year' : 'All Time'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <button
              onClick={() => toggleCard('customers')}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              {expandedCards.has('customers') ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(data.overview.totalCustomers)}</p>
            <div className="flex items-center mt-2">
              {getChangeIndicator(data.overview.growthRate)}
              <span className={`text-sm font-medium ${getChangeColor(data.overview.growthRate)}`}>
                {formatPercentage(Math.abs(data.overview.growthRate))} vs previous period
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <button
              onClick={() => toggleCard('revenue')}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              {expandedCards.has('revenue') ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.overview.totalRevenue)}</p>
            <div className="flex items-center mt-2">
              {getChangeIndicator(data.sales.revenue.change)}
              <span className={`text-sm font-medium ${getChangeColor(data.sales.revenue.change)}`}>
                {formatPercentage(Math.abs(data.sales.revenue.changePercent))} vs previous period
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <button
              onClick={() => toggleCard('conversion')}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              {expandedCards.has('conversion') ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
          <div>
            <p className="text-sm text-gray-600">Conversion Rate</p>
            <p className="text-2xl font-bold text-gray-900">{formatPercentage(data.overview.conversionRate)}</p>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-500">Based on {formatNumber(data.overview.totalOpportunities)} opportunities</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <button
              onClick={() => toggleCard('clv')}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              {expandedCards.has('clv') ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
          <div>
            <p className="text-sm text-gray-600">Customer LTV</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.overview.customerLifetimeValue)}</p>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-500">Average deal size: {formatCurrency(data.overview.averageDealSize)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      {viewMode === 'detailed' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Performance */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Sales Performance</h3>
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Settings className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(data.sales.revenue.current)}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center">
                    {getChangeIndicator(data.sales.revenue.change)}
                    <span className={`text-sm font-medium ${getChangeColor(data.sales.revenue.change)}`}>
                      {formatPercentage(Math.abs(data.sales.revenue.changePercent))}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">vs previous period</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Won Deals</p>
                  <p className="text-2xl font-bold text-green-600">{data.sales.deals.won}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Lost Deals</p>
                  <p className="text-2xl font-bold text-red-600">{data.sales.deals.lost}</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Pipeline Value</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(data.sales.pipeline.totalValue)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Average deal size: {formatCurrency(data.sales.pipeline.averageDealSize)}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Analytics */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Customer Analytics</h3>
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Settings className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">New Customers</p>
                  <p className="text-2xl font-bold text-green-600">{data.customers.new}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Returning</p>
                  <p className="text-2xl font-bold text-blue-600">{data.customers.returning}</p>
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Churned Customers</p>
                <p className="text-2xl font-bold text-red-600">{data.customers.churned}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Churn rate: {formatPercentage(data.overview.churnRate)}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">Customer Segments</p>
                {data.customers.segments.map((segment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{segment.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{segment.count}</span>
                      <span className="text-xs text-gray-500">({formatPercentage(segment.percentage)})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Marketing Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Email Campaigns</h3>
            <Mail className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Campaigns</span>
              <span className="text-lg font-bold text-gray-900">{data.marketing.campaigns.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active</span>
              <span className="text-lg font-bold text-green-600">{data.marketing.campaigns.active}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="text-lg font-bold text-blue-600">{data.marketing.campaigns.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Scheduled</span>
              <span className="text-lg font-bold text-orange-600">{data.marketing.campaigns.scheduled}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Communications</h3>
            <MessageSquare className="h-5 w-5 text-purple-600" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Emails</span>
              <span className="text-lg font-bold text-gray-900">{data.marketing.communications.emails}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Calls</span>
              <span className="text-lg font-bold text-gray-900">{data.marketing.communications.calls}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Meetings</span>
              <span className="text-lg font-bold text-gray-900">{data.marketing.communications.meetings}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total</span>
              <span className="text-lg font-bold text-gray-900">{data.marketing.communications.total}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Automation</h3>
            <Zap className="h-5 w-5 text-orange-600" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Rules</span>
              <span className="text-lg font-bold text-gray-900">{data.marketing.automation.rules}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Triggered</span>
              <span className="text-lg font-bold text-blue-600">{data.marketing.automation.triggered}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="text-lg font-bold text-green-600">{data.marketing.automation.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Conversion Rate</span>
              <span className="text-lg font-bold text-purple-600">{formatPercentage(data.marketing.automation.conversionRate)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Key Performance Indicators</h3>
          <div className="flex items-center space-x-2">
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <Settings className="h-4 w-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="p-3 bg-blue-100 rounded-full w-12 h-12 mx-auto mb-3">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Sales Velocity</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.kpis.salesVelocity)}</p>
            <p className="text-xs text-gray-500">per day</p>
          </div>
          
          <div className="text-center">
            <div className="p-3 bg-green-100 rounded-full w-12 h-12 mx-auto mb-3">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Lead Response Time</p>
            <p className="text-2xl font-bold text-gray-900">{data.kpis.leadResponseTime}m</p>
            <p className="text-xs text-gray-500">average</p>
          </div>
          
          <div className="text-center">
            <div className="p-3 bg-purple-100 rounded-full w-12 h-12 mx-auto mb-3">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">Customer Satisfaction</p>
            <p className="text-2xl font-bold text-gray-900">{data.kpis.customerSatisfaction}/10</p>
            <p className="text-xs text-gray-500">rating</p>
          </div>
          
          <div className="text-center">
            <div className="p-3 bg-orange-100 rounded-full w-12 h-12 mx-auto mb-3">
              <Award className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600">Net Promoter Score</p>
            <p className="text-2xl font-bold text-gray-900">{data.kpis.netPromoterScore}</p>
            <p className="text-xs text-gray-500">NPS</p>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Customers</h3>
            <Trophy className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="space-y-3">
            {data.performance.topPerforming.customers.map((customer, index) => (
              <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(customer.revenue)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center">
                    {getChangeIndicator(customer.growth)}
                    <span className={`text-sm font-medium ${getChangeColor(customer.growth)}`}>
                      {formatPercentage(Math.abs(customer.growth))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Campaigns</h3>
            <Mail className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-3">
            {data.performance.topPerforming.campaigns.map((campaign, index) => (
              <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-green-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{campaign.name}</p>
                    <p className="text-xs text-gray-500">{formatPercentage(campaign.conversionRate)} conversion</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatPercentage(campaign.openRate)}</p>
                  <p className="text-xs text-gray-500">open rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Opportunities</h3>
            <Target className="h-5 w-5 text-purple-600" />
          </div>
          <div className="space-y-3">
            {data.performance.topPerforming.opportunities.map((opportunity, index) => (
              <div key={opportunity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{opportunity.name}</p>
                    <p className="text-xs text-gray-500">{opportunity.stage}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(opportunity.value)}</p>
                  <p className="text-xs text-gray-500">{formatPercentage(opportunity.probability)} probability</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;


