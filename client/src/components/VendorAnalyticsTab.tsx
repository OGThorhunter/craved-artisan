import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { 
  RefreshCw, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Download, 
  FileText,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { VendorFinancialDashboard } from './VendorFinancialDashboard';
import { FinancialHealthIndicator } from './FinancialHealthIndicator';
import LoadingSpinner from './LoadingSpinner';

interface VendorAnalyticsTabProps {
  vendorId: string;
  className?: string;
}

export const VendorAnalyticsTab: React.FC<VendorAnalyticsTabProps> = ({ 
  vendorId, 
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'trends' | 'insights'>('overview');
  const [selectedRange, setSelectedRange] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const queryClient = useQueryClient();

  // Fetch vendor analytics data
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['vendor-analytics', vendorId, selectedRange],
    queryFn: async () => {
      const response = await axios.get(`/api/vendors/${vendorId}/financials/test?range=${selectedRange}`, {
        withCredentials: true
      });
      return response.data;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleRangeChange = (range: 'monthly' | 'quarterly' | 'yearly') => {
    setSelectedRange(range);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['vendor-analytics', vendorId] });
    toast.success('Analytics data refreshed!');
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="text-red-800">
          <h3 className="text-lg font-semibold mb-2">Error Loading Analytics</h3>
          <p>Failed to load analytics data. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return null;
  }

  const latestSnapshot = analyticsData.snapshots[0];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {analyticsData.vendor.storeName} - Analytics Dashboard
            </h2>
            <p className="text-gray-600 mt-1">
              Comprehensive financial analysis and insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <label htmlFor="analytics-range-select" className="sr-only">Select time range</label>
              <select
                id="analytics-range-select"
                value={selectedRange}
                onChange={(e) => handleRangeChange(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Select time range"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'financials', label: 'Financials', icon: DollarSign },
              { id: 'trends', label: 'Trends', icon: TrendingUp },
              { id: 'insights', label: 'Insights', icon: BarChart3 }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Financial Health Indicator */}
              <FinancialHealthIndicator 
                metrics={{
                  netProfit: analyticsData.summary.totalProfit,
                  totalRevenue: analyticsData.summary.totalRevenue,
                  cogs: latestSnapshot?.cogs || 0,
                  cashIn: latestSnapshot?.cashIn || 0,
                  cashOut: latestSnapshot?.cashOut || 0,
                  assets: latestSnapshot?.assets || 0,
                  liabilities: latestSnapshot?.liabilities || 0,
                }}
              />

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Revenue</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    ${analyticsData.summary.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Profit</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    ${analyticsData.summary.totalProfit.toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Margin</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900 mt-1">
                    {analyticsData.summary.avgProfitMargin.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">Net Worth</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-900 mt-1">
                    ${analyticsData.summary.currentNetWorth.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financials' && (
            <VendorFinancialDashboard vendorId={vendorId} />
          )}

          {activeTab === 'trends' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Trend Analysis</h3>
                <p className="text-blue-800">
                  Trend analysis features will be implemented here, showing historical performance patterns,
                  growth rates, and predictive analytics based on historical data.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-4">AI-Powered Insights</h3>
                <p className="text-purple-800">
                  AI-powered insights and recommendations will be displayed here, including:
                  cost optimization suggestions, revenue growth opportunities, and risk assessments.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 