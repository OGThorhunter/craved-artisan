import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import { Tooltip } from '@/components/ui/Tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { 
  TrendingUp, 
  Brain,
  Sparkles,
  ChevronRight,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Store,
  Settings,
  ExternalLink,
  Copy,
  Check
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
    { name: 'Handmade Soap Set', units: 45, revenue: 1247.50, trend: 'up', recipeId: 'soap-recipe-001' },
    { name: 'Artisan Bread', units: 38, revenue: 1083.00, trend: 'up', recipeId: 'bread-recipe-002' },
    { name: 'Organic Honey', units: 32, revenue: 896.00, trend: 'stable', recipeId: 'honey-recipe-003' }
  ],
  underperformers: [
    { name: 'Handcrafted Mug', units: 3, revenue: 56.25, inventory: 12, recipeId: 'mug-recipe-001' },
    { name: 'Lavender Sachet', units: 2, revenue: 18.00, inventory: 8, recipeId: 'sachet-recipe-002' },
    { name: 'Artisan Candle', units: 1, revenue: 12.50, inventory: 15, recipeId: 'candle-recipe-003' }
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
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('weekly');
  const [urlCopied, setUrlCopied] = useState(false);
  const [vendorProfileId, setVendorProfileId] = useState<string | null>(null);

  // Fetch vendor profile to get the vendor slug for storefront URL
  useEffect(() => {
    const fetchVendorProfile = async () => {
      try {
        const response = await fetch('/api/vendor/profile', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          // Use slug if available, otherwise create one from storeName or use ID
          const slug = data.slug || data.storeName?.toLowerCase().replace(/\s+/g, '-') || data.id;
          setVendorProfileId(slug);
        } else {
          // Fallback to mock vendor slug if API not available
          console.log('Using mock vendor profile slug');
          setVendorProfileId('artisan-bakes-atlanta');
        }
      } catch (error) {
        console.error('Failed to fetch vendor profile, using mock data:', error);
        // Fallback to demo storefront slug
        setVendorProfileId('artisan-bakes-atlanta');
      }
    };

    if (user) {
      fetchVendorProfile();
    }
  }, [user]);

  // Generate storefront URL using vendor slug (uses DemoStorefrontPage template)
  const storefrontUrl = vendorProfileId 
    ? `${window.location.origin}/store/${vendorProfileId}`
    : `${window.location.origin}/store/preview`;

  // Copy URL to clipboard
  const copyStorefrontUrl = async () => {
    try {
      await navigator.clipboard.writeText(storefrontUrl);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  // Function to get filtered data based on time range
  const getFilteredData = () => {
    const baseData = { ...pulseData };
    
    // Apply time range filter
    switch (timeRange) {
      case 'daily':
        return {
          ...baseData,
          revenue: {
            today: baseData.revenue.today,
            thisWeek: baseData.revenue.today, // Show today's data
            thisMonth: baseData.revenue.today, // Show today's data
            todayChange: baseData.revenue.todayChange,
            weekChange: baseData.revenue.todayChange,
            monthChange: baseData.revenue.todayChange
          }
        };
      case 'weekly':
        return {
          ...baseData,
          revenue: {
            today: baseData.revenue.thisWeek / 7, // Average daily
            thisWeek: baseData.revenue.thisWeek,
            thisMonth: baseData.revenue.thisWeek, // Show week's data
            todayChange: baseData.revenue.weekChange,
            weekChange: baseData.revenue.weekChange,
            monthChange: baseData.revenue.weekChange
          }
        };
      case 'monthly':
        return {
          ...baseData,
          revenue: {
            today: baseData.revenue.thisMonth / 30, // Average daily
            thisWeek: baseData.revenue.thisMonth / 4, // Average weekly
            thisMonth: baseData.revenue.thisMonth,
            todayChange: baseData.revenue.monthChange,
            weekChange: baseData.revenue.monthChange,
            monthChange: baseData.revenue.monthChange
          }
        };
      default:
        return baseData;
    }
  };

  const filteredData = getFilteredData();


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
            </p>
          </div>
        </div>

        {/* Storefront Preview Box */}
        <div className="bg-[#F7F2EC] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <Store className="w-6 h-6 text-gray-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Storefront</h3>
                <p className="text-sm text-gray-600 mb-3">
                  This is your public-facing store where customers discover and purchase your products
                </p>
                
                {/* Copyable URL */}
                <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-3 border border-gray-200 mb-4">
                  <code className="text-sm text-blue-600 flex-1 truncate font-mono">
                    {storefrontUrl}
                  </code>
                  <button
                    onClick={copyStorefrontUrl}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                    title="Copy URL to clipboard"
                    aria-label="Copy URL to clipboard"
                  >
                    {urlCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <a
                    href={storefrontUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Storefront
                  </a>
                  <Link href="/dashboard/vendor/site-settings" className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium cursor-pointer">
                    <Settings className="w-4 h-4" />
                    Storefront Settings
                  </Link>
                </div>
              </div>
            </div>
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
              Sales are up 12% vs last week, but average basket size is down. Recommend promoting bundles.
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
          {/* Bottom Performers */}
          <div className="bg-[#F7F2EC] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <Tooltip content="Products with low sales performance - identify areas for improvement and optimization">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 cursor-help">🔴 Bottom Performers (Updated!)</h3>
            </Tooltip>
            <div className="space-y-3">
              {filteredData.underperformers.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 border-red-400">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.units} units</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${product.revenue.toFixed(2)}</p>
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
          <div className="bg-[#F7F2EC] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <Tooltip content="Your best-selling products ranked by revenue and units sold - identify your most profitable items">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 cursor-help">🟢 Top Performers (Updated!)</h3>
            </Tooltip>
            <div className="space-y-3">
              {filteredData.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 border-green-400">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.units} units</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${product.revenue.toFixed(2)}</p>
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

        {/* All Three Cards in One Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Customer Health */}
          <Link href="/dashboard/vendor/analytics?tab=insights">
            <div className="bg-[#F7F2EC] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer group h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Customer Health</h3>
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
              
              {/* Customer Health Note */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 italic text-center">
                  Track customer loyalty, acquisition, and engagement to understand your customer base health
                </div>
              </div>
            </div>
          </Link>

          {/* Inventory Status */}
          <Link href="/dashboard/vendor/inventory">
            <div className="bg-[#F7F2EC] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer group h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Inventory Status</h3>
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
              
              {/* Inventory Status Note */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 italic text-center">
                  Monitor stock levels, waste trends, and turnover to optimize inventory management
                </div>
              </div>
            </div>
          </Link>

          {/* Profitability */}
          <Link href="/dashboard/vendor/analytics?tab=financial-statements">
            <div className="bg-[#F7F2EC] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer group h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Profitability</h3>
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
              
              {/* Profitability Note */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 italic text-center">
                  Analyze revenue, costs, and margins to understand your business profitability
                </div>
              </div>
            </div>
          </Link>
        </div>

      </div>
    </VendorDashboardLayout>
  );
}