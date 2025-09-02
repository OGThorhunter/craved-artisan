import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Bell, 
  MessageSquare, 
  Settings, 
  Users, 
  Calendar,
  Activity,
  Brain,
  Sparkles,
  ChevronRight,
  TrendingDown,
  Minus,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// Mock vendor data
const vendor = {
  id: 'mock-user-id',
  name: 'Sarah Johnson',
  storeName: 'Artisan Creations',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face',
  verified: true,
  averageRating: 4.8,
  totalProducts: 24,
  totalRevenue: 15420,
  totalOrders: 342,
  totalCustomers: 156
};

// Mock Pulse data
const pulseData = {
  pendingOrders: {
    count: 8,
    value: 1247.50,
    change: '+15%',
    changeType: 'positive'
  },
  salesWindows: {
    upcoming: 3,
    totalTraffic: 156,
    nextEvent: 'Farmers Market - Tomorrow 9AM'
  },
  revenue: {
    today: 342.50,
    thisWeek: 2847.30,
    thisMonth: 12450.80,
    todayChange: '+8.5%',
    weekChange: '+12.3%',
    monthChange: '+5.7%'
  },
  orderFunnel: {
    new: 12,
    inProgress: 8,
    ready: 5,
    completed: 342
  },
  topProducts: [
    { name: 'Handmade Soap Set', units: 45, revenue: 1247.50, trend: 'up' },
    { name: 'Artisan Bread', units: 38, revenue: 1083.00, trend: 'up' },
    { name: 'Organic Honey', units: 32, revenue: 896.00, trend: 'stable' }
  ],
  underperformers: [
    { name: 'Handcrafted Mug', units: 3, revenue: 56.25, inventory: 12 },
    { name: 'Lavender Sachet', units: 2, revenue: 18.00, inventory: 8 }
  ],
  customerHealth: {
    returning: 78,
    new: 22,
    engagement: 85,
    atRisk: 12
  },
  inventory: {
    lowStock: 3,
    wasteTrend: 'decreasing',
    spoilageRate: 2.1
  },
  profitability: {
    grossMargin: 68.5,
    cogs: 5120.30,
    revenue: 15420.00
  }
};

const VendorDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pulse');
  const [timeRange, setTimeRange] = useState('weekly');
  const [seasonalFilter, setSeasonalFilter] = useState('current');

  const tabs = [
    { id: 'pulse', label: 'Pulse', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'crm', label: 'CRM', icon: Users },
    { id: 'inventory', label: 'Inventory', icon: Package },
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

  return (
    <div className="min-h-screen bg-[#F7F2EC]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={vendor.avatar} 
              alt={vendor.name}
              className="w-12 h-12 rounded-full border-2 border-gray-200"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{vendor.storeName}</h1>
              <p className="text-gray-600">Welcome back, {vendor.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
                            <button 
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Notifications"
                  aria-label="View notifications"
                >
                  <Bell className="w-6 h-6" />
                </button>
                <button 
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Settings"
                  aria-label="Open settings"
                >
                  <Settings className="w-6 h-6" />
                </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8">
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
      <div className="p-6">
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

              {/* AI Insight Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border border-blue-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Brain className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Insight</h3>
                </div>
                <p className="text-gray-800 font-medium mb-3">
                  Sales are up 12% vs last week, but average basket size is down. Recommend promoting bundles.
                </p>
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Sparkles className="w-4 h-4" />
                  <span>Updated 2 hours ago</span>
                </div>
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
                    <div className="bg-green-500 h-1 rounded-full" style={{ width: '75%' }}></div>
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
                    <div className="bg-green-500 h-1 rounded-full" style={{ width: '85%' }}></div>
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
                    <div className="bg-green-500 h-1 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary KPI Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Funnel */}
              <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Funnel</h3>
                <div className="space-y-4">
                  {Object.entries(pulseData.orderFunnel).map(([stage, count]) => (
                    <div key={stage} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          stage === 'new' ? 'bg-blue-500' :
                          stage === 'inProgress' ? 'bg-yellow-500' :
                          stage === 'ready' ? 'bg-orange-500' :
                          'bg-green-500'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {stage === 'inProgress' ? 'In Progress' : stage}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Performance */}
              <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
                <div className="space-y-3">
                  {pulseData.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.units} units</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${product.revenue.toLocaleString()}</p>
                        {getTrendIcon(product.trend)}
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

            {/* Underperformers Alert */}
            <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Underperformers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pulseData.underperformers.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border-l-4 border-orange-400">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.units} units sold</p>
                      <p className="text-sm text-orange-600">{product.inventory} in inventory</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${product.revenue.toLocaleString()}</p>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Take Action
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Other tabs content would go here */}
        {activeTab !== 'pulse' && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{tabs.find(t => t.id === activeTab)?.label} Coming Soon</h3>
            <p className="text-gray-600">This section is under development</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboardPage; 
