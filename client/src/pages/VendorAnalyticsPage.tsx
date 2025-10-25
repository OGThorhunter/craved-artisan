import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import MotivationalQuote from '@/components/dashboard/MotivationalQuote';
import { getQuoteByCategory } from '@/data/motivationalQuotes';

interface DeliveryMetrics {
  zipStats: Array<{
    zip: string;
    delivered: number;
    delayed: number;
  }>;
  onTimeRate: number;
  avgTimeToDeliver: string;
  totalOrders: number;
  totalDelivered: number;
  onTimeDeliveries: number;
  delayedDeliveries: number;
}

const VendorAnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DeliveryMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeliveryMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`/api/vendors/${user?.vendorProfileId || user?.id}/delivery-metrics`, {
          withCredentials: true
        });
        setMetrics(response.data);
      } catch (err) {
        console.error('Error fetching delivery metrics:', err);
        setError('Failed to load delivery analytics');
        toast.error('Failed to load delivery analytics');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchDeliveryMetrics();
    }
  }, [user?.id]);

  if (loading) {
    return (
      <VendorDashboardLayout>
        <div className="py-8 bg-white min-h-screen">
          <div className="container-responsive">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading delivery analytics...</p>
            </div>
          </div>
        </div>
      </VendorDashboardLayout>
    );
  }

  if (error) {
    return (
      <VendorDashboardLayout>
        <div className="py-8 bg-white min-h-screen">
          <div className="container-responsive">
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </VendorDashboardLayout>
    );
  }

  if (!metrics) {
    return (
      <VendorDashboardLayout>
        <div className="py-8 bg-white min-h-screen">
          <div className="container-responsive">
            <div className="text-center">
              <p className="text-gray-600">No delivery data available</p>
            </div>
          </div>
        </div>
      </VendorDashboardLayout>
    );
  }

  // Prepare data for pie chart
  const pieData = [
    { name: 'On-Time', value: metrics.onTimeDeliveries, color: '#10B981' },
    { name: 'Delayed', value: metrics.delayedDeliveries, color: '#EF4444' }
  ];

  // Prepare data for bar chart
  const barData = metrics.zipStats.map(stat => ({
    zip: stat.zip,
    'On-Time': stat.delivered,
    'Delayed': stat.delayed,
    total: stat.delivered + stat.delayed
  }));

  return (
    <VendorDashboardLayout>
      <div className="py-8 bg-white min-h-screen">
        <div className="container-responsive">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
                <p className="text-sm text-gray-600">Currently viewing: <span className="text-green-600 font-medium">Insights</span></p>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                Insights
              </button>
            </div>
          </div>

          {/* Motivational Quote */}
          <MotivationalQuote
            quote={getQuoteByCategory('motivation').quote}
            author={getQuoteByCategory('motivation').author}
            icon={getQuoteByCategory('motivation').icon}
            variant={getQuoteByCategory('motivation').variant}
          />

          {/* Main Content Area */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Delivery Analytics</h2>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">📊</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.totalOrders}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold">✅</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Delivered</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.totalDelivered}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-yellow-600 font-semibold">⏰</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">On-Time Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{(metrics.onTimeRate * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-semibold">🚚</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Avg Delivery Time</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.avgTimeToDeliver}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pie Chart */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : '0'}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by ZIP Code</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="zip" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="On-Time" fill="#10B981" />
                    <Bar dataKey="Delayed" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Financial Data Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-yellow-800">Financial Data Disclaimer</p>
              <p className="text-sm text-yellow-700">
                All financial data displayed is for informational purposes only. Users are responsible for verifying the accuracy and security of their financial information. This dashboard does not constitute financial advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </VendorDashboardLayout>
  );
};

export default VendorAnalyticsPage;