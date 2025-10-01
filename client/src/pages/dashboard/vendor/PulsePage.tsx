import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import { Tooltip } from '@/components/ui/Tooltip';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Bell, 
  MessageSquare, 
  Users, 
  Calendar,
  Activity,
  Brain,
  Sparkles,
  ChevronRight,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Edit,
  Tag,
  Trash2,
  Eye
} from 'lucide-react';

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

export default function PulsePage() {
  const [timeRange, setTimeRange] = useState('weekly');
  const [seasonalFilter, setSeasonalFilter] = useState('current');
  const [openDropdowns, setOpenDropdowns] = useState<{ [key: number]: boolean }>({});

  // Function to get filtered data based on time range and seasonal filter
  const getFilteredData = () => {
    const baseData = { ...pulseData };
    
    // Apply seasonal filter first
    let seasonalData = { ...baseData };
    
    switch (seasonalFilter) {
      case 'summer':
        seasonalData = {
          ...baseData,
          revenue: {
            ...baseData.revenue,
            today: baseData.revenue.today * 1.2, // Summer boost
            thisWeek: baseData.revenue.thisWeek * 1.2,
            thisMonth: baseData.revenue.thisMonth * 1.2
          },
          salesWindows: {
            ...baseData.salesWindows,
            upcoming: baseData.salesWindows.upcoming + 2, // More summer events
            totalTraffic: Math.floor(baseData.salesWindows.totalTraffic * 1.3)
          },
          topProducts: baseData.topProducts.map(product => ({
            ...product,
            units: Math.floor(product.units * 1.15), // Summer product boost
            revenue: product.revenue * 1.15
          }))
        };
        break;
      case 'winter':
        seasonalData = {
          ...baseData,
          revenue: {
            ...baseData.revenue,
            today: baseData.revenue.today * 0.8, // Winter slowdown
            thisWeek: baseData.revenue.thisWeek * 0.8,
            thisMonth: baseData.revenue.thisMonth * 0.8
          },
          salesWindows: {
            ...baseData.salesWindows,
            upcoming: Math.max(1, baseData.salesWindows.upcoming - 1), // Fewer winter events
            totalTraffic: Math.floor(baseData.salesWindows.totalTraffic * 0.7)
          },
          topProducts: baseData.topProducts.map(product => ({
            ...product,
            units: Math.floor(product.units * 0.85), // Winter product decline
            revenue: product.revenue * 0.85
          }))
        };
        break;
      case 'holiday':
        seasonalData = {
          ...baseData,
          revenue: {
            ...baseData.revenue,
            today: baseData.revenue.today * 2.5, // Holiday surge
            thisWeek: baseData.revenue.thisWeek * 2.5,
            thisMonth: baseData.revenue.thisMonth * 2.5
          },
          salesWindows: {
            ...baseData.salesWindows,
            upcoming: baseData.salesWindows.upcoming + 5, // More holiday events
            totalTraffic: Math.floor(baseData.salesWindows.totalTraffic * 2.0)
          },
          topProducts: baseData.topProducts.map(product => ({
            ...product,
            units: Math.floor(product.units * 2.0), // Holiday product surge
            revenue: product.revenue * 2.0
          }))
        };
        break;
      default: // 'current'
        seasonalData = baseData;
    }
    
    // Apply time range filter to seasonal data
    switch (timeRange) {
      case 'daily':
        return {
          ...seasonalData,
          revenue: {
            today: seasonalData.revenue.today,
            thisWeek: seasonalData.revenue.today, // Show today's data
            thisMonth: seasonalData.revenue.today, // Show today's data
            todayChange: seasonalData.revenue.todayChange,
            weekChange: seasonalData.revenue.todayChange,
            monthChange: seasonalData.revenue.todayChange
          }
        };
      case 'weekly':
        return {
          ...seasonalData,
          revenue: {
            today: seasonalData.revenue.thisWeek / 7, // Average daily
            thisWeek: seasonalData.revenue.thisWeek,
            thisMonth: seasonalData.revenue.thisWeek, // Show week's data
            todayChange: seasonalData.revenue.weekChange,
            weekChange: seasonalData.revenue.weekChange,
            monthChange: seasonalData.revenue.weekChange
          }
        };
      case 'monthly':
        return {
          ...seasonalData,
          revenue: {
            today: seasonalData.revenue.thisMonth / 30, // Average daily
            thisWeek: seasonalData.revenue.thisMonth / 4, // Average weekly
            thisMonth: seasonalData.revenue.thisMonth,
            todayChange: seasonalData.revenue.monthChange,
            weekChange: seasonalData.revenue.monthChange,
            monthChange: seasonalData.revenue.monthChange
          }
        };
      default:
        return seasonalData;
    }
  };

  const filteredData = getFilteredData();

  // Helper functions for dropdown management
  const toggleDropdown = (index: number) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const closeAllDropdowns = () => {
    setOpenDropdowns({});
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        closeAllDropdowns();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    <VendorDashboardLayout>
      <div className="space-y-6">
        {/* Header with Seasonal Filter */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Business Pulse</h2>
            <p className="text-gray-600 mt-1">
              Your business at a glance - updated in real-time
              {seasonalFilter !== 'current' && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {seasonalFilters.find(f => f.id === seasonalFilter)?.label}
                </span>
              )}
            </p>
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
          </div>
        </div>

        {/* Must-Have Top-Level Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Orders */}
          <div className="bg-[#F7F2EC] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <Tooltip content="Orders waiting to be fulfilled - these need your attention to process and complete">
                <h3 className="text-lg font-semibold text-gray-900 cursor-help">Pending Orders</h3>
              </Tooltip>
              <Link href="/dashboard/vendor/orders">
                <button 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  title="View fulfillment queue"
                  aria-label="View fulfillment queue"
                >
                  View Queue
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-gray-900">{filteredData.pendingOrders.count}</span>
                <div className="flex items-center gap-1">
                  {getChangeIcon(filteredData.pendingOrders.changeType)}
                  <span className={`text-sm font-medium ${getChangeColor(filteredData.pendingOrders.changeType)}`}>
                    {filteredData.pendingOrders.change}
                  </span>
                </div>
              </div>
              <p className="text-2xl font-bold text-green-600">
                ${filteredData.pendingOrders.value.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Total value pending</p>
            </div>
          </div>

          {/* Open Sales Windows */}
          <div className="bg-[#F7F2EC] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <Tooltip content="Active sales periods where customers can place orders - track upcoming events and order volumes">
                <h3 className="text-lg font-semibold text-gray-900 cursor-help">Sales Windows</h3>
              </Tooltip>
              <Link href="/dashboard/vendor/sales-windows">
                <button 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  title="View sales windows queue"
                  aria-label="View sales windows queue"
                >
                  View Queue
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-gray-900">{filteredData.salesWindows.upcoming}</span>
                <span className="text-sm text-gray-600">Upcoming</span>
              </div>
              <p className="text-lg font-medium text-gray-900">{filteredData.salesWindows.totalTraffic}</p>
              <p className="text-sm text-gray-600">Orders associated</p>
              <div className="text-xs text-blue-600 font-medium">
                {filteredData.salesWindows.nextEvent}
              </div>
            </div>
          </div>

          {/* AI Insight Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border border-blue-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
              <Tooltip content="AI-powered insights and recommendations based on your sales data and market trends">
                <h3 className="text-lg font-semibold text-gray-900 cursor-help">AI Insight</h3>
              </Tooltip>
            </div>
            <p className="text-gray-800 font-medium mb-3">
              {seasonalFilter === 'summer' && "Summer season is boosting sales! Consider expanding outdoor product lines."}
              {seasonalFilter === 'winter' && "Winter slowdown expected. Focus on indoor products and holiday preparations."}
              {seasonalFilter === 'holiday' && "Holiday season surge! Maximize inventory and prepare for peak demand."}
              {seasonalFilter === 'current' && "Sales are up 12% vs last week, but average basket size is down. Recommend promoting bundles."}
            </p>
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Sparkles className="w-4 h-4" />
              <span>Updated 2 hours ago</span>
            </div>
          </div>
        </div>

        {/* Revenue Snapshots */}
        <div className="bg-[#F7F2EC] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between mb-6">
            <Tooltip content="Real-time revenue tracking across different time periods - shows your income trends and performance">
              <h3 className="text-xl font-semibold text-gray-900 cursor-help">Revenue Pulse</h3>
            </Tooltip>
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
                    {filteredData.revenue.todayChange}
                  </span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ${filteredData.revenue.today.toFixed(2)}
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
                    {filteredData.revenue.weekChange}
                  </span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ${filteredData.revenue.thisWeek.toFixed(2)}
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
                    {filteredData.revenue.monthChange}
                  </span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ${filteredData.revenue.thisMonth.toFixed(2)}
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
          <div className="bg-[#F7F2EC] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <Tooltip content="Visual representation of orders moving through different stages - from new orders to completed deliveries">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 cursor-help">Order Funnel</h3>
            </Tooltip>
            <div className="space-y-4">
              {Object.entries(filteredData.orderFunnel).map(([stage, count]) => (
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
          <div className="bg-[#F7F2EC] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <Tooltip content="Your best-selling products ranked by revenue and units sold - identify your most profitable items">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 cursor-help">Top Performers</h3>
            </Tooltip>
            <div className="space-y-3">
              {filteredData.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.units} units</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${product.revenue.toFixed(2)}</p>
                    {getTrendIcon(product.trend)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Health & Inventory */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Customer Health */}
          <Link href="/dashboard/vendor/analytics?tab=insights">
            <div className="bg-[#F7F2EC] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer group h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <Tooltip content="Analysis of your customer base - returning vs new customers, engagement levels, and at-risk customers">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors cursor-help">Customer Health</h3>
                </Tooltip>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Returning</span>
                  <span className="text-lg font-bold text-green-600">{filteredData.customerHealth.returning.toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">New</span>
                  <span className="text-lg font-bold text-blue-600">{filteredData.customerHealth.new.toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Engagement</span>
                  <span className="text-lg font-bold text-purple-600">{filteredData.customerHealth.engagement.toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">At Risk</span>
                  <span className="text-lg font-bold text-red-600">{filteredData.customerHealth.atRisk.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Inventory Status */}
          <Link href="/dashboard/vendor/inventory">
            <div className="bg-[#F7F2EC] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer group h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <Tooltip content="Current inventory levels, waste trends, spoilage rates, and turnover - manage your stock efficiently">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors cursor-help">Inventory Status</h3>
                </Tooltip>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Low Stock Alerts</span>
                  <span className="text-lg font-bold text-orange-600">{filteredData.inventory.lowStock}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Waste Trend</span>
                  <span className="text-lg font-bold text-green-600 capitalize">{filteredData.inventory.wasteTrend}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Spoilage Rate</span>
                  <span className="text-lg font-bold text-blue-600">{filteredData.inventory.spoilageRate.toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Turnover Rate</span>
                  <span className="text-lg font-bold text-purple-600">8.2x</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Profitability Pulse */}
          <Link href="/dashboard/vendor/analytics?tab=financial-statements">
            <div className="bg-[#F7F2EC] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer group h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <Tooltip content="Financial performance metrics - gross margin, cost of goods sold, revenue, and net profit calculations">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors cursor-help">Profitability</h3>
                </Tooltip>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Gross Margin</span>
                  <span className="text-lg font-bold text-green-600">{filteredData.profitability.grossMargin.toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">COGS</span>
                  <span className="text-lg font-bold text-red-600">${filteredData.profitability.cogs.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Revenue</span>
                  <span className="text-lg font-bold text-green-600">${filteredData.profitability.revenue.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Net Profit</span>
                  <span className="text-lg font-bold text-blue-600">${(filteredData.profitability.revenue - filteredData.profitability.cogs).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Underperformers Alert */}
        <div className="bg-[#F7F2EC] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <Tooltip content="Products with low sales performance - consider promotions, pricing adjustments, or inventory reduction">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 cursor-help">Underperformers</h3>
          </Tooltip>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredData.underperformers.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 border-orange-400">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.units} units sold</p>
                  <p className="text-sm text-orange-600">{product.inventory} in inventory</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${product.revenue.toLocaleString()}</p>
                  <div className="relative dropdown-container">
                    <button 
                      onClick={() => toggleDropdown(index)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      Take Action
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {openDropdowns[index] && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <div className="py-1">
                          <Link href="/dashboard/vendor/products">
                            <button 
                              onClick={closeAllDropdowns}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Edit className="w-4 h-4" />
                              Edit Product
                            </button>
                          </Link>
                          <Link href="/dashboard/vendor/promotions">
                            <button 
                              onClick={closeAllDropdowns}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Tag className="w-4 h-4" />
                              Create Promotion
                            </button>
                          </Link>
                          <Link href="/dashboard/vendor/analytics">
                            <button 
                              onClick={closeAllDropdowns}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Eye className="w-4 h-4" />
                              View Analytics
                            </button>
                          </Link>
                          <div className="border-t border-gray-200 my-1"></div>
                          <button 
                            onClick={() => {
                              // Handle delete action
                              console.log('Delete product:', product.name);
                              closeAllDropdowns();
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove Product
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </VendorDashboardLayout>
  );
}