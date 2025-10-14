import React, { useState, useEffect } from 'react';
import {
  TestTube,
  TrendingUp,
  Users,
  DollarSign,
  Percent,
  Target,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Settings
} from 'lucide-react';

// Future Enhancement: Advanced A/B Testing Capabilities
interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  variants: ABVariant[];
  trafficSplit: number[]; // Percentage for each variant
  metrics: {
    participants: number;
    conversions: number;
    revenue: number;
    confidenceLevel: number;
    significance: number;
  };
  duration: {
    startDate: string;
    endDate: string;
    plannedDuration: number; // days
  };
  targeting: {
    audience: string[];
    conditions: any[];
  };
  createdAt: string;
  updatedAt: string;
}

interface ABVariant {
  id: string;
  name: string;
  description: string;
  type: 'discount' | 'messaging' | 'design' | 'timing';
  configuration: any;
  performance: {
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
    revenuePerVisitor: number;
  };
  isControl: boolean;
}

interface AdvancedABTestingProps {
  vendorId: string;
}

const AdvancedABTesting: React.FC<AdvancedABTestingProps> = ({ vendorId }) => {
  const [abTests, setABTests] = useState<ABTest[]>([]);
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [activeTab, setActiveTab] = useState<'running' | 'completed' | 'draft'>('running');

  // Mock data for demonstration
  useEffect(() => {
    const mockTests: ABTest[] = [
      {
        id: 'test_1',
        name: 'Holiday Discount Messaging',
        description: 'Testing different discount percentages and messaging for holiday campaign',
        status: 'running',
        variants: [
          {
            id: 'variant_1_control',
            name: 'Control - 15% Off',
            description: 'Standard 15% discount with regular messaging',
            type: 'discount',
            configuration: { discountPercent: 15, message: 'Save 15% on all items!' },
            performance: {
              views: 1250,
              clicks: 187,
              conversions: 23,
              revenue: 1450.00,
              conversionRate: 12.3,
              revenuePerVisitor: 1.16
            },
            isControl: true
          },
          {
            id: 'variant_1_test',
            name: 'Test - 20% Off + Urgency',
            description: '20% discount with urgency messaging',
            type: 'discount',
            configuration: { discountPercent: 20, message: 'Limited Time: Save 20%!' },
            performance: {
              views: 1280,
              clicks: 245,
              conversions: 34,
              revenue: 2125.00,
              conversionRate: 13.9,
              revenuePerVisitor: 1.66
            },
            isControl: false
          }
        ],
        trafficSplit: [50, 50],
        metrics: {
          participants: 2530,
          conversions: 57,
          revenue: 3575.00,
          confidenceLevel: 0.87,
          significance: 0.032
        },
        duration: {
          startDate: '2025-10-10',
          endDate: '2025-10-24',
          plannedDuration: 14
        },
        targeting: {
          audience: ['returning_customers', 'high_value_customers'],
          conditions: []
        },
        createdAt: '2025-10-10T00:00:00Z',
        updatedAt: '2025-10-14T12:30:00Z'
      },
      {
        id: 'test_2',
        name: 'Email Subject Line Test',
        description: 'Testing personalized vs. generic email subject lines',
        status: 'completed',
        variants: [
          {
            id: 'variant_2_control',
            name: 'Generic Subject',
            description: 'Standard promotional subject line',
            type: 'messaging',
            configuration: { subject: 'New Products Available!' },
            performance: {
              views: 5420,
              clicks: 324,
              conversions: 48,
              revenue: 2880.00,
              conversionRate: 14.8,
              revenuePerVisitor: 0.53
            },
            isControl: true
          },
          {
            id: 'variant_2_test',
            name: 'Personalized Subject',
            description: 'Personalized subject with customer name',
            type: 'messaging',
            configuration: { subject: '{name}, New Products Just for You!' },
            performance: {
              views: 5385,
              clicks: 487,
              conversions: 73,
              revenue: 4380.00,
              conversionRate: 15.0,
              revenuePerVisitor: 0.81
            },
            isControl: false
          }
        ],
        trafficSplit: [50, 50],
        metrics: {
          participants: 10805,
          conversions: 121,
          revenue: 7260.00,
          confidenceLevel: 0.95,
          significance: 0.001
        },
        duration: {
          startDate: '2025-09-15',
          endDate: '2025-09-29',
          plannedDuration: 14
        },
        targeting: {
          audience: ['email_subscribers'],
          conditions: []
        },
        createdAt: '2025-09-15T00:00:00Z',
        updatedAt: '2025-09-29T23:59:59Z'
      }
    ];
    
    setABTests(mockTests);
  }, []);

  // Test creation form state
  const [testForm, setTestForm] = useState({
    name: '',
    description: '',
    type: 'discount' as 'discount' | 'messaging' | 'design' | 'timing',
    variants: [
      {
        name: 'Control',
        description: '',
        configuration: {},
        isControl: true
      },
      {
        name: 'Variant A',
        description: '',
        configuration: {},
        isControl: false
      }
    ],
    trafficSplit: [50, 50],
    duration: 14,
    audience: [] as string[],
    successMetric: 'conversion_rate' as 'conversion_rate' | 'revenue' | 'clicks'
  });

  const getTestStatusColor = (status: ABTest['status']) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSignificanceColor = (significance: number) => {
    if (significance < 0.05) return 'text-green-600';
    if (significance < 0.1) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const calculateLift = (testVariant: ABVariant, controlVariant: ABVariant, metric: string) => {
    const testValue = testVariant.performance[metric as keyof typeof testVariant.performance] as number;
    const controlValue = controlVariant.performance[metric as keyof typeof controlVariant.performance] as number;
    
    if (controlValue === 0) return 0;
    return ((testValue - controlValue) / controlValue) * 100;
  };

  const pauseTest = (testId: string) => {
    setABTests(prev => 
      prev.map(test => 
        test.id === testId 
          ? { ...test, status: test.status === 'running' ? 'paused' : 'running' }
          : test
      )
    );
  };

  const stopTest = (testId: string) => {
    setABTests(prev => 
      prev.map(test => 
        test.id === testId 
          ? { ...test, status: 'completed', duration: { ...test.duration, endDate: new Date().toISOString().split('T')[0] } }
          : test
      )
    );
  };

  const filteredTests = abTests.filter(test => test.status === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Advanced A/B Testing</h2>
            <p className="text-gray-600">Optimize your promotions with data-driven testing</p>
          </div>
          <button
            onClick={() => setIsCreatingTest(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <TestTube className="w-4 h-4" />
            <span>Create A/B Test</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {(['running', 'completed', 'draft'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Tests
              <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                {abTests.filter(test => test.status === tab).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tests List */}
      <div className="space-y-4">
        {filteredTests.map((test) => {
          const controlVariant = test.variants.find(v => v.isControl);
          const testVariant = test.variants.find(v => !v.isControl);
          
          return (
            <div key={test.id} className="bg-white rounded-lg shadow-lg p-6">
              {/* Test Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{test.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTestStatusColor(test.status)}`}>
                      {test.status.toUpperCase()}
                    </span>
                    {test.metrics.significance < 0.05 && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Significant
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{test.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{test.metrics.participants.toLocaleString()} participants</span>
                    <span>Confidence: {Math.round(test.metrics.confidenceLevel * 100)}%</span>
                    <span className={getSignificanceColor(test.metrics.significance)}>
                      p-value: {test.metrics.significance.toFixed(3)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {test.status === 'running' && (
                    <>
                      <button
                        onClick={() => pauseTest(test.id)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                        title="Pause Test"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => stopTest(test.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Stop Test"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {test.status === 'paused' && (
                    <button
                      onClick={() => pauseTest(test.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Resume Test"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedTest(test)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                    title="View Details"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Variants Comparison */}
              {controlVariant && testVariant && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Control Variant */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <h4 className="font-medium text-gray-900">{controlVariant.name}</h4>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Control</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Conversion Rate</p>
                        <p className="font-semibold">{controlVariant.performance.conversionRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Revenue</p>
                        <p className="font-semibold">${controlVariant.performance.revenue.toFixed(0)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">RPV</p>
                        <p className="font-semibold">${controlVariant.performance.revenuePerVisitor.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Test Variant */}
                  <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <h4 className="font-medium text-gray-900">{testVariant.name}</h4>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Variant</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Conversion Rate</p>
                        <div className="flex items-center space-x-1">
                          <p className="font-semibold">{testVariant.performance.conversionRate.toFixed(1)}%</p>
                          <span className={`text-xs ${
                            calculateLift(testVariant, controlVariant, 'conversionRate') > 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            ({calculateLift(testVariant, controlVariant, 'conversionRate').toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600">Revenue</p>
                        <div className="flex items-center space-x-1">
                          <p className="font-semibold">${testVariant.performance.revenue.toFixed(0)}</p>
                          <span className={`text-xs ${
                            calculateLift(testVariant, controlVariant, 'revenue') > 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            ({calculateLift(testVariant, controlVariant, 'revenue').toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600">RPV</p>
                        <div className="flex items-center space-x-1">
                          <p className="font-semibold">${testVariant.performance.revenuePerVisitor.toFixed(2)}</p>
                          <span className={`text-xs ${
                            calculateLift(testVariant, controlVariant, 'revenuePerVisitor') > 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            ({calculateLift(testVariant, controlVariant, 'revenuePerVisitor').toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Test Progress */}
              {test.status === 'running' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        Day {Math.ceil((Date.now() - new Date(test.duration.startDate).getTime()) / (1000 * 60 * 60 * 24))} of {test.duration.plannedDuration}
                      </span>
                    </div>
                    <div className="text-gray-600">
                      Ends: {new Date(test.duration.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredTests.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} tests</h3>
          <p className="text-gray-600 mb-4">
            {activeTab === 'running' && "You don't have any running tests. Create one to start optimizing your promotions."}
            {activeTab === 'completed' && "No completed tests yet. Your finished tests will appear here."}
            {activeTab === 'draft' && "No draft tests. Save a test as draft to continue working on it later."}
          </p>
          <button
            onClick={() => setIsCreatingTest(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Create Your First A/B Test
          </button>
        </div>
      )}
    </div>
  );
};

export default AdvancedABTesting;
