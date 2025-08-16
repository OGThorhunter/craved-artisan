import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';

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

        // Use test endpoint for now
        const response = await axios.get(`/api/vendors/${user?.id}/delivery-metrics/test`);
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
        <div className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading delivery analytics...</p>
          </div>
        </div>
      </VendorDashboardLayout>
    );
  }

  if (error) {
    return (
      <VendorDashboardLayout>
        <div className="p-6">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 responsive-button bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </VendorDashboardLayout>
    );
  }

  if (!metrics) {
    return (
      <VendorDashboardLayout>
        <div className="p-6">
          <div className="text-center">
            <p className="text-gray-600">No delivery data available</p>
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
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="responsive-heading text-gray-900">Delivery Analytics</h1>
          <p className="mt-2 text-gray-600">
            Track your delivery performance across different ZIP codes and time periods
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">ðŸ“¦</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="responsive-text font-medium text-gray-500">Total Orders</p>
                <p className="responsive-heading text-gray-900">{metrics.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">âœ…</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="responsive-text font-medium text-gray-500">Delivered</p>
                <p className="responsive-heading text-gray-900">{metrics.totalDelivered}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-semibold">â°</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="responsive-text font-medium text-gray-500">On-Time Rate</p>
                <p className="responsive-heading text-gray-900">{(metrics.onTimeRate * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">ðŸ•’</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="responsive-text font-medium text-gray-500">Avg Delivery Time</p>
                <p className="responsive-heading text-gray-900">{metrics.avgTimeToDeliver}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* On-Time vs Delayed Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* ZIP Code Performance Bar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
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

        {/* ZIP Code Details Table */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">ZIP Code Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="responsive-button text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ZIP Code
                  </th>
                  <th className="responsive-button text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    On-Time Deliveries
                  </th>
                  <th className="responsive-button text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delayed Deliveries
                  </th>
                  <th className="responsive-button text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Orders
                  </th>
                  <th className="responsive-button text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metrics.zipStats.map((stat) => {
                  const total = stat.delivered + stat.delayed;
                  const successRate = total > 0 ? (stat.delivered / total * 100).toFixed(1) : '0.0';
                  
                  return (
                    <tr key={stat.zip}>
                      <td className="px-6 py-4 whitespace-nowrap responsive-text font-medium text-gray-900">
                        {stat.zip}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {stat.delivered}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {stat.delayed}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          parseFloat(successRate) >= 80 
                            ? 'bg-green-100 text-green-800' 
                            : parseFloat(successRate) >= 60 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {successRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </VendorDashboardLayout>
  );
};

export default VendorAnalyticsPage; 
