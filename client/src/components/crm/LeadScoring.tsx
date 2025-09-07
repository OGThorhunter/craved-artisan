import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Target, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  Star,
  AlertCircle,
  CheckCircle,
  Edit,
  Save,
  X,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: 'lead' | 'prospect' | 'customer' | 'vip' | 'inactive';
  source: string;
  tags: string[];
  totalOrders: number;
  totalSpent: number;
  lifetimeValue: number;
  leadScore: number;
  isVip: boolean;
  createdAt: string;
  lastContactAt?: string;
  assignedTo?: string;
}

interface ScoringRule {
  id: string;
  name: string;
  description: string;
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'not_equals';
  value: any;
  points: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LeadScoringProps {
  customers: Customer[];
  onScoreUpdate: (customerId: string, newScore: number) => void;
}

const LeadScoring: React.FC<LeadScoringProps> = ({ customers, onScoreUpdate }) => {
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>([]);
  const [isEditingRules, setIsEditingRules] = useState(false);
  const [editingRule, setEditingRule] = useState<ScoringRule | null>(null);
  const [newRule, setNewRule] = useState<Partial<ScoringRule>>({
    name: '',
    description: '',
    field: 'totalSpent',
    operator: 'greater_than',
    value: 0,
    points: 10,
    isActive: true,
  });
  const [scoreDistribution, setScoreDistribution] = useState<Record<string, number>>({});

  const queryClient = useQueryClient();

  // Load scoring rules from localStorage
  useEffect(() => {
    const savedRules = localStorage.getItem('crm-scoring-rules');
    if (savedRules) {
      setScoringRules(JSON.parse(savedRules));
    } else {
      // Initialize with default rules
      const defaultRules: ScoringRule[] = [
        {
          id: 'rule_1',
          name: 'High Value Customer',
          description: 'Customer has spent over $5,000',
          field: 'totalSpent',
          operator: 'greater_than',
          value: 5000,
          points: 25,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'rule_2',
          name: 'Frequent Buyer',
          description: 'Customer has made 5+ orders',
          field: 'totalOrders',
          operator: 'greater_than',
          value: 5,
          points: 20,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'rule_3',
          name: 'VIP Status',
          description: 'Customer is marked as VIP',
          field: 'isVip',
          operator: 'equals',
          value: true,
          points: 30,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'rule_4',
          name: 'Recent Activity',
          description: 'Customer contacted in last 7 days',
          field: 'lastContactAt',
          operator: 'greater_than',
          value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          points: 15,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'rule_5',
          name: 'Email Subscriber',
          description: 'Customer has email tag',
          field: 'tags',
          operator: 'contains',
          value: 'email',
          points: 10,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'rule_6',
          name: 'Inactive Customer',
          description: 'Customer has not been contacted in 30+ days',
          field: 'lastContactAt',
          operator: 'less_than',
          value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          points: -10,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setScoringRules(defaultRules);
      localStorage.setItem('crm-scoring-rules', JSON.stringify(defaultRules));
    }
  }, []);

  // Calculate lead score for a customer
  const calculateLeadScore = (customer: Customer): number => {
    let score = 0;
    
    scoringRules.forEach(rule => {
      if (!rule.isActive) return;
      
      const fieldValue = customer[rule.field as keyof Customer];
      
      switch (rule.operator) {
        case 'equals':
          if (fieldValue === rule.value) score += rule.points;
          break;
        case 'greater_than':
          if (typeof fieldValue === 'number' && fieldValue > rule.value) score += rule.points;
          if (typeof fieldValue === 'string' && new Date(fieldValue) > new Date(rule.value)) score += rule.points;
          break;
        case 'less_than':
          if (typeof fieldValue === 'number' && fieldValue < rule.value) score += rule.points;
          if (typeof fieldValue === 'string' && new Date(fieldValue) < new Date(rule.value)) score += rule.points;
          break;
        case 'contains':
          if (Array.isArray(fieldValue) && fieldValue.includes(rule.value)) score += rule.points;
          break;
        case 'not_equals':
          if (fieldValue !== rule.value) score += rule.points;
          break;
      }
    });
    
    return Math.max(0, Math.min(100, score));
  };

  // Calculate score distribution
  useEffect(() => {
    const distribution: Record<string, number> = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0,
    };
    
    customers.forEach(customer => {
      const score = calculateLeadScore(customer);
      if (score <= 20) distribution['0-20']++;
      else if (score <= 40) distribution['21-40']++;
      else if (score <= 60) distribution['41-60']++;
      else if (score <= 80) distribution['61-80']++;
      else distribution['81-100']++;
    });
    
    setScoreDistribution(distribution);
  }, [customers, scoringRules]);

  // Save scoring rules
  const saveScoringRules = (rules: ScoringRule[]) => {
    setScoringRules(rules);
    localStorage.setItem('crm-scoring-rules', JSON.stringify(rules));
  };

  // Add new rule
  const handleAddRule = () => {
    if (!newRule.name) return;
    
    const rule: ScoringRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newRule.name,
      description: newRule.description || '',
      field: newRule.field || 'totalSpent',
      operator: newRule.operator || 'greater_than',
      value: newRule.value || 0,
      points: newRule.points || 10,
      isActive: newRule.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const newRules = [...scoringRules, rule];
    saveScoringRules(newRules);
    setNewRule({
      name: '',
      description: '',
      field: 'totalSpent',
      operator: 'greater_than',
      value: 0,
      points: 10,
      isActive: true,
    });
  };

  // Update existing rule
  const handleUpdateRule = () => {
    if (!editingRule) return;
    
    const updatedRule = {
      ...editingRule,
      updatedAt: new Date().toISOString(),
    };
    
    const newRules = scoringRules.map(rule => 
      rule.id === editingRule.id ? updatedRule : rule
    );
    saveScoringRules(newRules);
    setEditingRule(null);
  };

  // Delete rule
  const handleDeleteRule = (ruleId: string) => {
    const newRules = scoringRules.filter(rule => rule.id !== ruleId);
    saveScoringRules(newRules);
  };

  // Toggle rule active status
  const handleToggleRule = (ruleId: string) => {
    const newRules = scoringRules.map(rule => 
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive, updatedAt: new Date().toISOString() } : rule
    );
    saveScoringRules(newRules);
  };

  // Get score color
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    if (score >= 20) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  // Get score label
  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Hot Lead';
    if (score >= 60) return 'Warm Lead';
    if (score >= 40) return 'Cool Lead';
    if (score >= 20) return 'Cold Lead';
    return 'Inactive';
  };

