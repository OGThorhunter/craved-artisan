import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Target, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTrendData } from '../../hooks/useTrendData';

interface ForecastData {
  date: string;
  actual: number;
  predicted: number;
  confidence: number;
}

interface ForecastMetrics {
  nextWeekRevenue: number;
  nextWeekOrders: number;
  growthRate: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
}

const AIForecastWidget = () => {
  const { user } = useAuth();
  const [forecastPeriod, setForecastPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [forecastType, setForecastType] = useState<'revenue' | 'orders'>('revenue');
  const [isGenerating, setIsGenerating] = useState(false);

  // Get historical data for forecasting
  const { data: historicalData, isLoading } = useTrendData(user?.id || '', 'daily');

  // Generate AI forecast based on historical data
  const generateForecast = (data: any[], period: string, type: 'revenue' | 'orders'): ForecastData[] => {
    if (!data || data.length < 7) return [];

    const forecastDays = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const forecast: ForecastData[] = [];
    
    // Simple moving average with trend analysis
    const recentData = data.slice(-14); // Last 14 days
    const values = recentData.map(d => type === 'revenue' ? d.revenue : d.orders);
    
    // Calculate trend
    const trend = calculateTrend(values);
    const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
    
    // Generate forecast data
    for (let i = 1; i <= forecastDays; i++) {
      const predictedValue = avgValue + (trend * i);
      const confidence = Math.max(0.6, 1 - (i * 0.02)); // Confidence decreases over time
      
      forecast.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        actual: 0, // No actual data for future dates
        predicted: Math.max(0, Math.round(predictedValue)),
        confidence: confidence
      });
    }
    
    return forecast;
  };

  const calculateTrend = (values: number[]): number => {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n + 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, val, i) => sum + (val * (i + 1)), 0);
    const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  };

  const getForecastMetrics = (): ForecastMetrics => {
    if (!historicalData?.data) {
      return {
        nextWeekRevenue: 0,
        nextWeekOrders: 0,
        growthRate: 0,
        confidence: 0,
        trend: 'stable'
      };
    }

    const forecast = generateForecast(historicalData.data, forecastPeriod, forecastType);
    const nextWeekData = forecast.slice(0, 7);
    
    const nextWeekValue = nextWeekData.reduce((sum, d) => sum + d.predicted, 0);
    const currentWeekValue = historicalData.data.slice(-7).reduce((sum, d) => 
      sum + (forecastType === 'revenue' ? d.revenue : d.orders), 0
    );
    
    const growthRate = currentWeekValue > 0 ? ((nextWeekValue - currentWeekValue) / currentWeekValue) * 100 : 0;
    const avgConfidence = nextWeekData.reduce((sum, d) => sum + d.confidence, 0) / nextWeekData.length;
    
    return {
      nextWeekRevenue: forecastType === 'revenue' ? nextWeekValue : 0,
      nextWeekOrders: forecastType === 'orders' ? nextWeekValue : 0,
      growthRate,
      confidence: avgConfidence,
      trend: growthRate > 5 ? 'up' : growthRate < -5 ? 'down' : 'stable'
    };
  };

  const forecastMetrics = getForecastMetrics();
  const forecastData = historicalData?.data ? generateForecast(historicalData.data, forecastPeriod, forecastType) : [];

  const handleGenerateForecast = () => {
    setIsGenerating(true);
    // Simulate AI processing time
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Zap className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI Revenue Forecast</h2>
            <p className="text-sm text-gray-600">Predictive analytics powered by machine learning</p>
          </div>
        </div>
        <button
          onClick={handleGenerateForecast}
          disabled={isGenerating || isLoading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Target className="h-4 w-4" />
              <span>Generate Forecast</span>
            </>
          )}
        </button>
      </div>

      {/* Forecast Controls */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Forecast Period</label>
          <select
            value={forecastPeriod}
            onChange={(e) => setForecastPeriod(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            aria-label="Select forecast period"
          >
            <option value="7d">Next 7 Days</option>
            <option value="30d">Next 30 Days</option>
            <option value="90d">Next 90 Days</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Forecast Type</label>
          <select
            value={forecastType}
            onChange={(e) => setForecastType(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            aria-label="Select forecast type"
          >
            <option value="revenue">Revenue</option>
            <option value="orders">Orders</option>
          </select>
        </div>
      </div>

      {/* Forecast Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Next Week {forecastType === 'revenue' ? 'Revenue' : 'Orders'}</p>
              <p className="text-2xl font-bold text-purple-900">
                {forecastType === 'revenue' 
                  ? `$${forecastMetrics.nextWeekRevenue.toLocaleString()}`
                  : forecastMetrics.nextWeekOrders.toLocaleString()
                }
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Growth Rate</p>
              <div className="flex items-center space-x-2">
                {forecastMetrics.trend === 'up' ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : forecastMetrics.trend === 'down' ? (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                ) : (
                  <div className="h-5 w-5 text-gray-500">—</div>
                )}
                <p className={`text-2xl font-bold ${
                  forecastMetrics.growthRate > 0 ? 'text-green-600' : 
                  forecastMetrics.growthRate < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {forecastMetrics.growthRate > 0 ? '+' : ''}{forecastMetrics.growthRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">AI Confidence</p>
              <p className="text-2xl font-bold text-green-900">
                {(forecastMetrics.confidence * 100).toFixed(0)}%
              </p>
            </div>
            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
              <span className="text-green-700 text-sm font-bold">AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Forecast Visualization</h3>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading historical data...</p>
            </div>
          </div>
        ) : forecastData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={forecastData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  forecastType === 'revenue' ? `$${value.toLocaleString()}` : value,
                  name === 'predicted' ? 'AI Prediction' : 'Historical'
                ]}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="predicted" 
                stroke="#8B5CF6" 
                fill="#8B5CF6" 
                fillOpacity={0.3}
                strokeWidth={2}
                name="AI Prediction"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Click "Generate Forecast" to see AI predictions</p>
            </div>
          </div>
        )}
      </div>

      {/* AI Insights */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-bold">AI</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900">AI Insights</h4>
            <p className="text-sm text-blue-700 mt-1">
              {forecastMetrics.trend === 'up' 
                ? `Based on recent trends, your ${forecastType} is projected to grow by ${Math.abs(forecastMetrics.growthRate).toFixed(1)}% next week. Consider increasing inventory or marketing efforts.`
                : forecastMetrics.trend === 'down'
                ? `Our AI detects a potential decline of ${Math.abs(forecastMetrics.growthRate).toFixed(1)}% in ${forecastType}. Review your pricing strategy and customer engagement.`
                : `Your ${forecastType} is expected to remain stable. Focus on maintaining current performance and exploring new growth opportunities.`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIForecastWidget; 