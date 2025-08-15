'use client';

import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Star, 
  MessageCircle, AlertCircle, CheckCircle, Clock, Calendar, Package,
  Settings, BarChart3, Headphones, Box, Palette, CreditCard,
  Plus, Minus, Eye, Heart, Share2, Download, Upload, Filter,
  Search, Grid, List, ChevronDown, ChevronUp, X, Bell, Zap,
  Award, Target, Gift, Tag, MapPin, Truck, Globe, Camera,
  Video, FileText, PieChart, Activity, ArrowUpRight, ArrowDownRight,
  Sparkles, Brain, Lightbulb, Shield, Users as UsersIcon,
  ShoppingCart, Package as PackageIcon, Calendar as CalendarIcon,
  MessageSquare, Bell as BellIcon, Settings as SettingsIcon,
  BarChart3 as BarChart3Icon, Headphones as HeadphonesIcon,
  Box as BoxIcon, Palette as PaletteIcon, CreditCard as CreditCardIcon,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InspirationalQuote from '@/components/InspirationalQuote';

interface Vendor {
  id: string;
  name: string;
  email: string;
  avatar: string;
  storeName: string;
  verified: boolean;
  joinDate: string;
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageRating: number;
  reviewCount: number;
  subscription: 'free' | 'pro';
}

interface SalesData {
  today: {
    revenue: number;
    orders: number;
    change: number;
  };
  week: {
    revenue: number;
    orders: number;
    change: number;
  };
  month: {
    revenue: number;
    orders: number;
    change: number;
  };
  averageOrderValue: number;
  topProduct: {
    name: string;
    sold: number;
  };
}

interface Order {
  id: string;
  customerName: string;
  customerAvatar: string;
  date: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked-up' | 'delivered' | 'cancelled';
  total: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  pickupDate?: string;
  pickupTime?: string;
  priority: 'low' | 'medium' | 'high';
}

interface AIInsight {
  id: string;
  type: 'suggestion' | 'warning' | 'opportunity';
  title: string;
  description: string;
  action?: string;
  priority: 'low' | 'medium' | 'high';
}

