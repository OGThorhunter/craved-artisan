import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTrendData, useAnalyticsSummary } from '../../hooks/useTrendData';
import { DollarSign, TrendingUp, Package, Users } from 'lucide-react';

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const vendorId = user?.id || '';

  // Fetch analytics summary
  const { 
    data: summaryData, 
    isLoading: summaryLoading, 
    error: summaryError 
  } = useAnalyticsSummary(vendorId);

  // Fetch daily trends
  const { 
    data: dailyData, 
    isLoading: dailyLoading, 
    error: dailyError 
  } = useTrendData(vendorId, 'daily');

  // Fetch weekly trends
  const { 
    data: weeklyData, 
    isLoading: weeklyLoading, 
    error: weeklyError 
  } = useTrendData(vendorId, 'weekly');

  if (summaryLoading || dailyLoading || weeklyLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-gray-500">Loading analytics dashboard...</div>
        </div>
      </div>
    );
  }

  if (summaryError || dailyError || weeklyError) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">
          <div className="font-medium mb-2">Error loading analytics data</div>
          <div className="text-sm">
            {summaryError?.message || dailyError?.message || weeklyError?.message || 'Unknown error'}
          </div>
        </div>
      </div>
    );
  }

  const summary = summaryData?.data;
  const dailyTrends = dailyData?.data || [];
  const weeklyTrends = weeklyData?.data || [];

  return (
    <div className="p-6 space-y-6">
      {/* Analytics Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${summary.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalOrders.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${summary.avgOrderValue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.thisMonthOrders.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trends */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Trends (Last 30 Days)</h3>
          {dailyTrends.length > 0 ? (
            <div className="space-y-2">
              {dailyTrends.slice(-5).map((trend, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{trend.date}</span>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-600">
                      ${trend.revenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {trend.orders} orders
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">No daily data available</div>
          )}
        </div>

        {/* Weekly Trends */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Trends (Last 12 Weeks)</h3>
          {weeklyTrends.length > 0 ? (
            <div className="space-y-2">
              {weeklyTrends.slice(-5).map((trend, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{trend.date}</span>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-600">
                      ${trend.revenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {trend.orders} orders
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">No weekly data available</div>
          )}
        </div>
      </div>

      {/* Data Source Info */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Analytics Data Source
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Data is fetched using React Query hooks with automatic caching, retry logic, and fallback to mock data when the API is unavailable.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 