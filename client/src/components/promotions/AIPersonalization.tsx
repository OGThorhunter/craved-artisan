import React, { useState } from 'react';
import {
  Brain,
  Target,
  Users,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  SquareStop,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Zap,
  Star,
  Award,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Search,
  Copy,
  Share2,
  Activity,
  Lightbulb,
  Sparkles,
  Cpu,
  Database,
  Layers
} from 'lucide-react';

interface PersonalizationRule {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  type: 'recommendation' | 'pricing' | 'content' | 'timing' | 'channel';
  aiModel: string;
  conditions: {
    customerSegment?: string;
    behaviorPattern?: string;
    purchaseHistory?: string;
    engagementLevel?: string;
    deviceType?: string;
    timeOfDay?: string;
    location?: string;
  };
  actions: {
    type: string;
    value: string;
    priority: number;
  }[];
  metrics: {
    totalImpressions: number;
    clickThroughRate: number;
    conversionRate: number;
    revenueImpact: number;
    engagementRate: number;
    satisfactionScore: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface PersonalizationInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'warning';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  category: 'customer' | 'product' | 'pricing' | 'timing' | 'content';
  data: {
    current: number;
    previous: number;
    change: number;
    benchmark: number;
  };
  recommendations: string[];
  createdAt: string;
}

const AIPersonalization: React.FC = () => {
  const [selectedRule, setSelectedRule] = useState<PersonalizationRule | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'rules' | 'insights' | 'analytics'>('rules');

  // Mock data
  const personalizationRules: PersonalizationRule[] = [
    {
      id: '1',
      name: 'Product Recommendation Engine',
      description: 'AI-powered product recommendations based on purchase history and behavior',
      status: 'active',
      type: 'recommendation',
      aiModel: 'Collaborative Filtering + Content-Based',
      conditions: {
        customerSegment: 'all',
        behaviorPattern: 'browsing_history',
        purchaseHistory: 'last_30_days',
        engagementLevel: 'medium_high'
      },
      actions: [
        { type: 'recommend_products', value: 'similar_items', priority: 1 },
        { type: 'show_personalized_banner', value: 'recommended_for_you', priority: 2 },
        { type: 'send_email', value: 'product_suggestions', priority: 3 }
      ],
      metrics: {
        totalImpressions: 12500,
        clickThroughRate: 8.5,
        conversionRate: 12.3,
        revenueImpact: 2500,
        engagementRate: 15.2,
        satisfactionScore: 4.2
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2025-01-20T00:00:00Z'
    },
    {
      id: '2',
      name: 'Dynamic Pricing Personalization',
      description: 'Personalized pricing based on customer value and price sensitivity',
      status: 'active',
      type: 'pricing',
      aiModel: 'Price Elasticity + Customer LTV',
      conditions: {
        customerSegment: 'vip_premium',
        behaviorPattern: 'price_sensitive',
        purchaseHistory: 'high_value',
        engagementLevel: 'high'
      },
      actions: [
        { type: 'adjust_price', value: 'discount_5_percent', priority: 1 },
        { type: 'show_personalized_offer', value: 'exclusive_discount', priority: 2 },
        { type: 'send_notification', value: 'price_drop_alert', priority: 3 }
      ],
      metrics: {
        totalImpressions: 3200,
        clickThroughRate: 15.8,
        conversionRate: 22.1,
        revenueImpact: 1800,
        engagementRate: 18.5,
        satisfactionScore: 4.5
      },
      createdAt: '2024-02-15T00:00:00Z',
      updatedAt: '2025-01-18T00:00:00Z'
    },
    {
      id: '3',
      name: 'Content Personalization',
      description: 'Personalized content and messaging based on customer preferences',
      status: 'paused',
      type: 'content',
      aiModel: 'Natural Language Processing + Sentiment Analysis',
      conditions: {
        customerSegment: 'all',
        behaviorPattern: 'content_engagement',
        engagementLevel: 'medium_high',
        deviceType: 'mobile_desktop'
      },
      actions: [
        { type: 'customize_hero_banner', value: 'personalized_message', priority: 1 },
        { type: 'adjust_content_tone', value: 'formal_casual', priority: 2 },
        { type: 'show_relevant_testimonials', value: 'similar_customers', priority: 3 }
      ],
      metrics: {
        totalImpressions: 8500,
        clickThroughRate: 6.2,
        conversionRate: 9.8,
        revenueImpact: 1200,
        engagementRate: 12.3,
        satisfactionScore: 3.9
      },
      createdAt: '2024-03-01T00:00:00Z',
      updatedAt: '2025-01-10T00:00:00Z'
    }
  ];

  const insights: PersonalizationInsight[] = [
    {
      id: '1',
      type: 'opportunity',
      title: 'High-Value Customer Segment Underperforming',
      description: 'VIP customers show 15% lower engagement with personalized recommendations compared to other segments.',
      confidence: 92,
      impact: 'high',
      category: 'customer',
      data: {
        current: 65,
        previous: 80,
        change: -15,
        benchmark: 75
      },
      recommendations: [
        'Adjust recommendation algorithm for VIP segment',
        'Increase personalization frequency for high-value customers',
        'Create exclusive VIP-only product recommendations'
      ],
      createdAt: '2025-01-20T10:00:00Z'
    },
    {
      id: '2',
      type: 'trend',
      title: 'Mobile Users Prefer Visual Content',
      description: 'Mobile users show 25% higher engagement with image-based recommendations vs text-based.',
      confidence: 88,
      impact: 'medium',
      category: 'content',
      data: {
        current: 85,
        previous: 60,
        change: 25,
        benchmark: 70
      },
      recommendations: [
        'Increase visual content ratio for mobile users',
        'Implement image-heavy recommendation layouts',
        'A/B test visual vs text recommendations'
      ],
      createdAt: '2025-01-19T14:30:00Z'
    },
    {
      id: '3',
      type: 'anomaly',
      title: 'Unusual Spike in Price Sensitivity',
      description: 'Price sensitivity increased 40% in the last week, affecting conversion rates.',
      confidence: 95,
      impact: 'high',
      category: 'pricing',
      data: {
        current: 45,
        previous: 25,
        change: 40,
        benchmark: 30
      },
      recommendations: [
        'Adjust pricing strategy for sensitive segments',
        'Increase discount frequency for price-sensitive customers',
        'Implement dynamic pricing based on sensitivity scores'
      ],
      createdAt: '2025-01-18T16:45:00Z'
    }
  ];

  const filteredRules = personalizationRules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || rule.status === filterStatus;
    const matchesType = filterType === 'all' || rule.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatNumber = (num: number) => num.toLocaleString();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4 text-green-500" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'draft': return <Clock className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'recommendation': return <Target className="h-4 w-4 text-blue-500" />;
      case 'pricing': return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'content': return <Layers className="h-4 w-4 text-purple-500" />;
      case 'timing': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'channel': return <Share2 className="h-4 w-4 text-red-500" />;
      default: return <Brain className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'recommendation': return 'bg-blue-100 text-blue-800';
      case 'pricing': return 'bg-green-100 text-green-800';
      case 'content': return 'bg-purple-100 text-purple-800';
      case 'timing': return 'bg-orange-100 text-orange-800';
      case 'channel': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'anomaly': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'opportunity': return <Lightbulb className="h-5 w-5 text-green-500" />;
      case 'warning': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Brain className="h-5 w-5 text-gray-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'trend': return 'bg-blue-50 border-blue-200';
      case 'anomaly': return 'bg-yellow-50 border-yellow-200';
      case 'opportunity': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Personalization</h2>
          <p className="text-gray-600 mt-1">Intelligent personalization powered by machine learning</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => console.log('Export personalization data')}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            title="Export personalization data"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Create new personalization rule"
          >
            <Plus className="h-4 w-4" />
            <span>New Rule</span>
          </button>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">View:</label>
          <div className="flex items-center space-x-2">
            {[
              { value: 'rules', label: 'Personalization Rules', icon: Settings },
              { value: 'insights', label: 'AI Insights', icon: Lightbulb },
              { value: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setViewMode(value as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  viewMode === value
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title={label}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Rules</p>
              <p className="text-2xl font-bold text-gray-900">
                {personalizationRules.filter(r => r.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Impressions</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(personalizationRules.reduce((sum, r) => sum + r.metrics.totalImpressions, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. CTR</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(personalizationRules.reduce((sum, r) => sum + r.metrics.clickThroughRate, 0) / personalizationRules.length)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenue Impact</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(personalizationRules.reduce((sum, r) => sum + r.metrics.revenueImpact, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'rules' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search rules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Filter by status"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="draft">Draft</option>
                </select>

                {/* Type Filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Filter by type"
                >
                  <option value="all">All Types</option>
                  <option value="recommendation">Recommendation</option>
                  <option value="pricing">Pricing</option>
                  <option value="content">Content</option>
                  <option value="timing">Timing</option>
                  <option value="channel">Channel</option>
                </select>
              </div>
            </div>
          </div>

          {/* Rules List */}
          <div className="space-y-6">
            {filteredRules.map((rule) => (
              <div key={rule.id} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(rule.type)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(rule.type)}`}>
                            {rule.type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(rule.status)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(rule.status)}`}>
                            {rule.status}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{rule.description}</p>

                      {/* AI Model */}
                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-500">AI Model:</span>
                        <span className="ml-1 text-sm text-gray-900">{rule.aiModel}</span>
                      </div>

                      {/* Actions */}
                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-500">Actions:</span>
                        <div className="mt-2 space-y-1">
                          {rule.actions.map((action, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">#{action.priority}</span>
                              <span className="text-sm text-gray-900">{action.type}</span>
                              <span className="text-xs text-gray-500">({action.value})</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Impressions:</span>
                          <span className="ml-1 text-sm font-semibold text-gray-900">{formatNumber(rule.metrics.totalImpressions)}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">CTR:</span>
                          <span className="ml-1 text-sm font-semibold text-gray-900">{formatPercentage(rule.metrics.clickThroughRate)}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Conversion:</span>
                          <span className="ml-1 text-sm font-semibold text-gray-900">{formatPercentage(rule.metrics.conversionRate)}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Revenue:</span>
                          <span className="ml-1 text-sm font-semibold text-gray-900">{formatCurrency(rule.metrics.revenueImpact)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedRule(rule)}
                        className="text-gray-600 hover:text-blue-600"
                        title="View rule details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => console.log('Edit rule', rule.id)}
                        className="text-gray-600 hover:text-green-600"
                        title="Edit rule"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => console.log('Copy rule', rule.id)}
                        className="text-gray-600 hover:text-purple-600"
                        title="Copy rule"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => console.log('Delete rule', rule.id)}
                        className="text-gray-600 hover:text-red-600"
                        title="Delete rule"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'insights' && (
        <div className="space-y-6">
          {insights.map((insight) => (
            <div key={insight.id} className={`p-6 rounded-lg border ${getInsightColor(insight.type)}`}>
              <div className="flex items-start space-x-3">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">{insight.title}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(insight.impact)}`}>
                        {insight.impact} impact
                      </span>
                      <span className="text-xs text-gray-500">
                        {insight.confidence}% confidence
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{insight.description}</p>
                  
                  {/* Data */}
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-xs text-gray-500">Current:</span>
                      <span className="ml-1 text-sm font-semibold text-gray-900">{insight.data.current}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Previous:</span>
                      <span className="ml-1 text-sm font-semibold text-gray-900">{insight.data.previous}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Change:</span>
                      <span className={`ml-1 text-sm font-semibold ${insight.data.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {insight.data.change > 0 ? '+' : ''}{insight.data.change}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Benchmark:</span>
                      <span className="ml-1 text-sm font-semibold text-gray-900">{insight.data.benchmark}</span>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="mt-4">
                    <h5 className="text-xs font-medium text-gray-700 mb-2">Recommendations:</h5>
                    <ul className="space-y-1">
                      {insight.recommendations.map((rec, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-start space-x-2">
                          <span className="text-gray-400">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rule Performance */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Rule Performance</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {personalizationRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(rule.type)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{rule.name}</p>
                        <p className="text-xs text-gray-500">{rule.type} personalization</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatPercentage(rule.metrics.conversionRate)}</p>
                      <p className="text-xs text-gray-500">conversion</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue Impact */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Revenue Impact</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {personalizationRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{rule.name}</p>
                        <p className="text-xs text-gray-500">{formatPercentage(rule.metrics.clickThroughRate)} CTR</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(rule.metrics.revenueImpact)}</p>
                      <p className="text-xs text-gray-500">revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {viewMode === 'rules' && filteredRules.length === 0 && (
        <div className="text-center py-12">
          <Brain className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No personalization rules found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all' || filterType !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first personalization rule.'}
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPersonalization;
