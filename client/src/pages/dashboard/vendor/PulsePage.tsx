import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  TrendingUp, 
  Brain,
  ChevronRight,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Store,
  Settings,
  ExternalLink,
  Copy,
  Check,
  DollarSign,
  Users,
  ShoppingCart
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

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
    { name: 'Artisan Sourdough Bread', units: 45, revenue: 1247.50, trend: 'up', recipeId: 'sourdough-bread' },
    { name: 'Chocolate Croissant', units: 38, revenue: 1083.00, trend: 'up', recipeId: 'chocolate-croissant' },
    { name: 'Whole Wheat Bread', units: 32, revenue: 896.00, trend: 'stable', recipeId: 'whole-wheat-bread' }
  ],
  underperformers: [
    { name: 'Artisan Sourdough Bread', units: 3, revenue: 56.25, inventory: 12, recipeId: 'sourdough-bread' },
    { name: 'Chocolate Croissant', units: 2, revenue: 18.00, inventory: 8, recipeId: 'chocolate-croissant' },
    { name: 'Whole Wheat Bread', units: 1, revenue: 12.50, inventory: 15, recipeId: 'whole-wheat-bread' }
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
  keyMetrics: {
    averageOrderValue: 45.20,
    conversionRate: 12.8,
    customerRetention: 78.5,
    orderCompletion: 94.2
  },
  // New metrics for the redesigned revenue pulse
  sales: {
    current: 2847.30,
    previous: 2520.15,
    change: '+12.9%',
    changeType: 'positive'
  },
  followers: {
    current: 1247,
    previous: 1089,
    change: '+14.5%',
    changeType: 'positive'
  },
  averageOrderValue: {
    current: 45.20,
    previous: 42.80,
    change: '+5.6%',
    changeType: 'positive'
  },
  // Chart data for different metrics
  chartData: {
    sales: [
      { date: '2024-01-01', value: 1200 },
      { date: '2024-01-02', value: 1350 },
      { date: '2024-01-03', value: 1100 },
      { date: '2024-01-04', value: 1450 },
      { date: '2024-01-05', value: 1600 },
      { date: '2024-01-06', value: 1750 },
      { date: '2024-01-07', value: 1900 }
    ],
    followers: [
      { date: '2024-01-01', value: 1000 },
      { date: '2024-01-02', value: 1025 },
      { date: '2024-01-03', value: 1050 },
      { date: '2024-01-04', value: 1080 },
      { date: '2024-01-05', value: 1110 },
      { date: '2024-01-06', value: 1150 },
      { date: '2024-01-07', value: 1247 }
    ],
    averageOrderValue: [
      { date: '2024-01-01', value: 42.50 },
      { date: '2024-01-02', value: 43.20 },
      { date: '2024-01-03', value: 41.80 },
      { date: '2024-01-04', value: 44.10 },
      { date: '2024-01-05', value: 45.30 },
      { date: '2024-01-06', value: 44.80 },
      { date: '2024-01-07', value: 45.20 }
    ]
  }
};

// Mock AI insights for pulse page
const pulseInsights = [
  {
    id: 'pulse-1',
    type: 'recommendation' as const,
    title: 'Sales Performance Optimization',
    description: 'Sales are up 12% vs last week, but average basket size is down. Recommend promoting bundles to increase order value.',
    confidence: 85,
    action: 'Create bundle promotions for high-margin items',
    priority: 'high' as const,
    category: 'sales-opportunity' as const
  },
  {
    id: 'pulse-2',
    type: 'warning' as const,
    title: 'Inventory Alert',
    description: 'Low stock detected on 3 popular items. Consider restocking before next sales window.',
    confidence: 92,
    action: 'Review inventory levels and place restock orders',
    priority: 'high' as const,
    category: 'customer-health' as const
  },
  {
    id: 'pulse-3',
    type: 'success' as const,
    title: 'Customer Engagement Up',
    description: 'Customer engagement increased 18% this week. Your social media strategy is working well.',
    confidence: 78,
    action: 'Continue current social media approach',
    priority: 'medium' as const,
    category: 'customer-health' as const
  },
  {
    id: 'pulse-4',
    type: 'info' as const,
    title: 'Peak Hours Analysis',
    description: 'Your busiest sales hours are 2-4 PM. Consider scheduling more staff during these times.',
    confidence: 88,
    action: 'Adjust staffing schedule for peak hours',
    priority: 'medium' as const,
    category: 'sales-opportunity' as const
  }
];

