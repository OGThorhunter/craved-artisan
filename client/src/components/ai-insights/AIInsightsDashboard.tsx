import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  DollarSign,
  Target,
  Zap,
  BarChart3,
  Calendar,
  Package,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Info,
  Lightbulb,
  ArrowRight,
  Filter,
  Search,
  Download,
  Settings,
  Bell,
  Star,
  Activity,
  PieChart,
  LineChart,
} from 'lucide-react';

interface SeasonalAlert {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  confidence: number;
  recommendedAction: string;
  timeframe: string;
  createdAt: string;
}

interface StockPrediction {
  id: string;
  itemId: string;
  itemName: string;
  currentStock: number;
  predictedDepletionDate: string;
  confidence: number;
  factors: string[];
  recommendedOrderQuantity: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  createdAt: string;
}

interface MarketTrend {
  id: string;
  category: string;
  trend: string;
  impact: 'positive' | 'negative' | 'neutral';
  timeframe: string;
  confidence: number;
  recommendation: string;
  createdAt: string;
}

interface CostOptimization {
  id: string;
  type: string;
  itemId: string;
  itemName: string;
  currentCost: number;
  bulkCost?: number;
  alternativeCost?: number;
  savings: number;
  minOrderQuantity?: number;
  paybackPeriod?: string;
  confidence: number;
  createdAt: string;
}

interface AIInsights {
  insights: {
    seasonalAlerts: SeasonalAlert[];
    lowStockPredictions: StockPrediction[];
    marketTrends: MarketTrend[];
    costOptimization: CostOptimization[];
  };
  summary: {
    totalAlerts: number;
    criticalPredictions: number;
    highPriorityAlerts: number;
    costSavings: number;
  };
  lastUpdated: string;
}

