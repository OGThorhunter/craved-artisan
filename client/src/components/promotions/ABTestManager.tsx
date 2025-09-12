import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  TrendingUp,
  Settings,
  Play,
  Pause,
  SquareStop,
  Plus,
  Edit,
  Trash2,
  Eye,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface ABTest {
  id: string;
  name: string;
  description: string;
  promotionId: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: ABTestVariant[];
  trafficSplit: number[];
  startDate: string;
  endDate: string;
  metrics: {
    totalVisitors: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
    statisticalSignificance: number;
  };
  winner?: string;
  createdAt: string;
}

interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  trafficPercentage: number;
  promotionConfig: any;
  metrics: {
    visitors: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
  };
  isWinner: boolean;
}

const ABTestManager: React.FC = () => {
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);

  // Mock data
  const abTests: ABTest[] = [
    {
      id: '1',
      name: 'Holiday Sale A/B Test',
      description: 'Testing different discount percentages for holiday promotion',
      promotionId: '1',
      status: 'running',
      variants: [
        {
          id: 'v1',
          name: 'Control - 20% Off',
          description: 'Original 20% discount offer',
          trafficPercentage: 50,
          promotionConfig: { type: 'percentage', value: 20 },
          metrics: {
            visitors: 1250,
            conversions: 156,
            conversionRate: 12.5,
            revenue: 3120
          },
          isWinner: false
        },
        {
          id: 'v2',
          name: 'Variant A - 25% Off',
          description: 'Increased discount to 25%',
          trafficPercentage: 50,
          promotionConfig: { type: 'percentage', value: 25 },
          metrics: {
            visitors: 1180,
            conversions: 189,
            conversionRate: 16.0,
            revenue: 3780
          },
          isWinner: true
        }
      ],
      trafficSplit: [50, 50],
      startDate: '2025-01-15T00:00:00Z',
      endDate: '2025-01-31T23:59:59Z',
      metrics: {
        totalVisitors: 2430,
        conversions: 345,
        conversionRate: 14.2,
        revenue: 6900,
        statisticalSignificance: 95.2
      },
      winner: 'v2',
      createdAt: '2025-01-10T00:00:00Z'
    },
    {
      id: '2',
      name: 'Free Shipping Test',
      description: 'Testing free shipping vs discount offers',
      promotionId: '2',
      status: 'completed',
      variants: [
        {
          id: 'v1',
          name: 'Control - $10 Off',
          description: 'Original $10 discount offer',
          trafficPercentage: 50,
          promotionConfig: { type: 'fixed_amount', value: 10 },
          metrics: {
            visitors: 890,
            conversions: 89,
            conversionRate: 10.0,
            revenue: 1780
          },
          isWinner: false
        },
        {
          id: 'v2',
          name: 'Variant A - Free Shipping',
          description: 'Free shipping on orders over $50',
          trafficPercentage: 50,
          promotionConfig: { type: 'free_shipping', minOrderAmount: 50 },
          metrics: {
            visitors: 920,
            conversions: 138,
            conversionRate: 15.0,
            revenue: 2760
          },
          isWinner: true
        }
      ],
      trafficSplit: [50, 50],
      startDate: '2025-01-01T00:00:00Z',
      endDate: '2025-01-14T23:59:59Z',
      metrics: {
        totalVisitors: 1810,
        conversions: 227,
        conversionRate: 12.5,
        revenue: 4540,
        statisticalSignificance: 98.7
      },
      winner: 'v2',
      createdAt: '2024-12-28T00:00:00Z'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="h-4 w-4 text-green-500" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'draft': return <Edit className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">A/B Testing</h2>
          <p className="text-gray-600 mt-1">Test different promotion variants to optimize performance</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          title="Create new A/B test"
        >
          <Plus className="h-4 w-4" />
          <span>New A/B Test</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tests</p>
              <p className="text-2xl font-bold text-gray-900">{abTests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Play className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Running</p>
              <p className="text-2xl font-bold text-gray-900">
                {abTests.filter(t => t.status === 'running').length}
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
              <p className="text-sm font-medium text-gray-600">Avg. Lift</p>
              <p className="text-2xl font-bold text-gray-900">+23.5%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">87%</p>
            </div>
          </div>
        </div>
      </div>

      {/* A/B Tests List */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Active A/B Tests</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {abTests.map((test) => (
            <div key={test.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{test.name}</h4>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(test.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(test.status)}`}>
                        {test.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{test.description}</p>
                  
                  {/* Variants */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {test.variants.map((variant) => (
                      <div key={variant.id} className={`p-4 rounded-lg border ${
                        variant.isWinner ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">{variant.name}</h5>
                          {variant.isWinner && (
                            <div className="flex items-center space-x-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-xs font-medium">Winner</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{variant.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Visitors:</span>
                            <span className="ml-1 font-medium">{variant.metrics.visitors.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Conv. Rate:</span>
                            <span className="ml-1 font-medium">{formatPercentage(variant.metrics.conversionRate)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Revenue:</span>
                            <span className="ml-1 font-medium">{formatCurrency(variant.metrics.revenue)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Traffic:</span>
                            <span className="ml-1 font-medium">{variant.trafficPercentage}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Overall Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Total Visitors:</span>
                      <span className="ml-1 font-medium">{test.metrics.totalVisitors.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Conversions:</span>
                      <span className="ml-1 font-medium">{test.metrics.conversions}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Overall Conv. Rate:</span>
                      <span className="ml-1 font-medium">{formatPercentage(test.metrics.conversionRate)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Statistical Significance:</span>
                      <span className="ml-1 font-medium">{formatPercentage(test.metrics.statisticalSignificance)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => setShowResultsModal(true)}
                    className="text-gray-600 hover:text-blue-600"
                    title="View detailed results"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setSelectedTest(test)}
                    className="text-gray-600 hover:text-green-600"
                    title="Edit test"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  {test.status === 'running' && (
                    <button
                      onClick={() => console.log('Pause test', test.id)}
                      className="text-gray-600 hover:text-yellow-600"
                      title="Pause test"
                    >
                      <Pause className="h-4 w-4" />
                    </button>
                  )}
                  {test.status === 'paused' && (
                    <button
                      onClick={() => console.log('Resume test', test.id)}
                      className="text-gray-600 hover:text-green-600"
                      title="Resume test"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => console.log('Delete test', test.id)}
                    className="text-gray-600 hover:text-red-600"
                    title="Delete test"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {abTests.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No A/B tests found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first A/B test to optimize your promotions.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create A/B Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ABTestManager;