  const highValueLeads = customers
    .map(customer => ({ ...customer, calculatedScore: calculateLeadScore(customer) }))
    .filter(customer => customer.calculatedScore >= 70)
    .sort((a, b) => b.calculatedScore - a.calculatedScore)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lead Scoring</h2>
          <p className="text-gray-600">Automatically score leads based on behavior and attributes</p>
        </div>
        <button
          onClick={() => setIsEditingRules(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Edit className="h-4 w-4" />
          <span>Manage Rules</span>
        </button>
      </div>

      {/* Score Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(scoreDistribution).map(([range, count]) => (
          <div key={range} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{count}</div>
            <div className="text-sm text-gray-600">{range} Score</div>
            <div className="text-xs text-gray-500">
              {customers.length > 0 ? Math.round((count / customers.length) * 100) : 0}%
            </div>
          </div>
        ))}
      </div>

      {/* High Value Leads */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Leads (Score ≥ 70)</h3>
        <div className="space-y-3">
          {highValueLeads.map((customer) => (
            <div key={customer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">
                    {customer.firstName[0]}{customer.lastName[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {customer.firstName} {customer.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{customer.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Lifetime Value</p>
                  <p className="font-semibold text-gray-900">${customer.lifetimeValue.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Orders</p>
                  <p className="font-semibold text-gray-900">{customer.totalOrders}</p>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(customer.calculatedScore)}`}>
                    {customer.calculatedScore}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{getScoreLabel(customer.calculatedScore)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scoring Rules */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Scoring Rules</h3>
        <div className="space-y-3">
          {scoringRules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-gray-900">{rule.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {rule.field} {rule.operator} {rule.value} → {rule.points > 0 ? '+' : ''}{rule.points} points
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleRule(rule.id)}
                  className={`p-2 rounded-lg ${
                    rule.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {rule.isActive ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setEditingRule(rule)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Rule Modal */}
      {(isEditingRules || editingRule) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditingRules ? 'Add New Rule' : 'Edit Rule'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name</label>
                <input
                  type="text"
                  value={isEditingRules ? newRule.name : editingRule?.name || ''}
                  onChange={(e) => {
                    if (isEditingRules) {
                      setNewRule({ ...newRule, name: e.target.value });
                    } else if (editingRule) {
                      setEditingRule({ ...editingRule, name: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter rule name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={isEditingRules ? newRule.description : editingRule?.description || ''}
                  onChange={(e) => {
                    if (isEditingRules) {
                      setNewRule({ ...newRule, description: e.target.value });
                    } else if (editingRule) {
                      setEditingRule({ ...editingRule, description: e.target.value });
                    }
                  }}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter rule description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Field</label>
                  <select
                    value={isEditingRules ? newRule.field : editingRule?.field || 'totalSpent'}
                    onChange={(e) => {
                      if (isEditingRules) {
                        setNewRule({ ...newRule, field: e.target.value });
                      } else if (editingRule) {
                        setEditingRule({ ...editingRule, field: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="totalSpent">Total Spent</option>
                    <option value="totalOrders">Total Orders</option>
                    <option value="isVip">VIP Status</option>
                    <option value="lastContactAt">Last Contact</option>
                    <option value="tags">Tags</option>
                    <option value="status">Status</option>
                    <option value="source">Source</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Operator</label>
                  <select
                    value={isEditingRules ? newRule.operator : editingRule?.operator || 'greater_than'}
                    onChange={(e) => {
                      if (isEditingRules) {
                        setNewRule({ ...newRule, operator: e.target.value as any });
                      } else if (editingRule) {
                        setEditingRule({ ...editingRule, operator: e.target.value as any });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="equals">Equals</option>
                    <option value="greater_than">Greater Than</option>
                    <option value="less_than">Less Than</option>
                    <option value="contains">Contains</option>
                    <option value="not_equals">Not Equals</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                  <input
                    type="text"
                    value={isEditingRules ? newRule.value : editingRule?.value || ''}
                    onChange={(e) => {
                      if (isEditingRules) {
                        setNewRule({ ...newRule, value: e.target.value });
                      } else if (editingRule) {
                        setEditingRule({ ...editingRule, value: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter value"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
                  <input
                    type="number"
                    value={isEditingRules ? newRule.points : editingRule?.points || 10}
                    onChange={(e) => {
                      if (isEditingRules) {
                        setNewRule({ ...newRule, points: parseInt(e.target.value) });
                      } else if (editingRule) {
                        setEditingRule({ ...editingRule, points: parseInt(e.target.value) });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter points"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 p-6 border-t bg-gray-50">
              <button
                onClick={() => {
                  setIsEditingRules(false);
                  setEditingRule(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={isEditingRules ? handleAddRule : handleUpdateRule}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                <span>{isEditingRules ? 'Add Rule' : 'Update Rule'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadScoring;