interface Message {
  id: string;
  customerName: string;
  customerAvatar: string;
  subject: string;
  preview: string;
  timestamp: string;
  unread: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface BusinessHealth {
  inventoryAlerts: number;
  fulfillmentQueue: number;
  profitMargin: number;
  pendingPayouts: number;
  churnRisk: number;
  lowStockItems: Array<{
    id: string;
    name: string;
    currentStock: number;
    threshold: number;
  }>;
}

export default function VendorDashboardPage() {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [businessHealth, setBusinessHealth] = useState<BusinessHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'crm' | 'customer-service' | 'inventory' | 'site-management' | 'settings'>('overview');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockVendor: Vendor = {
      id: 'v1',
      name: 'Sarah Johnson',
      email: 'sarah@rosecreekbakery.com',
      avatar: '/images/avatars/sarah.jpg',
      storeName: 'Rose Creek Bakery',
      verified: true,
      joinDate: '2023-03-15',
      totalRevenue: 12450.75,
      totalOrders: 445,
      totalCustomers: 127,
      averageRating: 4.8,
      reviewCount: 89,
      subscription: 'pro'
    };

    const mockSalesData: SalesData = {
      today: {
        revenue: 320.45,
        orders: 8,
        change: 12.5
      },
      week: {
        revenue: 1850.30,
        orders: 55,
        change: 8.4
      },
      month: {
        revenue: 5220.00,
        orders: 156,
        change: 15.2
      },
      averageOrderValue: 28.12,
      topProduct: {
        name: 'Sourdough Loaf',
        sold: 14
      }
    };

    const mockOrders: Order[] = [
      {
        id: 'o1',
        customerName: 'Emma Wilson',
        customerAvatar: '/images/avatars/emma.jpg',
        date: '2024-02-10',
        status: 'ready',
        total: 32.50,
        items: [
          { id: 'i1', name: 'Sourdough Bread', quantity: 2, price: 9.00 },
          { id: 'i2', name: 'Artisan Baguette', quantity: 1, price: 7.50 }
        ],
        pickupDate: '2024-02-12',
        pickupTime: '14:00-16:00',
        priority: 'high'
      },
      {
        id: 'o2',
        customerName: 'Michael Chen',
        customerAvatar: '/images/avatars/michael.jpg',
        date: '2024-02-10',
        status: 'preparing',
        total: 18.75,
        items: [
          { id: 'i3', name: 'Croissant', quantity: 3, price: 3.50 },
          { id: 'i4', name: 'Danish Pastry', quantity: 2, price: 4.00 }
        ],
        pickupDate: '2024-02-11',
        pickupTime: '10:00-12:00',
        priority: 'medium'
      }
    ];

    const mockAIInsights: AIInsight[] = [
      {
        id: 'ai1',
        type: 'suggestion',
        title: 'Bundle Opportunity',
        description: 'Customers who bought Sourdough Bread are also buying Artisan Butter — consider bundling',
        action: 'Create Bundle',
        priority: 'medium'
      },
      {
        id: 'ai2',
        type: 'warning',
        title: 'Order Volume Alert',
        description: 'Order volume down 25% this week — try a flash promo?',
        action: 'Create Promotion',
        priority: 'high'
      },
      {
        id: 'ai3',
        type: 'opportunity',
        title: 'Cart Recovery',
        description: '3 shoppers left items in cart — send recovery email?',
        action: 'Send Recovery Email',
        priority: 'medium'
      }
    ];

    const mockMessages: Message[] = [
      {
        id: 'm1',
        customerName: 'Emma Wilson',
        customerAvatar: '/images/avatars/emma.jpg',
        subject: 'Order #o1 Ready for Pickup',
        preview: 'Your order is ready for pickup at our location...',
        timestamp: '2024-02-10T14:30:00Z',
        unread: true,
        priority: 'high'
      },
      {
        id: 'm2',
        customerName: 'Michael Chen',
        customerAvatar: '/images/avatars/michael.jpg',
        subject: 'Allergy Question',
        preview: 'I have a nut allergy and wanted to ask about...',
        timestamp: '2024-02-10T12:15:00Z',
        unread: false,
        priority: 'medium'
      }
    ];

    const mockBusinessHealth: BusinessHealth = {
      inventoryAlerts: 2,
      fulfillmentQueue: 5,
      profitMargin: 32,
      pendingPayouts: 1100,
      churnRisk: 12,
      lowStockItems: [
        { id: 'i1', name: 'Organic Flour', currentStock: 5, threshold: 10 },
        { id: 'i2', name: 'Butter', currentStock: 3, threshold: 8 }
      ]
    };

    setVendor(mockVendor);
    setSalesData(mockSalesData);
    setOrders(mockOrders);
    setAiInsights(mockAIInsights);
    setMessages(mockMessages);
    setBusinessHealth(mockBusinessHealth);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'preparing': return 'text-orange-600 bg-orange-100';
      case 'ready': return 'text-green-600 bg-green-100';
      case 'picked-up': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'suggestion': return <Lightbulb className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'opportunity': return <Target className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!vendor || !salesData || !businessHealth) return <div>Vendor not found.</div>;

  const currentSalesData = salesData[timeRange];