interface AIInsightsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIInsightsDashboard({ isOpen, onClose }: AIInsightsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'seasonal' | 'predictions' | 'trends' | 'optimization'>('overview');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch AI insights
  const { data: insights, isLoading, error } = useQuery({
    queryKey: ['ai-insights', selectedPriority, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedPriority !== 'all') params.append('priority', selectedPriority);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      
      const response = await axios.get(`/api/ai-insights?${params.toString()}`);
      return response.data as AIInsights;
    },
    enabled: isOpen,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Trigger AI analysis mutation
  const analyzeMutation = useMutation({
    mutationFn: async ({ analysisType, parameters }: { analysisType: string; parameters?: any }) => {
      const response = await axios.post('/api/ai-insights/analyze', {
        analysisType,
        parameters,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`AI analysis completed! Confidence: ${(data.results.confidence * 100).toFixed(1)}%`);
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
    },
    onError: () => {
      toast.error('Failed to run AI analysis');
    },
  });

  const handleRunAnalysis = (analysisType: string) => {
    setIsAnalyzing(true);
    analyzeMutation.mutate(
      { analysisType },
      {
        onSettled: () => {
          setIsAnalyzing(false);
        },
      }
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">AI Insights Dashboard</h2>
                <p className="text-sm text-gray-600">Intelligent inventory management powered by AI</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleRunAnalysis('general_analysis')}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                title="Close dashboard"
                aria-label="Close dashboard"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-3 border-b border-gray-200">
          <div className="flex gap-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'seasonal', label: 'Seasonal', icon: Calendar },
              { id: 'predictions', label: 'Predictions', icon: Target },
              { id: 'trends', label: 'Trends', icon: TrendingUp },
              { id: 'optimization', label: 'Optimization', icon: DollarSign },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-4">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by priority"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              <option value="food_grade">Food Grade</option>
              <option value="raw_materials">Raw Materials</option>
              <option value="packaging">Packaging</option>
              <option value="used_goods">Used Goods</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading AI insights...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">Failed to load AI insights</p>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && insights && (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                        <div>
                          <p className="text-2xl font-bold text-red-600">{insights.summary.criticalPredictions}</p>
                          <p className="text-sm text-red-600">Critical Predictions</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Bell className="w-8 h-8 text-orange-600" />
                        <div>
                          <p className="text-2xl font-bold text-orange-600">{insights.summary.highPriorityAlerts}</p>
                          <p className="text-sm text-orange-600">High Priority Alerts</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Activity className="w-8 h-8 text-blue-600" />
                        <div>
                          <p className="text-2xl font-bold text-blue-600">{insights.summary.totalAlerts}</p>
                          <p className="text-sm text-blue-600">Total Alerts</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-8 h-8 text-green-600" />
                        <div>
                          <p className="text-2xl font-bold text-green-600">${insights.summary.costSavings.toFixed(2)}</p>
                          <p className="text-sm text-green-600">Potential Savings</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={() => handleRunAnalysis('seasonal_forecast')}
                        className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        <Calendar className="w-6 h-6 text-blue-600" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Seasonal Forecast</p>
                          <p className="text-sm text-gray-600">Analyze seasonal trends</p>
                        </div>
                      </button>
                      <button
                        onClick={() => handleRunAnalysis('demand_prediction')}
                        className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        <Target className="w-6 h-6 text-green-600" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Demand Prediction</p>
                          <p className="text-sm text-gray-600">Predict stock needs</p>
                        </div>
                      </button>
                      <button
                        onClick={() => handleRunAnalysis('cost_optimization')}
                        className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        <DollarSign className="w-6 h-6 text-purple-600" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Cost Optimization</p>
                          <p className="text-sm text-gray-600">Find savings opportunities</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Recent Insights */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Insights</h3>
                    <div className="space-y-3">
                      {insights.insights.seasonalAlerts.slice(0, 3).map((alert) => (
                        <div key={alert.id} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                                  {alert.priority}
                                </span>
                                <span className="text-sm text-gray-500">{alert.category}</span>
                                <span className={`text-sm font-medium ${getConfidenceColor(alert.confidence)}`}>
                                  {(alert.confidence * 100).toFixed(0)}% confidence
                                </span>
                              </div>
                              <h4 className="font-medium text-gray-900 mb-1">{alert.title}</h4>
                              <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                              <p className="text-sm text-blue-600 font-medium">{alert.recommendedAction}</p>
                            </div>
                            <Clock className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Seasonal Tab */}
              {activeTab === 'seasonal' && insights && (
                <div className="space-y-4">
                  {insights.insights.seasonalAlerts.map((alert) => (
                    <div key={alert.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-6 h-6 text-blue-600" />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                            <p className="text-sm text-gray-600">{alert.timeframe}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(alert.priority)}`}>
                            {alert.priority}
                          </span>
                          <span className={`text-sm font-medium ${getConfidenceColor(alert.confidence)}`}>
                            {(alert.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">{alert.message}</p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-blue-900 mb-1">Recommended Action</p>
                            <p className="text-blue-800">{alert.recommendedAction}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Predictions Tab */}
              {activeTab === 'predictions' && insights && (
                <div className="space-y-4">
                  {insights.insights.lowStockPredictions.map((prediction) => (
                    <div key={prediction.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Package className="w-6 h-6 text-orange-600" />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{prediction.itemName}</h3>
                            <p className="text-sm text-gray-600">Current Stock: {prediction.currentStock}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(prediction.urgency)}`}>
                            {prediction.urgency}
                          </span>
                          <span className={`text-sm font-medium ${getConfidenceColor(prediction.confidence)}`}>
                            {(prediction.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Predicted Depletion</p>
                          <p className="font-medium text-gray-900">
                            {new Date(prediction.predictedDepletionDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Recommended Order</p>
                          <p className="font-medium text-gray-900">{prediction.recommendedOrderQuantity} units</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Factors</p>
                          <p className="font-medium text-gray-900">{prediction.factors.length} identified</p>
                        </div>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <p className="font-medium text-orange-900 mb-2">Key Factors:</p>
                        <ul className="text-orange-800 space-y-1">
                          {prediction.factors.map((factor, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <ArrowRight className="w-3 h-3" />
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Trends Tab */}
              {activeTab === 'trends' && insights && (
                <div className="space-y-4">
                  {insights.insights.marketTrends.map((trend) => (
                    <div key={trend.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {trend.impact === 'positive' ? (
                            <TrendingUp className="w-6 h-6 text-green-600" />
                          ) : trend.impact === 'negative' ? (
                            <TrendingDown className="w-6 h-6 text-red-600" />
                          ) : (
                            <Activity className="w-6 h-6 text-gray-600" />
                          )}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{trend.trend}</h3>
                            <p className="text-sm text-gray-600">{trend.category} • {trend.timeframe}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getImpactColor(trend.impact)}`}>
                            {trend.impact}
                          </span>
                          <span className={`text-sm font-medium ${getConfidenceColor(trend.confidence)}`}>
                            {(trend.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-gray-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900 mb-1">Recommendation</p>
                            <p className="text-gray-700">{trend.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Optimization Tab */}
              {activeTab === 'optimization' && insights && (
                <div className="space-y-4">
                  {insights.insights.costOptimization.map((optimization) => (
                    <div key={optimization.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-6 h-6 text-green-600" />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{optimization.itemName}</h3>
                            <p className="text-sm text-gray-600">{optimization.type.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">${optimization.savings.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">per unit savings</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Current Cost</p>
                          <p className="font-medium text-gray-900">${optimization.currentCost.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Optimized Cost</p>
                          <p className="font-medium text-gray-900">
                            ${(optimization.bulkCost || optimization.alternativeCost || 0).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Confidence</p>
                          <p className={`font-medium ${getConfidenceColor(optimization.confidence)}`}>
                            {(optimization.confidence * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                      {optimization.minOrderQuantity && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-green-900 mb-1">Bulk Purchase Opportunity</p>
                              <p className="text-green-800">
                                Minimum order: {optimization.minOrderQuantity} units
                                {optimization.paybackPeriod && ` • Payback: ${optimization.paybackPeriod}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Last updated: {insights ? new Date(insights.lastUpdated).toLocaleString() : 'Never'}
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">AI Service Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