export default function PulsePage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('7days');
  const [urlCopied, setUrlCopied] = useState(false);
  const [vendorProfileId, setVendorProfileId] = useState<string | null>(null);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('sales');

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
  // Generate chart data based on timeframe
  const getChartData = (metric: string, timeframe: string) => {
    const baseData = pulseData.chartData[metric];
    const today = new Date();
    
    switch (timeframe) {
      case '7days':
        // Last 7 days
        return Array.from({ length: 7 }, (_, i) => {
          const date = new Date(today);
          date.setDate(date.getDate() - (6 - i));
          return {
            date: date.toISOString().split('T')[0],
            value: baseData[Math.min(i, baseData.length - 1)].value * (0.8 + Math.random() * 0.4)
          };
        });
      case '30days':
        // Last 30 days (30 data points, one per day)
        return Array.from({ length: 30 }, (_, i) => {
          const date = new Date(today);
          date.setDate(date.getDate() - (29 - i));
          return {
            date: date.toISOString().split('T')[0],
            value: baseData[Math.min(i % baseData.length, baseData.length - 1)].value * (0.7 + Math.random() * 0.6)
          };
        });
      case 'qtd':
        // Last 4 months (4 data points, one per month)
        return Array.from({ length: 4 }, (_, i) => {
          const date = new Date(today);
          date.setMonth(date.getMonth() - (3 - i));
          return {
            date: date.toISOString().split('T')[0],
            value: baseData[Math.min(i % baseData.length, baseData.length - 1)].value * (0.5 + Math.random() * 1.0)
          };
        });
      case 'ytd':
        // Last 12 months (12 data points, one per month)
        return Array.from({ length: 12 }, (_, i) => {
          const date = new Date(today);
          date.setMonth(date.getMonth() - (11 - i));
          return {
            date: date.toISOString().split('T')[0],
            value: baseData[Math.min(i % baseData.length, baseData.length - 1)].value * (0.3 + Math.random() * 1.4)
          };
        });
      case 'custom':
        if (customDateRange.startDate && customDateRange.endDate) {
          const start = new Date(customDateRange.startDate);
          const end = new Date(customDateRange.endDate);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          return Array.from({ length: days }, (_, i) => {
            const date = new Date(start);
            date.setDate(date.getDate() + i);
            return {
              date: date.toISOString().split('T')[0],
              value: baseData[Math.min(i % baseData.length, baseData.length - 1)].value * (0.6 + Math.random() * 0.8)
            };
          });
        }
        return baseData.slice(-7);
      default:
        return baseData.slice(-7);
    }
  };

  const getFilteredData = () => {
    const baseData = { ...pulseData };
    
    // Add dynamic chart data
    const chartData = {
      sales: getChartData('sales', timeRange),
      followers: getChartData('followers', timeRange),
      averageOrderValue: getChartData('averageOrderValue', timeRange)
    };
    
    // Apply time range filter
    switch (timeRange) {
      case '7days':
        return {
          ...baseData,
          chartData,
          pendingOrders: {
            ...baseData.pendingOrders,
            count: Math.floor(baseData.pendingOrders.count * 0.8),
            value: baseData.pendingOrders.value * 0.8
          },
          sales: {
            ...baseData.sales,
            current: baseData.sales.current * 0.8
          },
          followers: {
            ...baseData.followers,
            current: Math.floor(baseData.followers.current * 0.8)
          },
          averageOrderValue: {
            ...baseData.averageOrderValue,
            current: baseData.averageOrderValue.current * 0.8
          },
          orderFunnel: {
            ...baseData.orderFunnel,
            new: Math.floor(baseData.orderFunnel.new * 0.6),
            inProgress: Math.floor(baseData.orderFunnel.inProgress * 0.7),
            ready: Math.floor(baseData.orderFunnel.ready * 0.5),
            completed: Math.floor(baseData.orderFunnel.completed * 0.3)
          }
        };
      case '30days':
        return {
          ...baseData,
          chartData,
          pendingOrders: {
            ...baseData.pendingOrders,
            count: Math.floor(baseData.pendingOrders.count * 1.2),
            value: baseData.pendingOrders.value * 1.2
          },
          sales: {
            ...baseData.sales,
            current: baseData.sales.current * 1.2
          },
          followers: {
            ...baseData.followers,
            current: Math.floor(baseData.followers.current * 1.2)
          },
          averageOrderValue: {
            ...baseData.averageOrderValue,
            current: baseData.averageOrderValue.current * 1.2
          },
          orderFunnel: {
            ...baseData.orderFunnel,
            new: baseData.orderFunnel.new,
            inProgress: baseData.orderFunnel.inProgress,
            ready: baseData.orderFunnel.ready,
            completed: Math.floor(baseData.orderFunnel.completed * 0.9)
          }
        };
      case 'qtd':
        return {
          ...baseData,
          chartData,
          pendingOrders: {
            ...baseData.pendingOrders,
            count: Math.floor(baseData.pendingOrders.count * 1.5),
            value: baseData.pendingOrders.value * 1.5
          },
          sales: {
            ...baseData.sales,
            current: baseData.sales.current * 1.5
          },
          followers: {
            ...baseData.followers,
            current: Math.floor(baseData.followers.current * 1.5)
          },
          averageOrderValue: {
            ...baseData.averageOrderValue,
            current: baseData.averageOrderValue.current * 1.5
          },
          orderFunnel: {
            ...baseData.orderFunnel,
            new: Math.floor(baseData.orderFunnel.new * 1.3),
            inProgress: Math.floor(baseData.orderFunnel.inProgress * 1.2),
            ready: Math.floor(baseData.orderFunnel.ready * 1.1),
            completed: baseData.orderFunnel.completed
          }
        };
      case 'ytd':
        return {
          ...baseData,
          chartData,
          pendingOrders: {
            ...baseData.pendingOrders,
            count: Math.floor(baseData.pendingOrders.count * 2),
            value: baseData.pendingOrders.value * 2
          },
          sales: {
            ...baseData.sales,
            current: baseData.sales.current * 2
          },
          followers: {
            ...baseData.followers,
            current: Math.floor(baseData.followers.current * 2)
          },
          averageOrderValue: {
            ...baseData.averageOrderValue,
            current: baseData.averageOrderValue.current * 2
          },
          orderFunnel: {
            ...baseData.orderFunnel,
            new: Math.floor(baseData.orderFunnel.new * 2.5),
            inProgress: Math.floor(baseData.orderFunnel.inProgress * 2),
            ready: Math.floor(baseData.orderFunnel.ready * 1.8),
            completed: Math.floor(baseData.orderFunnel.completed * 1.5)
          }
        };
      case 'custom': {
        // Calculate days between custom date range
        const startDate = new Date(customDateRange.startDate);
        const endDate = new Date(customDateRange.endDate);
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        // Scale data based on custom range duration
        const scaleFactor = Math.min(daysDiff / 7, 1); // Scale relative to 7 days
        
        return {
          ...baseData,
          chartData,
          pendingOrders: {
            ...baseData.pendingOrders,
            count: Math.floor(baseData.pendingOrders.count * scaleFactor),
            value: baseData.pendingOrders.value * scaleFactor
          },
          sales: {
            ...baseData.sales,
            current: baseData.sales.current * scaleFactor
          },
          followers: {
            ...baseData.followers,
            current: Math.floor(baseData.followers.current * scaleFactor)
          },
          averageOrderValue: {
            ...baseData.averageOrderValue,
            current: baseData.averageOrderValue.current * scaleFactor
          },
          orderFunnel: {
            ...baseData.orderFunnel,
            new: Math.floor(baseData.orderFunnel.new * scaleFactor),
            inProgress: Math.floor(baseData.orderFunnel.inProgress * scaleFactor),
            ready: Math.floor(baseData.orderFunnel.ready * scaleFactor),
            completed: Math.floor(baseData.orderFunnel.completed * scaleFactor)
          }
        };
      }
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

  // Helper functions for AI insights styling
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'warning':
        return <TrendingDown className="h-3 w-3 text-yellow-500" />;
      case 'info':
        return <Brain className="h-3 w-3 text-blue-500" />;
      case 'recommendation':
        return <Brain className="h-3 w-3 text-purple-500" />;
      default:
        return <Brain className="h-3 w-3 text-gray-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'info':
        return 'border-l-blue-500 bg-blue-50';
      case 'recommendation':
        return 'border-l-purple-500 bg-purple-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Orders */}
          <div className="bg-[#F7F2EC] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Pending Orders</h3>
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
              <h3 className="text-lg font-semibold text-gray-900">Sales Windows</h3>
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
            </div>
          </div>
        </div>

        {/* AI Insights - Horizontal Layout */}
        <div className="bg-[#F7F2EC] rounded-lg p-4 shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {pulseInsights.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pulseInsights.map((insight) => (
              <div
                key={insight.id}
                className={`border-l-4 p-3 rounded-r-lg ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getInsightIcon(insight.type)}
                    <h4 className="font-medium text-sm text-gray-900">{insight.title}</h4>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(insight.priority)}`}>
                    {insight.priority}
                  </span>
                </div>
                
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{insight.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-12 bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-blue-600 h-1 rounded-full" 
                        style={{ width: `${insight.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{insight.confidence}%</span>
                  </div>
                  
                  {insight.action && (
                    <span className="text-xs text-gray-600 font-medium">
                      {insight.action}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Snapshots */}
        <div className="bg-[#F7F2EC] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Revenue Pulse</h3>
            <div className="flex flex-wrap bg-white rounded-lg p-1 shadow-sm gap-1">
              {[
                { key: '7days', label: '7 Days' },
                { key: '30days', label: '30 Days' },
                { key: 'qtd', label: 'QTD' },
                { key: 'ytd', label: 'YTD' }
              ].map((range) => (
                <button
                  key={range.key}
                  onClick={() => {
                    setTimeRange(range.key);
                    setShowCustomDateRange(false);
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    timeRange === range.key
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {range.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setTimeRange('custom');
                  setShowCustomDateRange(!showCustomDateRange);
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === 'custom'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Custom Range
              </button>
            </div>
          </div>

          {/* Custom Date Range Input */}
          {showCustomDateRange && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={customDateRange.startDate}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={customDateRange.endDate}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      if (customDateRange.startDate && customDateRange.endDate) {
                        setTimeRange('custom');
                      }
                    }}
                    disabled={!customDateRange.startDate || !customDateRange.endDate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sales Metric */}
            <div 
              className={`bg-white rounded-lg p-6 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                selectedMetric === 'sales' ? 'border-blue-500 bg-blue-50' : 'border-transparent'
              }`}
              onClick={() => setSelectedMetric('sales')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-600">Sales</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      ${filteredData.sales.current.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {getChangeIcon(filteredData.sales.changeType)}
                  <span className={`text-sm font-medium ${getChangeColor(filteredData.sales.changeType)}`}>
                    {filteredData.sales.change}
                  </span>
                </div>
              </div>
              {/* Trend line */}
              <div className="h-8 flex items-end space-x-1">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div
                    key={i}
                    className="flex-1 bg-green-200 rounded-t"
                    style={{ height: `${Math.random() * 60 + 20}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Followers Metric */}
            <div 
              className={`bg-white rounded-lg p-6 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                selectedMetric === 'followers' ? 'border-blue-500 bg-blue-50' : 'border-transparent'
              }`}
              onClick={() => setSelectedMetric('followers')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-600">Followers</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      {filteredData.followers.current.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {getChangeIcon(filteredData.followers.changeType)}
                  <span className={`text-sm font-medium ${getChangeColor(filteredData.followers.changeType)}`}>
                    {filteredData.followers.change}
                  </span>
                </div>
              </div>
              {/* Trend line */}
              <div className="h-8 flex items-end space-x-1">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div
                    key={i}
                    className="flex-1 bg-blue-200 rounded-t"
                    style={{ height: `${Math.random() * 60 + 20}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Average Order Value Metric */}
            <div 
              className={`bg-white rounded-lg p-6 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                selectedMetric === 'averageOrderValue' ? 'border-blue-500 bg-blue-50' : 'border-transparent'
              }`}
              onClick={() => setSelectedMetric('averageOrderValue')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ShoppingCart className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-600">Avg Order Value</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      ${filteredData.averageOrderValue.current.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {getChangeIcon(filteredData.averageOrderValue.changeType)}
                  <span className={`text-sm font-medium ${getChangeColor(filteredData.averageOrderValue.changeType)}`}>
                    {filteredData.averageOrderValue.change}
                  </span>
                </div>
              </div>
              {/* Trend line */}
              <div className="h-8 flex items-end space-x-1">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div
                    key={i}
                    className="flex-1 bg-purple-200 rounded-t"
                    style={{ height: `${Math.random() * 60 + 20}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Line Chart */}
          <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedMetric === 'sales' && 'Sales Performance'}
                {selectedMetric === 'followers' && 'Follower Growth'}
                {selectedMetric === 'averageOrderValue' && 'Average Order Value Trend'}
              </h3>
              <div className="text-sm text-gray-500">
                {timeRange === 'custom' && customDateRange.startDate && customDateRange.endDate
                  ? `${customDateRange.startDate} to ${customDateRange.endDate}`
                  : timeRange === '7days' ? 'Last 7 days' :
                    timeRange === '30days' ? 'Last 4 weeks' :
                    timeRange === 'qtd' ? 'Last 4 months' :
                    timeRange === 'ytd' ? 'Last 12 months' :
                    `Last ${timeRange}`
                }
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData.chartData[selectedMetric]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#666"
                    fontSize={12}
                    tickFormatter={(value) => {
                      if (timeRange === '30days') {
                        // For 30 days, show labels every 3 days to avoid overcrowding
                        const date = new Date(value);
                        const day = date.getDate();
                        return day % 3 === 0 ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
                      }
                      return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={12}
                    tickFormatter={(value) => 
                      selectedMetric === 'sales' ? `$${value.toLocaleString()}` :
                      selectedMetric === 'followers' ? value.toLocaleString() :
                      `$${value.toFixed(2)}`
                    }
                  />
                  <RechartsTooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value) => [
                      selectedMetric === 'sales' ? `$${Number(value).toLocaleString()}` :
                      selectedMetric === 'followers' ? Number(value).toLocaleString() :
                      `$${Number(value).toFixed(2)}`,
                      selectedMetric === 'sales' ? 'Sales' :
                      selectedMetric === 'followers' ? 'Followers' :
                      'AOV'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={selectedMetric === 'sales' ? '#10b981' : selectedMetric === 'followers' ? '#3b82f6' : '#8b5cf6'}
                    strokeWidth={2}
                    dot={{ fill: selectedMetric === 'sales' ? '#10b981' : selectedMetric === 'followers' ? '#3b82f6' : '#8b5cf6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Secondary KPI Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bottom Performers */}
          <div className="bg-[#F7F2EC] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔴 Bottom Performers (Updated!)</h3>
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
                      href={`/product/${product.recipeId}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1"
                    >
                      View Product
                      <ChevronRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-[#F7F2EC] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🟢 Top Performers (Updated!)</h3>
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
                        href={`/product/${product.recipeId}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1"
                      >
                        View Product
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

          {/* Key Performance Metrics */}
          <Link href="/dashboard/vendor/analytics?tab=financial-statements">
            <div className="bg-[#F7F2EC] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer group h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Key Performance</h3>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Order Value</span>
                  <span className="text-lg font-bold text-green-600">${filteredData.keyMetrics.averageOrderValue.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Conversion Rate</span>
                  <span className="text-lg font-bold text-blue-600">{filteredData.keyMetrics.conversionRate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Customer Retention</span>
                  <span className="text-lg font-bold text-purple-600">{filteredData.keyMetrics.customerRetention.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Order Completion</span>
                  <span className="text-lg font-bold text-orange-600">{filteredData.keyMetrics.orderCompletion.toFixed(1)}%</span>
                </div>
              </div>
              
              {/* Key Performance Note */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 italic text-center">
                  Track core business metrics that drive growth and operational efficiency
                </div>
              </div>
            </div>
          </Link>
        </div>

      </div>
    </VendorDashboardLayout>
  );
}