  return (
    <div className="bg-white">
      {/* Secondary Navigation Tabs */}
      <div className="bg-blue-500 border-b border-blue-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'analytics', label: 'Analytics', icon: BarChart3Icon },
              { id: 'crm', label: 'CRM', icon: UsersIcon },
              { id: 'customer-service', label: 'Customer Service', icon: HeadphonesIcon },
              { id: 'inventory', label: 'Inventory', icon: BoxIcon },
              { id: 'site-management', label: 'Site Management', icon: PaletteIcon },
              { id: 'settings', label: 'Settings', icon: SettingsIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'analytics') {
                      window.location.href = '/dashboard/vendor/analytics';
                    } else {
                      setActiveTab(tab.id as any);
                    }
                  }}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-white text-white'
                      : 'text-blue-100 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Hero Banner */}
              <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-100 shadow-sm">
                                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2 text-gray-900">Dashboard Overview</h2>
                      <p className="text-gray-600">Track your business performance and stay ahead</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">{vendor.averageRating}</div>
                        <div className="text-sm text-gray-600">Average Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">{vendor.reviewCount}</div>
                        <div className="text-sm text-gray-600">Reviews</div>
                      </div>
                    </div>
                  </div>
              </div>

              {/* Inspirational Quote */}
              <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
                <InspirationalQuote />
              </div>

              {/* Today's Performance Tiles */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      currentSalesData.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {currentSalesData.change >= 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {Math.abs(currentSalesData.change)}%
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${currentSalesData.revenue.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}'s Revenue
                  </div>
                </div>

                <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ShoppingBag className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      currentSalesData.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {currentSalesData.change >= 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {Math.abs(currentSalesData.change)}%
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {currentSalesData.orders}
                  </div>
                  <div className="text-sm text-gray-600">
                    Orders {timeRange === 'today' ? 'Today' : `This ${timeRange}`}
                  </div>
                </div>

                <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <CreditCard className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${salesData.averageOrderValue.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Average Order Value
                  </div>
                </div>

                <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Package className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {salesData.topProduct.sold}
                  </div>
                  <div className="text-sm text-gray-600">
                    {salesData.topProduct.name} sold
                  </div>
                </div>
              </div>

              {/* Time Range Toggle */}
              <div className="flex justify-center">
                <div className="bg-[#F7F2EC] rounded-lg p-1 border border-gray-200 shadow-sm">
                  {(['today', 'week', 'month'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        timeRange === range
                          ? 'bg-brand-green text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Business Health Snapshot */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Business Health</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Inventory Alerts</span>
                      <span className="font-semibold text-red-600">{businessHealth.inventoryAlerts} items</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Fulfillment Queue</span>
                      <span className="font-semibold text-orange-600">{businessHealth.fulfillmentQueue} orders</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Profit Margin</span>
                      <span className="font-semibold text-green-600">{businessHealth.profitMargin}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pending Payouts</span>
                      <span className="font-semibold text-blue-600">${businessHealth.pendingPayouts}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Churn Risk</span>
                      <span className="font-semibold text-red-600">{businessHealth.churnRisk} customers</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">AI Insights</h3>
                  <div className="space-y-3">
                    {aiInsights.map((insight) => (
                      <div key={insight.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`p-1 rounded ${
                          insight.type === 'suggestion' ? 'bg-blue-100 text-blue-600' :
                          insight.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {getInsightIcon(insight.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{insight.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                          {insight.action && (
                            <button className="text-xs text-brand-green hover:text-brand-green/80 mt-2">
                              {insight.action} →
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { icon: Plus, label: 'Add Product', color: 'bg-green-100 text-green-600' },
                    { icon: Gift, label: 'Create Discount', color: 'bg-purple-100 text-purple-600' },
                    { icon: MessageSquare, label: 'Send Email', color: 'bg-blue-100 text-blue-600' },
                    { icon: CreditCard, label: 'View Payouts', color: 'bg-orange-100 text-orange-600' },
                    { icon: Download, label: 'Export Report', color: 'bg-gray-100 text-gray-600' }
                  ].map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={index}
                        className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        <div className={`p-2 rounded-lg ${action.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-center">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recent Orders & Messages */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Recent Orders</h3>
                    <Link href="/dashboard/vendor/orders" className="text-brand-green hover:text-brand-green/80 text-sm">
                      View all →
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white shadow-sm">
                        <div className="flex items-center gap-3">
                          <img src={order.customerAvatar} alt={order.customerName} className="w-10 h-10 rounded-full" />
                          <div>
                            <h4 className="font-medium text-sm">{order.customerName}</h4>
                            <p className="text-xs text-gray-600">${order.total} • {order.items.length} items</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                            {order.status.replace('-', ' ')}
                          </span>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ml-1 ${getPriorityColor(order.priority)}`}>
                            {order.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Messages</h3>
                    <Link href="/dashboard/vendor/messages" className="text-brand-green hover:text-brand-green/80 text-sm">
                      View all →
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {messages.slice(0, 3).map((message) => (
                      <div key={message.id} className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-white shadow-sm ${
                        message.unread ? 'bg-blue-50' : ''
                      }`}>
                        <img src={message.customerAvatar} alt={message.customerName} className="w-10 h-10 rounded-full" />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{message.customerName}</h4>
                          <p className="text-xs text-gray-600">{message.subject}</p>
                          <p className="text-xs text-gray-500">{message.preview}</p>
                        </div>
                        {message.unread && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Leaderboard */}
              <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Achievements & Milestones</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
                    <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-yellow-800">Top 10</div>
                    <div className="text-sm text-yellow-700">Vendors in your category</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-green-800">Best Day</div>
                    <div className="text-sm text-green-700">May 12 — let's beat it!</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-purple-800">500+</div>
                    <div className="text-sm text-purple-700">Customers served!</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Placeholder for other tabs */}
          {activeTab !== 'overview' && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <div className="text-4xl font-bold text-gray-300 mb-4">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
              </div>
              <p className="text-gray-500">This module is coming soon...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 
