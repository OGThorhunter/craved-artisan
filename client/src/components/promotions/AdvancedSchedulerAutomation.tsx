import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Repeat, 
  Target, 
  TrendingUp, 
  Zap,
  Play,
  Pause,
  Settings,
  BarChart3,
  Users,
  DollarSign
} from 'lucide-react';

// Future Enhancement: Advanced Scheduler Automation Features
interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'time' | 'event' | 'condition';
    value: any;
  };
  action: {
    type: 'create_campaign' | 'adjust_pricing' | 'send_notification' | 'update_inventory';
    parameters: any;
  };
  conditions: Array<{
    field: string;
    operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
    value: any;
  }>;
  isActive: boolean;
  createdAt: string;
  lastRun?: string;
  nextRun?: string;
}

interface AdvancedSchedulerProps {
  vendorId: string;
}

const AdvancedSchedulerAutomation: React.FC<AdvancedSchedulerProps> = ({ vendorId }) => {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);

  // Future Enhancement: Machine Learning Recommendations for Automation
  const [mlRecommendations, setMLRecommendations] = useState([
    {
      id: 'rec_1',
      type: 'seasonal_promotion',
      title: 'Create Holiday Promotion',
      description: 'Based on historical data, create a 15% discount campaign 2 weeks before major holidays',
      confidence: 0.87,
      potentialImpact: '+23% revenue increase',
      automationTemplate: {
        trigger: { type: 'time', value: 'holiday_minus_14_days' },
        action: { 
          type: 'create_campaign',
          parameters: {
            discountPercent: 15,
            duration: '7 days',
            targetAudience: 'returning_customers'
          }
        }
      }
    },
    {
      id: 'rec_2', 
      type: 'inventory_optimization',
      title: 'Low Stock Auto-Promotion',
      description: 'Automatically create flash sales when inventory levels drop below 20%',
      confidence: 0.92,
      potentialImpact: '-15% inventory waste',
      automationTemplate: {
        trigger: { type: 'condition', value: 'inventory_level < 20%' },
        action: {
          type: 'create_campaign',
          parameters: {
            discountPercent: 25,
            duration: '3 days',
            urgencyMessaging: true
          }
        }
      }
    },
    {
      id: 'rec_3',
      type: 'customer_retention',
      title: 'Win-Back Campaign Automation',
      description: 'Send personalized offers to customers who haven\'t purchased in 30+ days',
      confidence: 0.79,
      potentialImpact: '+12% customer reactivation',
      automationTemplate: {
        trigger: { type: 'condition', value: 'days_since_last_purchase > 30' },
        action: {
          type: 'send_notification',
          parameters: {
            offerType: 'personalized_discount',
            discountPercent: 20,
            personalizedProducts: true
          }
        }
      }
    }
  ]);

  // Advanced automation rule creation form
  const [ruleForm, setRuleForm] = useState({
    name: '',
    description: '',
    trigger: {
      type: 'time' as 'time' | 'event' | 'condition',
      value: ''
    },
    action: {
      type: 'create_campaign' as 'create_campaign' | 'adjust_pricing' | 'send_notification' | 'update_inventory',
      parameters: {}
    },
    conditions: [] as Array<{
      field: string;
      operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
      value: any;
    }>,
    isActive: true
  });

  // Future Enhancement: Real-time automation monitoring
  const [automationStats, setAutomationStats] = useState({
    totalRules: 12,
    activeRules: 8,
    runsToday: 45,
    averagePerformance: 0.84,
    revenueGenerated: 2450.00,
    costsAutomated: 1200.00
  });

  const createAutomationFromTemplate = (recommendation: any) => {
    const newRule: AutomationRule = {
      id: `rule_${Date.now()}`,
      name: recommendation.title,
      description: recommendation.description,
      trigger: recommendation.automationTemplate.trigger,
      action: recommendation.automationTemplate.action,
      conditions: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      nextRun: calculateNextRun(recommendation.automationTemplate.trigger)
    };

    setAutomationRules(prev => [...prev, newRule]);
    
    // Show success notification
    console.log(`Created automation rule: ${newRule.name}`);
  };

  const calculateNextRun = (trigger: any): string => {
    // Logic to calculate next run time based on trigger type
    const now = new Date();
    switch (trigger.type) {
      case 'time':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow
      case 'condition':
        return 'When conditions are met';
      case 'event':
        return 'When event occurs';
      default:
        return 'Not scheduled';
    }
  };

  const toggleRuleStatus = (ruleId: string) => {
    setAutomationRules(prev =>
      prev.map(rule =>
        rule.id === ruleId
          ? { ...rule, isActive: !rule.isActive }
          : rule
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Advanced Automation</h2>
            <p className="text-gray-600">Intelligent promotion scheduling and optimization</p>
          </div>
          <button
            onClick={() => setIsCreatingRule(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>Create Rule</span>
          </button>
        </div>

        {/* Automation Performance Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Active Rules</p>
                <p className="text-xl font-bold text-blue-600">{automationStats.activeRules}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Play className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Runs Today</p>
                <p className="text-xl font-bold text-green-600">{automationStats.runsToday}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Performance</p>
                <p className="text-xl font-bold text-purple-600">{Math.round(automationStats.averagePerformance * 100)}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-emerald-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-sm text-gray-600">Revenue Generated</p>
                <p className="text-xl font-bold text-emerald-600">${automationStats.revenueGenerated.toFixed(0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ML Recommendations */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
        </div>
        
        <div className="grid gap-4">
          {mlRecommendations.map((rec) => (
            <div key={rec.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                      {Math.round(rec.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{rec.description}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-green-600 font-medium">{rec.potentialImpact}</span>
                    <span className="text-gray-500">Based on ML analysis</span>
                  </div>
                </div>
                <button
                  onClick={() => createAutomationFromTemplate(rec)}
                  className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 text-sm"
                >
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Existing Automation Rules */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Automation Rules</h3>
        
        <div className="space-y-3">
          {automationRules.map((rule) => (
            <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900">{rule.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      rule.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {rule.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{rule.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Trigger: {rule.trigger.type}</span>
                    <span>Action: {rule.action.type}</span>
                    {rule.nextRun && <span>Next: {new Date(rule.nextRun).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleRuleStatus(rule.id)}
                    className={`p-2 rounded-lg ${
                      rule.isActive 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {rule.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setSelectedRule(rule)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                    title="Edit rule settings"
                    aria-label="Edit rule settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvancedSchedulerAutomation;
