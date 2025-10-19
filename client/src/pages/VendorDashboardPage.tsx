import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MotivationalQuote from '@/components/dashboard/MotivationalQuote';
import { getQuoteByCategory } from '@/data/motivationalQuotes';
import AIInsights from '@/components/crm/AIInsights';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  MessageSquare, 
  Settings, 
  Calendar,
  Activity,
  Brain,
  ChevronRight,
  TrendingDown,
  Minus,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';


const VendorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pulse');
  const [timeRange, setTimeRange] = useState('weekly');
  const [seasonalFilter, setSeasonalFilter] = useState('current');

  // Fetch vendor pulse data from API
  const { data: pulseData, isLoading: pulseLoading, error: pulseError } = useQuery({
    queryKey: ['vendor-pulse', user?.vendorProfileId, timeRange],
    queryFn: async () => {
      if (!user?.vendorProfileId) {
        throw new Error('Vendor profile not found');
      }
      const response = await axios.get(`/api/vendor/${user.vendorProfileId}/pulse?range=${timeRange}`, {
        withCredentials: true
      });
      return response.data;
    },
    enabled: !!user?.vendorProfileId,
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch AI insights for dashboard
  const { data: dashboardInsights, isLoading: insightsLoading } = useQuery({
    queryKey: ['dashboard-insights', user?.vendorProfileId],
    queryFn: async () => {
      if (!user?.vendorProfileId) return [];
      try {
        const response = await axios.get(`/api/ai-insights/vendor/${user.vendorProfileId}`, {
          withCredentials: true
        });
        return response.data.insights || [];
      } catch (error) {
        console.warn('AI insights not available:', error);
        return [];
      }
    },
    enabled: !!user?.vendorProfileId,
    retry: 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const tabs = [
    { id: 'pulse', label: '🔥 UPDATED Pulse', icon: Activity },
    { id: 'analytics-crm', label: 'Analytics & CRM', icon: TrendingUp },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'inventory-management', label: '🧠 AI Inventory', icon: Brain },
    { id: 'financials', label: 'Financials', icon: DollarSign },
    { id: 'messaging', label: 'Messaging', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const seasonalFilters = [
    { id: 'current', label: 'Current Season' },
    { id: 'summer', label: 'Summer' },
    { id: 'winter', label: 'Winter' },
    { id: 'holiday', label: 'Holiday Season' }
  ];

  const getChangeIcon = (changeType: string) => {
    if (changeType === 'positive') return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    if (changeType === 'negative') return <ArrowDownRight className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getChangeColor = (changeType: string) => {
    if (changeType === 'positive') return 'text-green-600';
    if (changeType === 'negative') return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  // Show loading state while fetching pulse data
  if (pulseLoading) {
    return (
      <VendorDashboardLayout>
        <div className="py-8 bg-white min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </VendorDashboardLayout>
    );
  }

  // Show error state if pulse data fails to load
  if (pulseError || !pulseData) {
    return (
      <VendorDashboardLayout>
        <div className="py-8 bg-white min-h-screen">
          <div className="container-responsive">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold text-red-900 mb-2">Unable to Load Dashboard</h2>
              <p className="text-red-700 mb-4">{pulseError?.message || 'Failed to fetch dashboard data'}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </VendorDashboardLayout>
    );
  }

  return (
    <VendorDashboardLayout>
      <div className="py-8 bg-white min-h-screen">
        <div className="container-responsive">
          {/* Header */}
          <DashboardHeader
            title="Business Dashboard"
            description="Your business at a glance - updated in real-time"
            currentView="Dashboard"
            icon={Activity}
            iconColor="text-blue-600"
            iconBg="bg-blue-100"
          />

          {/* Motivational Quote */}
          <MotivationalQuote
            quote={getQuoteByCategory('success').quote}
            author={getQuoteByCategory('success').author}
            icon={getQuoteByCategory('success').icon}
            variant={getQuoteByCategory('success').variant}
          />

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
        {activeTab === 'pulse' && (
          <div className="space-y-6">
            {/* Header with Seasonal Filter */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Business Pulse</h2>
                <p className="text-gray-600 mt-1">Your business at a glance - updated in real-time</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={seasonalFilter}
                  onChange={(e) => setSeasonalFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Select seasonal filter"
                  aria-label="Select seasonal filter"
                >
                  {seasonalFilters.map((filter) => (
                    <option key={filter.id} value={filter.id}>{filter.label}</option>
                  ))}
                </select>
                <button 
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Filter options"
                  aria-label="Open filter options"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Must-Have Top-Level Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pending Orders */}
              <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Pending Orders</h3>
                                  <button 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  title="View fulfillment queue"
                  aria-label="View fulfillment queue"
                >
                  View Queue
                  <ChevronRight className="w-4 h-4" />
                </button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-gray-900">{pulseData.pendingOrders.count}</span>
                    <div className="flex items-center gap-1">
                      {getChangeIcon(pulseData.pendingOrders.changeType)}
                      <span className={`text-sm font-medium ${getChangeColor(pulseData.pendingOrders.changeType)}`}>
                        {pulseData.pendingOrders.change}
                      </span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    ${pulseData.pendingOrders.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Total value pending</p>
                </div>
              </div>

              {/* Open Sales Windows */}
              <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Sales Windows</h3>
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-gray-900">{pulseData.salesWindows.upcoming}</span>
                    <span className="text-sm text-gray-600">Upcoming</span>
                  </div>
                  <p className="text-lg font-medium text-gray-900">{pulseData.salesWindows.totalTraffic}</p>
                  <p className="text-sm text-gray-600">Orders associated</p>
                  <div className="text-xs text-blue-600 font-medium">
                    {pulseData.salesWindows.nextEvent}
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Brain className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
                </div>
                <AIInsights 
                  insights={dashboardInsights || []}
                  isLoading={insightsLoading}
                  maxInsights={2}
                  showCategories={true}
                />
              </div>
            </div>

            {/* Revenue Snapshots */}
            <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Revenue Pulse</h3>
                <div className="flex bg-white rounded-lg p-1 shadow-sm">
                  {['daily', 'weekly', 'monthly'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        timeRange === range
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Today</span>
                    <div className="flex items-center gap-1">
                      {getChangeIcon('positive')}
                      <span className="text-sm font-medium text-green-600">
                        {pulseData.revenue.todayChange}
                      </span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    ${pulseData.revenue.today.toLocaleString()}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                    <div className="bg-green-500 h-1 rounded-full w-3/4"></div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">This Week</span>
                    <div className="flex items-center gap-1">
                      {getChangeIcon('positive')}
                      <span className="text-sm font-medium text-green-600">
                        {pulseData.revenue.weekChange}
                      </span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    ${pulseData.revenue.thisWeek.toLocaleString()}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                    <div className="bg-green-500 h-1 rounded-full w-5/6"></div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">This Month</span>
                    <div className="flex items-center gap-1">
                      {getChangeIcon('positive')}
                      <span className="text-sm font-medium text-green-600">
                        {pulseData.revenue.monthChange}
                      </span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    ${pulseData.revenue.thisMonth.toLocaleString()}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                    <div className="bg-green-500 h-1 rounded-full w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary KPI Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bottom Performers */}
              <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔴 Bottom Performers (Updated!)</h3>
                <div className="space-y-3">
                  {pulseData.underperformers.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border-l-4 border-red-400">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.units} units</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${product.revenue.toLocaleString()}</p>
                        <a 
                          href={`/recipes/${product.recipeId}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1"
                        >
                          View Recipe
                          <ChevronRight className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Performers */}
              <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🟢 Top Performers (Updated!)</h3>
                <div className="space-y-3">
                  {pulseData.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border-l-4 border-green-400">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.units} units</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${product.revenue.toLocaleString()}</p>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(product.trend)}
                          <a 
                            href={`/recipes/${product.recipeId}`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1"
                          >
                            View Recipe
                            <ChevronRight className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Customer Health & Inventory */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Customer Health */}
              <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Health</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Returning</span>
                    <span className="text-lg font-bold text-green-600">{pulseData.customerHealth.returning}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">New</span>
                    <span className="text-lg font-bold text-blue-600">{pulseData.customerHealth.new}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Engagement</span>
                    <span className="text-lg font-bold text-purple-600">{pulseData.customerHealth.engagement}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">At Risk</span>
                    <span className="text-lg font-bold text-red-600">{pulseData.customerHealth.atRisk}%</span>
                  </div>
                </div>
              </div>

              {/* Inventory Status */}
              <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Low Stock Alerts</span>
                    <span className="text-lg font-bold text-orange-600">{pulseData.inventory.lowStock}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Waste Trend</span>
                    <span className="text-lg font-bold text-green-600 capitalize">{pulseData.inventory.wasteTrend}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Spoilage Rate</span>
                    <span className="text-lg font-bold text-blue-600">{pulseData.inventory.spoilageRate}%</span>
                  </div>
                </div>
              </div>

              {/* Profitability Pulse */}
              <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profitability</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Gross Margin</span>
                    <span className="text-lg font-bold text-green-600">{pulseData.profitability.grossMargin}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">COGS</span>
                    <span className="text-lg font-bold text-red-600">${pulseData.profitability.cogs.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Revenue</span>
                    <span className="text-lg font-bold text-green-600">${pulseData.profitability.revenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Analytics & CRM Tab */}
        {activeTab === 'analytics-crm' && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics & CRM</h3>
            <p className="text-gray-600 mb-4">Comprehensive business analytics and customer relationship management in one place</p>
            <div className="flex justify-center gap-4">
              <a 
                href="/dashboard/vendor/analytics-crm" 
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Open Analytics & CRM
              </a>
            </div>
            <div className="mt-6 text-sm text-gray-500">
              <p>Includes: Business Snapshot, Taxes, Customer 360, Pipeline, Tasks, and Customer Health</p>
            </div>
          </div>
        )}

        {/* AI Inventory Management Tab */}
        {activeTab === 'inventory-management' && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">🧠 AI Inventory Management</h3>
            <p className="text-gray-600 mb-4">Smart inventory control with AI insights, receipt parsing, and automated restocking</p>
            <div className="flex justify-center gap-4">
              <a 
                href="/dashboard/vendor/inventory-management" 
                className="px-6 py-3 bg-[#7F232E] text-white rounded-lg hover:bg-[#7F232E]/90 transition-colors"
              >
                Open AI Inventory
              </a>
            </div>
            <div className="mt-6 text-sm text-gray-500">
              <p>Features: Restock alerts, price watches, receipt scanning, seasonal forecasts, and B2B sourcing</p>
            </div>
          </div>
        )}

        {/* Other tabs content would go here */}
        {activeTab !== 'pulse' && activeTab !== 'analytics-crm' && activeTab !== 'inventory-management' && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{tabs.find(t => t.id === activeTab)?.label} Coming Soon</h3>
            <p className="text-gray-600">This section is under development</p>
          </div>
        )}
        </div>
      </div>
    </VendorDashboardLayout>
  );
};

export default VendorDashboardPage; 
