import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Package,
  Users,
  Star,
  Lightbulb,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAnalyticsSummary } from '../../hooks/useTrendData';

interface PerformanceMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
}

interface AIInsight {
  type: 'positive' | 'warning' | 'opportunity' | 'alert';
  title: string;
  description: string;
  action?: string;
  icon: React.ReactNode;
}

const AISummaryBuilder = () => {
  const { user } = useAuth();
  const { data: summaryData, isLoading } = useAnalyticsSummary(user?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);

  // Generate performance metrics
  const generateMetrics = (): PerformanceMetric[] => {
    if (!summaryData?.data) return [];

    const data = summaryData.data;
    const thisMonthRevenue = data.thisMonthRevenue;
    const thisMonthOrders = data.thisMonthOrders;
    const avgOrderValue = data.avgOrderValue;
    const totalRevenue = data.totalRevenue;

    // Calculate month-over-month growth (simplified)
    const revenueGrowth = thisMonthRevenue > 0 ? 15.2 : 0; // Mock growth rate
    const ordersGrowth = thisMonthOrders > 0 ? 8.7 : 0;
    const avgOrderGrowth = avgOrderValue > 0 ? 3.1 : 0;

    return [
      {
        label: 'This Month Revenue',
        value: thisMonthRevenue,
        change: revenueGrowth,
        trend: revenueGrowth > 0 ? 'up' : revenueGrowth < 0 ? 'down' : 'stable',
        status: revenueGrowth > 10 ? 'excellent' : revenueGrowth > 0 ? 'good' : revenueGrowth > -10 ? 'warning' : 'critical',
        icon: <DollarSign className="h-5 w-5" />
      },
      {
        label: 'This Month Orders',
        value: thisMonthOrders,
        change: ordersGrowth,
        trend: ordersGrowth > 0 ? 'up' : ordersGrowth < 0 ? 'down' : 'stable',
        status: ordersGrowth > 15 ? 'excellent' : ordersGrowth > 0 ? 'good' : ordersGrowth > -15 ? 'warning' : 'critical',
        icon: <Package className="h-5 w-5" />
      },
      {
        label: 'Average Order Value',
        value: avgOrderValue,
        change: avgOrderGrowth,
        trend: avgOrderGrowth > 0 ? 'up' : avgOrderGrowth < 0 ? 'down' : 'stable',
        status: avgOrderGrowth > 5 ? 'excellent' : avgOrderGrowth > 0 ? 'good' : avgOrderGrowth > -5 ? 'warning' : 'critical',
        icon: <Target className="h-5 w-5" />
      },
      {
        label: 'Customer Satisfaction',
        value: 4.8, // Mock rating
        change: 0.2,
        trend: 'up',
        status: 'excellent',
        icon: <Star className="h-5 w-5" />
      }
    ];
  };

  // Generate AI insights
  const generateInsights = (metrics: PerformanceMetric[]): AIInsight[] => {
    const insights: AIInsight[] = [];

    // Revenue insights
    const revenueMetric = metrics.find(m => m.label.includes('Revenue'));
    if (revenueMetric) {
      if (revenueMetric.trend === 'up' && revenueMetric.change > 10) {
        insights.push({
          type: 'positive',
          title: 'Strong Revenue Growth',
          description: `Your revenue is up ${revenueMetric.change.toFixed(1)}% this month. This is above industry average and indicates strong market demand.`,
          action: 'Consider expanding your product line or increasing marketing spend.',
          icon: <TrendingUp className="h-4 w-4" />
        });
      } else if (revenueMetric.trend === 'down') {
        insights.push({
          type: 'warning',
          title: 'Revenue Decline Detected',
          description: `Revenue has decreased by ${Math.abs(revenueMetric.change).toFixed(1)}% this month. This may indicate pricing or demand issues.`,
          action: 'Review pricing strategy and customer feedback.',
          icon: <AlertTriangle className="h-4 w-4" />
        });
      }
    }

    // Order insights
    const orderMetric = metrics.find(m => m.label.includes('Orders'));
    if (orderMetric && orderMetric.value < 50) {
      insights.push({
        type: 'opportunity',
        title: 'Order Volume Opportunity',
        description: 'Your order volume is below optimal levels. Consider implementing customer retention strategies.',
        action: 'Launch a customer loyalty program or promotional campaign.',
        icon: <Users className="h-4 w-4" />
      });
    }

    // AOV insights
    const aovMetric = metrics.find(m => m.label.includes('Average Order'));
    if (aovMetric && aovMetric.value < 50) {
      insights.push({
        type: 'opportunity',
        title: 'Increase Average Order Value',
        description: 'Your average order value is below target. Upselling opportunities may be missed.',
        action: 'Implement product recommendations and bundle offers.',
        icon: <Target className="h-4 w-4" />
      });
    }

    // General performance insights
    if (metrics.every(m => m.trend === 'up')) {
      insights.push({
        type: 'positive',
        title: 'All Metrics Trending Up',
        description: 'Excellent! All your key performance indicators are showing positive growth.',
        action: 'Maintain current strategies and consider scaling successful initiatives.',
        icon: <CheckCircle className="h-4 w-4" />
      });
    }

    return insights.slice(0, 4); // Limit to 4 insights
  };

  const metrics = generateMetrics();
  const currentInsights = insights.length > 0 ? insights : generateInsights(metrics);

  const handleGenerateSummary = () => {
    setIsGenerating(true);
    // Simulate AI processing
    setTimeout(() => {
      setInsights(generateInsights(metrics));
      setIsGenerating(false);
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-700 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'opportunity': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'alert': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
            <div className="bg-[#F7F2EC] rounded-xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">This Month's Performance</h2>
            <p className="text-sm text-gray-600">AI-powered insights at a glance</p>
          </div>
        </div>
        <button
          onClick={handleGenerateSummary}
          disabled={isGenerating || isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Lightbulb className="h-4 w-4" />
              <span>Generate Insights</span>
            </>
          )}
        </button>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))
        ) : (
          metrics.map((metric, index) => (
            <div
              key={index}
              className={`rounded-lg p-4 border ${getStatusColor(metric.status)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {metric.icon}
                  <span className="text-sm font-medium">{metric.label}</span>
                </div>
                {metric.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : metric.trend === 'down' ? (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                ) : (
                  <div className="h-4 w-4 text-gray-400">—</div>
                )}
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold">
                  {metric.label.includes('Revenue') || metric.label.includes('Value')
                    ? `$${metric.value.toLocaleString()}`
                    : metric.label.includes('Satisfaction')
                    ? metric.value.toFixed(1)
                    : metric.value.toLocaleString()
                  }
                </span>
                <span className={`text-sm font-medium ${
                  metric.change > 0 ? 'text-green-600' : 
                  metric.change < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Insights */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-xs font-bold">AI</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">AI Insights & Recommendations</h3>
        </div>

        {currentInsights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentInsights.map((insight, index) => (
              <div
                key={index}
                className={`rounded-lg p-4 border ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {insight.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold mb-1">{insight.title}</h4>
                    <p className="text-sm mb-2">{insight.description}</p>
                    {insight.action && (
                      <div className="text-xs font-medium opacity-75">
                        💡 {insight.action}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Lightbulb className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Click "Generate Insights" to get AI-powered recommendations</p>
          </div>
        )}
      </div>

              {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors">
              Export Report
            </button>
            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors">
              Schedule Review
            </button>
            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors">
              Set Alerts
            </button>
            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors">
              Share Dashboard
            </button>
          </div>
        </div>
        
        {/* AI Disclaimer */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-medium">AI Tool Disclaimer</p>
              <p className="mt-1">AI tools can sometimes be unpredictable and may not always do exactly what you tell them to do. While we strive for accuracy, please review all AI-generated insights and recommendations before making business decisions.</p>
            </div>
          </div>
        </div>
    </div>
  );
};

export default AISummaryBuilder; 