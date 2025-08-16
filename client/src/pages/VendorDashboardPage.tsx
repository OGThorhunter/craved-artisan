import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InspirationalQuote from '@/components/InspirationalQuote';
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Package, 
  Bell, 
  MessageSquare, 
  Settings, 
  BarChart3, 
  Users, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  Star,
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

// Mock data for dashboard
const recentOrders = [
  { id: 1, customer: 'Emma Wilson', product: 'Handmade Soap Set', amount: 45.99, status: 'Delivered', date: '2 hours ago' },
  { id: 2, customer: 'Michael Brown', product: 'Artisan Bread', amount: 28.50, status: 'In Transit', date: '4 hours ago' },
  { id: 3, customer: 'Lisa Davis', product: 'Organic Honey', amount: 32.00, status: 'Processing', date: '6 hours ago' },
  { id: 4, customer: 'John Smith', product: 'Handcrafted Mug', amount: 18.75, status: 'Delivered', date: '1 day ago' }
];

const recentMessages = [
  { id: 1, customer: 'Emma Wilson', message: 'When will my order arrive?', unread: true, time: '5 min ago' },
  { id: 2, customer: 'Michael Brown', message: 'Thank you for the quick delivery!', unread: false, time: '1 hour ago' },
  { id: 3, customer: 'Lisa Davis', message: 'Do you have more of the lavender soap?', unread: true, time: '2 hours ago' }
];

const achievements = [
  { id: 1, title: 'First Sale', description: 'Completed your first order', icon: '🎉', achieved: true },
  { id: 2, title: '50 Orders', description: 'Reached 50 total orders', icon: '📦', achieved: true },
  { id: 3, title: '5-Star Rating', description: 'Maintained 4.5+ rating for 30 days', icon: '⭐', achieved: false },
  { id: 4, title: '100 Customers', description: 'Served 100 unique customers', icon: '👥', achieved: false }
];

const VendorDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('daily');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'crm', label: 'CRM', icon: Users },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'financials', label: 'Financials', icon: DollarSign },
    { id: 'messaging', label: 'Messaging', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const performanceMetrics = [
    {
      title: 'Total Revenue',
      value: `$${vendor.totalRevenue.toLocaleString()}`,
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Total Orders',
      value: vendor.totalOrders.toLocaleString(),
      change: '+8.2%',
      changeType: 'positive',
      icon: ShoppingCart,
      color: 'text-blue-600'
    },
    {
      title: 'Average Order Value',
      value: `$${(vendor.totalRevenue / vendor.totalOrders).toFixed(2)}`,
      change: '+3.1%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      title: 'Top Product',
      value: 'Handmade Soap',
      change: '24 sold',
      changeType: 'neutral',
      icon: Package,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Secondary Navigation Tabs */}
      <div className="bg-blue-50 border-b border-green-700 shadow-sm sticky top-14 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'analytics') {
                      window.location.href = '/dashboard/vendor/analytics';
                    } else if (tab.id === 'products') {
                      window.location.href = '/dashboard/vendor/products';
                    } else if (tab.id === 'orders') {
                      window.location.href = '/dashboard/orders';
                    } else if (tab.id === 'inventory') {
                      window.location.href = '/dashboard/vendor/inventory';
                    } else if (tab.id === 'crm') {
                      window.location.href = '/dashboard/vendor/crm';
                    } else if (tab.id === 'settings') {
                      window.location.href = '/dashboard/vendor/site-settings';
                    } else {
                      setActiveTab(tab.id as any);
                    }
                  }}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-[#F7F2EC] text-green-700 border-b-2 border-green-700'
                      : 'text-gray-600 hover:text-gray-900'
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
      <div className="max-w-7xl mx-auto px-4 py-8 mt-12">
        {/* Hero Banner */}
        <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-100 shadow-sm mb-6">
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
                <div className="text-3xl font-bold text-gray-900">{vendor.totalProducts}</div>
                <div className="text-sm text-gray-600">Active Products</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{vendor.totalCustomers}</div>
                <div className="text-sm text-gray-600">Total Customers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Inspirational Quote */}
        <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
          <InspirationalQuote />
        </div>

        {/* Performance Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {performanceMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {metric.changeType === 'positive' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : metric.changeType === 'negative' ? (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      ) : null}
                      <span className={`text-sm font-medium ${
                        metric.changeType === 'positive' ? 'text-green-600' : 
                        metric.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg bg-white shadow-sm`}>
                    <Icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Time Range Toggle */}
        <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
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
        </div>

        {/* Business Health & AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Business Health */}
          <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Inventory Status</p>
                    <p className="text-sm text-gray-600">All products in stock</p>
                  </div>
                </div>
                <span className="text-sm text-green-600 font-medium">Good</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Customer Satisfaction</p>
                    <p className="text-sm text-gray-600">4.8/5 average rating</p>
                  </div>
                </div>
                <span className="text-sm text-yellow-600 font-medium">Excellent</span>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
            <div className="space-y-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Revenue Opportunity</p>
                    <p className="text-sm text-gray-600">Consider increasing prices by 5-10% on your top-selling products</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Inventory Alert</p>
                    <p className="text-sm text-gray-600">Restock "Handmade Soap" - only 3 units remaining</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Quick Actions */}
          <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm">
                <Package className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">Add Product</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm">
                <BarChart3 className="w-6 h-6 text-green-600" />
                <span className="text-sm font-medium text-gray-900">View Analytics</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm">
                <MessageSquare className="w-6 h-6 text-purple-600" />
                <span className="text-sm font-medium text-gray-900">Messages</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm">
                <Settings className="w-6 h-6 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Settings</span>
              </button>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white shadow-sm">
                  <div>
                    <p className="font-medium text-gray-900">{order.customer}</p>
                    <p className="text-sm text-gray-600">{order.product}</p>
                    <p className="text-xs text-gray-500">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${order.amount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Messages & Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Messages */}
          <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Messages</h3>
            <div className="space-y-3">
              {recentMessages.map((message) => (
                <div key={message.id} className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-white shadow-sm ${
                  message.unread ? 'bg-blue-50' : ''
                }`}>
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {message.customer.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{message.customer}</p>
                    <p className="text-sm text-gray-600">{message.message}</p>
                    <p className="text-xs text-gray-500">{message.time}</p>
                  </div>
                  {message.unread && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Achievements & Milestones */}
          <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements & Milestones</h3>
            <div className="grid grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className={`p-4 rounded-lg border ${
                  achievement.achieved 
                    ? 'bg-white border-green-200 shadow-sm' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="text-2xl mb-2">{achievement.icon}</div>
                  <h4 className="font-medium text-gray-900 text-sm">{achievement.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                  {achievement.achieved && (
                    <div className="flex items-center gap-1 mt-2">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">Achieved</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboardPage; 
