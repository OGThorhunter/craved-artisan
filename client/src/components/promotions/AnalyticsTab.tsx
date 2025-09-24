import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  DollarSign,
  Eye,
  MousePointer,
  Gift,
  Calendar,
  Download,
  Filter,
  Search,
  Brain,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Zap,
  Settings,
  MoreHorizontal,
  X
} from 'lucide-react';

interface AnalyticsData {
  impressions: number;
  clicks: number;
  redemptions: number;
  revenue: number;
  conversionRate: number;
  aovShift: number;
  topPromotions: Array<{
    id: string;
    name: string;
    performance: number;
  }>;
  funnelData: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
}

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  variants: Array<{
    id: string;
    name: string;
    traffic: number;
    conversions: number;
    revenue: number;
  }>;
  startDate: string;
  endDate?: string;
  confidence: number;
  winner?: string;
}

interface AIInsight {
  id: string;
  type: 'recommendation' | 'optimization' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  createdAt: string;
}

interface AnalyticsTabProps {
  analytics: AnalyticsData;
  abTests: ABTest[];
  onReportGenerate: (type: string) => void;
  onABTestCreate: (test: Partial<ABTest>) => void;
  onABTestUpdate: (test: ABTest) => void;
  onABTestRun: (id: string) => void;
  onInsightAction: (id: string, action: string) => void;
  onExportData: (format: string) => void;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  isLoading: boolean;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  analytics,
  abTests,
  onReportGenerate,
  onABTestCreate,
  onABTestUpdate,
  onABTestRun,
  onInsightAction,
  onExportData,
  timeRange,
  onTimeRangeChange,
  isLoading
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'ab-tests' | 'insights'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedABTest, setSelectedABTest] = useState<ABTest | null>(null);
  const [showABTestDetails, setShowABTestDetails] = useState(false);

  // Mock AI insights
  const aiInsights: AIInsight[] = [
    {
      id: '1',
      type: 'recommendation',
      title: 'Best Time to Send Emails',
      description: 'Emails sent on Tuesday at 2 PM have 23% higher open rates',
      confidence: 87,
      priority: 'high',
      actionable: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      type: 'optimization',
      title: 'Promotion Optimization',
      description: 'Increase discount to 25% for better conversion rates',
      confidence: 72,
      priority: 'medium',
      actionable: true,
      createdAt: new Date().toISOString()
    }
  ];

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatNumber = (value: number) => value.toLocaleString();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Sub-tabs */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeSubTab === 'overview' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveSubTab('ab-tests')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeSubTab === 'ab-tests' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Target className="h-4 w-4 inline mr-2" />
              A/B Tests
            </button>
            <button
              onClick={() => setActiveSubTab('insights')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeSubTab === 'insights' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Brain className="h-4 w-4 inline mr-2" />
              AI Insights
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="Select time range"
            aria-label="Select time range"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
            <option value="all">All time</option>
          </select>
          
          <button
            onClick={() => onExportData('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          
          <button
            onClick={() => onReportGenerate('comprehensive')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Impressions</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.impressions || 0)}</p>
                  <p className="text-sm text-green-600">+12.5% from last period</p>
                </div>
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Clicks</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.clicks || 0)}</p>
                  <p className="text-sm text-green-600">+8.2% from last period</p>
                </div>
                <MousePointer className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Redemptions</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.redemptions || 0)}</p>
                  <p className="text-sm text-green-600">+15.3% from last period</p>
                </div>
                <Gift className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            
            <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue Impact</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.revenue || 0)}</p>
                  <p className="text-sm text-green-600">+22.1% from last period</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
              <div className="space-y-4">
                {analytics.funnelData?.map((stage, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                      </div>
                      <span className="font-medium text-gray-900">{stage.stage}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{formatNumber(stage.count)}</div>
                      <div className="text-sm text-gray-500">{formatPercentage(stage.percentage)}</div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Funnel data will be displayed here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Promotions */}
            <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Promotions</h3>
              <div className="space-y-4">
                {analytics.topPromotions?.map((promotion, index) => (
                  <div key={promotion.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-green-600">{index + 1}</span>
                      </div>
                      <span className="font-medium text-gray-900">{promotion.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{formatPercentage(promotion.performance)}</div>
                      <div className="text-sm text-gray-500">Performance</div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Top promotions will be displayed here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* A/B Tests Tab */}
      {activeSubTab === 'ab-tests' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">A/B Tests</h3>
            <button
              onClick={() => onABTestCreate({})}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Target className="h-4 w-4" />
              Create A/B Test
            </button>
          </div>

          <div className="space-y-4">
            {abTests.map((test) => (
              <div
                key={test.id}
                className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 cursor-pointer"
                style={{ backgroundColor: '#F7F2EC' }}
                onClick={() => {
                  setSelectedABTest(test);
                  setShowABTestDetails(true);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{test.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                          {test.status}
                        </span>
                        {test.winner && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Winner: {test.winner}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Confidence: {formatPercentage(test.confidence)}</span>
                        <span>Variants: {test.variants.length}</span>
                        <span>Start: {new Date(test.startDate).toLocaleDateString()}</span>
                        {test.endDate && (
                          <span>End: {new Date(test.endDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onABTestRun(test.id);
                      }}
                      className="p-2 text-green-600 hover:text-green-700 transition-colors"
                      title="Run Test"
                      aria-label="Run A/B test"
                    >
                      <Zap className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onABTestUpdate(test);
                      }}
                      className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                      title="Edit Test"
                      aria-label="Edit A/B test"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights Tab */}
      {activeSubTab === 'insights' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
            <button
              onClick={() => onInsightAction('generate', '')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Brain className="h-4 w-4" />
              Generate Insights
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiInsights.map((insight) => (
              <div
                key={insight.id}
                className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
                style={{ backgroundColor: '#F7F2EC' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Brain className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${getPriorityColor(insight.priority)}`}>
                      {insight.priority}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatPercentage(insight.confidence)} confidence
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {new Date(insight.createdAt).toLocaleDateString()}
                  </div>
                  {insight.actionable && (
                    <button
                      onClick={() => onInsightAction(insight.id, 'apply')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Apply
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* A/B Test Details Modal */}
      {showABTestDetails && selectedABTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedABTest.name}</h2>
                <button
                  onClick={() => setShowABTestDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close modal"
                  aria-label="Close A/B test details"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Variants</h3>
                <div className="space-y-4">
                  {selectedABTest.variants.map((variant, index) => (
                    <div key={variant.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-900">{variant.name}</h4>
                        <p className="text-sm text-gray-600">Traffic: {formatPercentage(variant.traffic)}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatNumber(variant.conversions)} conversions</div>
                        <div className="text-sm text-gray-500">{formatCurrency(variant.revenue)} revenue</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onABTestRun(selectedABTest.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Zap className="h-4 w-4" />
                  Run Test
                </button>
                <button
                  onClick={() => onABTestUpdate(selectedABTest)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Edit Test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsTab;
