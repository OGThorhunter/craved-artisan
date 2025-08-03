import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle,
  DollarSign, ShoppingCart, BarChart3, RefreshCw, Calendar,
  Target, Zap, Info, ArrowUpRight, ArrowDownRight, Minus as MinusIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ForecastData {
  nextMonthRevenue: number;
  nextMonthProfit: number;
  nextMonthOrders: number;
  avgRevenueGrowthRate: number;
  avgProfitGrowthRate: number;
  avgOrderGrowthRate: number;
  confidence: 'high' | 'medium' | 'low';
  trends: {
    revenue: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
    profit: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
    orders: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
  };
  insights: string[];
}

interface AIForecastResponse {
  vendorId: string;
  vendorName: string;
  forecast: ForecastData;
  historicalData: Array<{
    date: string;
    revenue: number;
    profit: number;
    orderCount: number;
    averageOrderValue: number;
  }>;
}

interface AIForecastWidgetProps {
  vendorId: string;
  months?: number;
  className?: string;
}

const AIForecastWidget: React.FC<AIForecastWidgetProps> = ({ 
  vendorId, 
  months = 12, 
  className = '' 
}) => {
  const { user } = useAuth();
  const [forecastData, setForecastData] = useState<AIForecastResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(months);

  const fetchForecast = async (period: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/vendors/${vendorId}/financials/forecast?months=${period}`, {
        withCredentials: true
      });
      setForecastData(response.data);
    } catch (err: any) {
      console.error('Error fetching forecast:', err);
      setError(err.response?.data?.message || 'Failed to load forecast data');
      toast.error('Failed to load AI forecast');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (vendorId) {
      fetchForecast(selectedPeriod);
    }
  }, [vendorId, selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stable':
        return <MinusIcon className="w-4 h-4 text-gray-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-green-600';
      case 'decreasing':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return <CheckCircle className="w-4 h-4" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4" />;
      case 'low':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  if (!user) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <BarChart3 className="w-8 h-8 mx-auto mb-2" />
          <p>Please log in to view AI forecast</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading AI forecast...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="text-center text-red-600">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">Forecast Error</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
          <button
            onClick={() => fetchForecast(selectedPeriod)}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!forecastData) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <BarChart3 className="w-8 h-8 mx-auto mb-2" />
          <p>No forecast data available</p>
        </div>
      </div>
    );
  }

  const { forecast } = forecastData;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Forecast</h3>
              <p className="text-sm text-gray-500">Next month predictions</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Select forecast period"
            >
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
            </select>
            <button
              onClick={() => fetchForecast(selectedPeriod)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh forecast"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Confidence Indicator */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getConfidenceColor(forecast.confidence)}`}>
          {getConfidenceIcon(forecast.confidence)}
          <span>Confidence: {forecast.confidence.charAt(0).toUpperCase() + forecast.confidence.slice(1)}</span>
        </div>
      </div>

      {/* Forecast Metrics */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Revenue Forecast */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Revenue</span>
              </div>
              {getTrendIcon(forecast.trends.revenue)}
            </div>
            <div className="text-2xl font-bold text-green-900 mb-1">
              {formatCurrency(forecast.nextMonthRevenue)}
            </div>
            <div className="flex items-center space-x-1 text-sm">
              {forecast.avgRevenueGrowthRate >= 0 ? (
                <ArrowUpRight className="w-3 h-3 text-green-600" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-red-600" />
              )}
              <span className={forecast.avgRevenueGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatPercentage(forecast.avgRevenueGrowthRate)}
              </span>
              <span className="text-gray-500">avg growth</span>
            </div>
          </div>

          {/* Profit Forecast */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Profit</span>
              </div>
              {getTrendIcon(forecast.trends.profit)}
            </div>
            <div className="text-2xl font-bold text-blue-900 mb-1">
              {formatCurrency(forecast.nextMonthProfit)}
            </div>
            <div className="flex items-center space-x-1 text-sm">
              {forecast.avgProfitGrowthRate >= 0 ? (
                <ArrowUpRight className="w-3 h-3 text-blue-600" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-red-600" />
              )}
              <span className={forecast.avgProfitGrowthRate >= 0 ? 'text-blue-600' : 'text-red-600'}>
                {formatPercentage(forecast.avgProfitGrowthRate)}
              </span>
              <span className="text-gray-500">avg growth</span>
            </div>
          </div>

          {/* Orders Forecast */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-800">Orders</span>
              </div>
              {getTrendIcon(forecast.trends.orders)}
            </div>
            <div className="text-2xl font-bold text-purple-900 mb-1">
              {forecast.nextMonthOrders.toLocaleString()}
            </div>
            <div className="flex items-center space-x-1 text-sm">
              {forecast.avgOrderGrowthRate >= 0 ? (
                <ArrowUpRight className="w-3 h-3 text-purple-600" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-red-600" />
              )}
              <span className={forecast.avgOrderGrowthRate >= 0 ? 'text-purple-600' : 'text-red-600'}>
                {formatPercentage(forecast.avgOrderGrowthRate)}
              </span>
              <span className="text-gray-500">avg growth</span>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        {forecast.insights && forecast.insights.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              <h4 className="font-medium text-gray-900">AI Insights</h4>
            </div>
            <div className="space-y-2">
              {forecast.insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historical Data Summary */}
        {forecastData.historicalData && forecastData.historicalData.length > 0 && (
          <div className="mt-4 text-xs text-gray-500 text-center">
            <Calendar className="w-3 h-3 inline mr-1" />
            Based on {forecastData.historicalData.length} months of historical data
          </div>
        )}
      </div>
    </div>
  );
};

export default AIForecastWidget; 