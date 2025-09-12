import React, { useState } from 'react';
import {
  Lightbulb,
  Zap,
  Target,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Settings,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Eye,
  MousePointer,
  ShoppingCart,
  Percent,
  Award,
  RefreshCw,
  Download,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  SquareStop
} from 'lucide-react';

interface Recommendation {
  id: string;
  type: 'optimization' | 'investment' | 'warning' | 'success' | 'automation';
  category: 'conversion' | 'revenue' | 'cost' | 'engagement' | 'retention';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  priority: number;
  potentialGain: number;
  confidence: number;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  createdAt: string;
  updatedAt: string;
  data: {
    currentValue: number;
    targetValue: number;
    improvement: number;
    timeframe: string;
    cost?: number;
    roi?: number;
  };
  actions: Array<{
    id: string;
    title: string;
    description: string;
    type: 'implement' | 'test' | 'monitor' | 'dismiss';
    status: 'pending' | 'in_progress' | 'completed';
  }>;
}

const AutomatedRecommendations: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);

  // Mock recommendations data
  const recommendations: Recommendation[] = [
    {
      id: '1',
      type: 'optimization',
      category: 'conversion',
      title: 'Optimize Mobile Checkout Flow',
      description: 'Mobile conversion rate is 23% lower than desktop. Implement mobile-specific checkout optimizations.',
      impact: 'high',
      effort: 'medium',
      priority: 1,
      potentialGain: 25.0,
      confidence: 92,
      status: 'pending',
      createdAt: '2025-01-20T00:00:00Z',
      updatedAt: '2025-01-20T00:00:00Z',
      data: {
        currentValue: 11.3,
        targetValue: 14.1,
        improvement: 24.8,
        timeframe: '2-3 weeks',
        cost: 5000,
        roi: 4.2
      },
      actions: [
        { id: '1', title: 'Implement mobile-first checkout', description: 'Redesign checkout flow for mobile devices', type: 'implement', status: 'pending' },
        { id: '2', title: 'A/B test new flow', description: 'Test new checkout flow with 50% of mobile traffic', type: 'test', status: 'pending' },
        { id: '3', title: 'Monitor performance', description: 'Track conversion rate improvements', type: 'monitor', status: 'pending' }
      ]
    },
    {
      id: '2',
      type: 'investment',
      category: 'revenue',
      title: 'Increase Email Marketing Budget',
      description: 'Email campaigns show 9.0x ROI. Increase budget allocation for better returns.',
      impact: 'high',
      effort: 'low',
      priority: 2,
      potentialGain: 35.0,
      confidence: 88,
      status: 'in_progress',
      createdAt: '2025-01-19T00:00:00Z',
      updatedAt: '2025-01-20T00:00:00Z',
      data: {
        currentValue: 5000,
        targetValue: 8000,
        improvement: 60.0,
        timeframe: '1 week',
        cost: 3000,
        roi: 9.0
      },
      actions: [
        { id: '1', title: 'Allocate additional budget', description: 'Increase email marketing budget by $3,000', type: 'implement', status: 'completed' },
        { id: '2', title: 'Scale successful campaigns', description: 'Increase frequency of high-performing email campaigns', type: 'implement', status: 'in_progress' },
        { id: '3', title: 'Monitor ROI', description: 'Track ROI performance after budget increase', type: 'monitor', status: 'pending' }
      ]
    },
    {
      id: '3',
      type: 'warning',
      category: 'cost',
      title: 'Display Ads Underperforming',
      description: 'Display ads show low ROI (1.54x). Consider reallocating budget to high-performing channels.',
      impact: 'medium',
      effort: 'low',
      priority: 3,
      potentialGain: 20.0,
      confidence: 85,
      status: 'pending',
      createdAt: '2025-01-18T00:00:00Z',
      updatedAt: '2025-01-20T00:00:00Z',
      data: {
        currentValue: 1.54,
        targetValue: 3.0,
        improvement: 94.8,
        timeframe: '1-2 weeks',
        cost: 0,
        roi: 0
      },
      actions: [
        { id: '1', title: 'Pause underperforming ads', description: 'Stop low-performing display ad campaigns', type: 'implement', status: 'pending' },
        { id: '2', title: 'Reallocate budget', description: 'Move budget to email and social media channels', type: 'implement', status: 'pending' },
        { id: '3', title: 'Test new ad formats', description: 'Test different display ad formats and placements', type: 'test', status: 'pending' }
      ]
    },
    {
      id: '4',
      type: 'automation',
      category: 'engagement',
      title: 'Implement Abandoned Cart Recovery',
      description: 'Set up automated email sequence for abandoned cart recovery to increase conversions.',
      impact: 'high',
      effort: 'medium',
      priority: 4,
      potentialGain: 30.0,
      confidence: 90,
      status: 'completed',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-20T00:00:00Z',
      data: {
        currentValue: 0,
        targetValue: 12.0,
        improvement: 0,
        timeframe: '1 week',
        cost: 1000,
        roi: 12.0
      },
      actions: [
        { id: '1', title: 'Set up email sequence', description: 'Create 3-email abandoned cart recovery sequence', type: 'implement', status: 'completed' },
        { id: '2', title: 'Configure triggers', description: 'Set up cart abandonment triggers', type: 'implement', status: 'completed' },
        { id: '3', title: 'Monitor performance', description: 'Track recovery rate and revenue impact', type: 'monitor', status: 'completed' }
      ]
    },
    {
      id: '5',
      type: 'success',
      category: 'revenue',
      title: 'VIP Customer Program Success',
      description: 'VIP customer segment shows excellent performance. Consider expanding VIP benefits.',
      impact: 'high',
      effort: 'low',
      priority: 5,
      potentialGain: 15.0,
      confidence: 95,
      status: 'pending',
      createdAt: '2025-01-17T00:00:00Z',
      updatedAt: '2025-01-20T00:00:00Z',
      data: {
        currentValue: 9.0,
        targetValue: 10.5,
        improvement: 16.7,
        timeframe: '2 weeks',
        cost: 2000,
        roi: 9.0
      },
      actions: [
        { id: '1', title: 'Expand VIP benefits', description: 'Add exclusive products and early access', type: 'implement', status: 'pending' },
        { id: '2', title: 'Create VIP-only promotions', description: 'Develop exclusive promotional campaigns', type: 'implement', status: 'pending' },
        { id: '3', title: 'Track engagement', description: 'Monitor VIP customer engagement and retention', type: 'monitor', status: 'pending' }
      ]
    }
  ];

  const filteredRecommendations = recommendations.filter(rec => {
    const matchesType = filterType === 'all' || rec.type === filterType;
    const matchesStatus = filterStatus === 'all' || rec.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || rec.category === filterCategory;
    const matchesSearch = rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rec.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesStatus && matchesCategory && matchesSearch;
  });

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatNumber = (num: number) => num.toLocaleString();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'optimization': return <Zap className="h-5 w-5 text-blue-500" />;
      case 'investment': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'automation': return <Settings className="h-5 w-5 text-purple-500" />;
      default: return <Lightbulb className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'optimization': return 'bg-blue-100 text-blue-800';
      case 'investment': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'automation': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-gray-500" />;
      case 'in_progress': return <Activity className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'dismissed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return 'text-red-600 bg-red-100';
    if (priority <= 4) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Automated Recommendations</h2>
          <p className="text-gray-600 mt-1">AI-powered insights and optimization recommendations</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => console.log('Refresh recommendations')}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            title="Refresh recommendations"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => console.log('Export recommendations')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Export recommendations"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search recommendations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Filter by type"
            >
              <option value="all">All Types</option>
              <option value="optimization">Optimization</option>
              <option value="investment">Investment</option>
              <option value="warning">Warning</option>
              <option value="success">Success</option>
              <option value="automation">Automation</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="dismissed">Dismissed</option>
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Filter by category"
            >
              <option value="all">All Categories</option>
              <option value="conversion">Conversion</option>
              <option value="revenue">Revenue</option>
              <option value="cost">Cost</option>
              <option value="engagement">Engagement</option>
              <option value="retention">Retention</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-6">
        {filteredRecommendations.map((recommendation) => (
          <div key={recommendation.id} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getTypeIcon(recommendation.type)}
                    <h3 className="text-lg font-semibold text-gray-900">{recommendation.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(recommendation.type)}`}>
                        {recommendation.type}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(recommendation.status)}`}>
                        {recommendation.status}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(recommendation.impact)}`}>
                        {recommendation.impact} impact
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(recommendation.priority)}`}>
                        Priority {recommendation.priority}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{recommendation.description}</p>

                  {/* Recommendation Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Potential Gain:</span>
                      <span className="ml-1 text-sm font-semibold text-green-600">
                        +{formatPercentage(recommendation.potentialGain)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Confidence:</span>
                      <span className="ml-1 text-sm font-semibold text-gray-900">
                        {recommendation.confidence}%
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Timeframe:</span>
                      <span className="ml-1 text-sm font-semibold text-gray-900">
                        {recommendation.data.timeframe}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">ROI:</span>
                      <span className="ml-1 text-sm font-semibold text-gray-900">
                        {recommendation.data.roi ? `${recommendation.data.roi.toFixed(1)}x` : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Actions:</h4>
                    <div className="space-y-2">
                      {recommendation.actions.map((action) => (
                        <div key={action.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(action.status)}
                            <span className="text-sm text-gray-900">{action.title}</span>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            action.status === 'completed' ? 'bg-green-100 text-green-800' :
                            action.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {action.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => setSelectedRecommendation(recommendation)}
                    className="text-gray-600 hover:text-blue-600"
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => console.log('Edit recommendation', recommendation.id)}
                    className="text-gray-600 hover:text-green-600"
                    title="Edit recommendation"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => console.log('Dismiss recommendation', recommendation.id)}
                    className="text-gray-600 hover:text-red-600"
                    title="Dismiss recommendation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRecommendations.length === 0 && (
        <div className="text-center py-12">
          <Lightbulb className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No recommendations found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all' || filterCategory !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'No recommendations available at this time.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AutomatedRecommendations;
