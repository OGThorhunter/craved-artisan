import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Zap, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  SquareStop, 
  Settings, 
  Target, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Users,
  Mail,
  MessageSquare,
  Calendar,
  Filter,
  Search,
  Eye,
  Copy,
  Download,
  MoreVertical,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  RotateCcw,
  Activity,
  TrendingUp,
  DollarSign
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft' | 'paused';
  trigger: {
    type: 'event' | 'time' | 'condition' | 'webhook';
    event?: string;
    condition?: string;
    schedule?: string;
  };
  conditions: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
    value: string;
  }[];
  actions: {
    type: 'email' | 'sms' | 'task' | 'tag' | 'score' | 'webhook';
    template?: string;
    message?: string;
    task?: string;
    tag?: string;
    score?: number;
    webhook?: string;
  }[];
  metrics: {
    triggered: number;
    completed: number;
    failed: number;
    conversionRate: number;
    revenue: number;
  };
  createdAt: string;
  updatedAt: string;
  lastTriggered?: string;
}

interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'welcome' | 'nurture' | 're_engagement' | 'upsell' | 'retention';
  trigger: any;
  conditions: any[];
  actions: any[];
  isPopular: boolean;
  createdAt: string;
}

interface MarketingAutomationProps {
  rules: AutomationRule[];
  templates: AutomationTemplate[];
  onRuleCreate: (rule: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>) => void;
  onRuleUpdate: (rule: AutomationRule) => void;
  onRuleDelete: (ruleId: string) => void;
  onRuleToggle: (ruleId: string, status: 'active' | 'inactive' | 'paused') => void;
}

const MarketingAutomation: React.FC<MarketingAutomationProps> = ({
  rules,
  templates,
  onRuleCreate,
  onRuleUpdate,
  onRuleDelete,
  onRuleToggle,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<AutomationTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    trigger: '',
  });
  const [viewMode, setViewMode] = useState<'list' | 'workflow'>('list');
  const [showTemplates, setShowTemplates] = useState(false);

  const [newRule, setNewRule] = useState<Partial<AutomationRule>>({
    name: '',
    description: '',
    status: 'draft',
    trigger: {
      type: 'event',
    },
    conditions: [],
    actions: [],
  });

  const queryClient = useQueryClient();

  // Filter rules
  const filteredRules = rules.filter(rule => {
    const matchesSearch = searchTerm === '' || 
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filters.status === '' || rule.status === filters.status;
    const matchesTrigger = filters.trigger === '' || rule.trigger.type === filters.trigger;

    return matchesSearch && matchesStatus && matchesTrigger;
  });

  // Calculate overall metrics
  const overallMetrics = rules.reduce((acc, rule) => {
    acc.triggered += rule.metrics.triggered;
    acc.completed += rule.metrics.completed;
    acc.failed += rule.metrics.failed;
    acc.revenue += rule.metrics.revenue;
    return acc;
  }, {
    triggered: 0,
    completed: 0,
    failed: 0,
    revenue: 0,
  });

  const overallConversionRate = overallMetrics.triggered > 0 ? 
    (overallMetrics.completed / overallMetrics.triggered) * 100 : 0;

  // Handle create rule
  const handleCreate = () => {
    if (!newRule.name || !newRule.description) return;

    const rule: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt' | 'metrics'> = {
      name: newRule.name,
      description: newRule.description,
      status: newRule.status || 'draft',
      trigger: newRule.trigger || { type: 'event' },
      conditions: newRule.conditions || [],
      actions: newRule.actions || [],
    };

    onRuleCreate(rule);
    setIsCreating(false);
    setNewRule({
      name: '',
      description: '',
      status: 'draft',
      trigger: { type: 'event' },
      conditions: [],
      actions: [],
    });
  };

  // Handle update rule
  const handleUpdate = () => {
    if (!editingRule) return;

    const updatedRule = {
      ...editingRule,
      updatedAt: new Date().toISOString(),
    };

    onRuleUpdate(updatedRule);
    setEditingRule(null);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      draft: 'bg-yellow-100 text-yellow-800',
      paused: 'bg-orange-100 text-orange-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  // Get trigger icon
  const getTriggerIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      event: <Activity className="h-4 w-4" />,
      time: <Clock className="h-4 w-4" />,
      condition: <Filter className="h-4 w-4" />,
      webhook: <Zap className="h-4 w-4" />,
    };
    return iconMap[type] || <Activity className="h-4 w-4" />;
  };

  // Get action icon
  const getActionIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      email: <Mail className="h-4 w-4" />,
      sms: <MessageSquare className="h-4 w-4" />,
      task: <Calendar className="h-4 w-4" />,
      tag: <Target className="h-4 w-4" />,
      score: <TrendingUp className="h-4 w-4" />,
      webhook: <Zap className="h-4 w-4" />,
    };
    return iconMap[type] || <Zap className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Marketing Automation</h2>
          <p className="text-gray-600">Create and manage automated marketing workflows</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Copy className="h-4 w-4" />
            <span>Templates</span>
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('workflow')}
              className={`p-2 rounded-lg ${viewMode === 'workflow' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <Zap className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Create Rule</span>
          </button>
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Triggered</p>
              <p className="text-2xl font-bold text-gray-900">{overallMetrics.triggered.toLocaleString()}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{overallMetrics.completed.toLocaleString()}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{overallConversionRate.toFixed(1)}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue Generated</p>
              <p className="text-2xl font-bold text-gray-900">${overallMetrics.revenue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search automation rules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
            </select>
            <select
              value={filters.trigger}
              onChange={(e) => setFilters({ ...filters, trigger: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Triggers</option>
              <option value="event">Event</option>
              <option value="time">Time</option>
              <option value="condition">Condition</option>
              <option value="webhook">Webhook</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rules List/Workflow */}
      {viewMode === 'list' ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trigger
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metrics
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Triggered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                        <div className="text-sm text-gray-500">{rule.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 bg-blue-100 rounded">
                          {getTriggerIcon(rule.trigger.type)}
                        </div>
                        <span className="text-sm text-gray-900">{rule.trigger.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(rule.status)}`}>
                        {rule.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div>Triggered: {rule.metrics.triggered}</div>
                        <div>Completed: {rule.metrics.completed}</div>
                        <div>Rate: {rule.metrics.conversionRate.toFixed(1)}%</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rule.lastTriggered ? 
                        new Date(rule.lastTriggered).toLocaleDateString() : 
                        'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onRuleToggle(rule.id, rule.status === 'active' ? 'paused' : 'active')}
                          className={`${
                            rule.status === 'active' ? 'text-orange-600 hover:text-orange-900' : 
                            'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {rule.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setEditingRule(rule)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onRuleDelete(rule.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRules.map((rule) => (
            <div key={rule.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                    <p className="text-sm text-gray-600">{rule.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(rule.status)}`}>
                    {rule.status}
                  </span>
                  <button
                    onClick={() => onRuleToggle(rule.id, rule.status === 'active' ? 'paused' : 'active')}
                    className={`p-1 rounded ${
                      rule.status === 'active' ? 'text-orange-600 hover:bg-orange-100' : 
                      'text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {rule.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Trigger</h4>
                  <div className="flex items-center space-x-2">
                    <div className="p-1 bg-blue-100 rounded">
                      {getTriggerIcon(rule.trigger.type)}
                    </div>
                    <span className="text-sm text-gray-700">{rule.trigger.type}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Actions</h4>
                  <div className="flex flex-wrap gap-1">
                    {rule.actions.map((action, index) => (
                      <div key={index} className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded text-xs">
                        {getActionIcon(action.type)}
                        <span>{action.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Performance</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Triggered:</span>
                      <span className="font-medium">{rule.metrics.triggered}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed:</span>
                      <span className="font-medium">{rule.metrics.completed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rate:</span>
                      <span className="font-medium">{rule.metrics.conversionRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Last triggered: {rule.lastTriggered ? 
                    new Date(rule.lastTriggered).toLocaleDateString() : 
                    'Never'
                  }
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingRule(rule)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    <Edit className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                    <Eye className="h-3 w-3" />
                    <span>View</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Automation Templates</h3>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      {template.isPopular && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {template.category}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedTemplate(template);
                          setShowTemplates(false);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Use Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(isCreating || editingRule) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {isCreating ? 'Create New Rule' : 'Edit Rule'}
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name *</label>
                  <input
                    type="text"
                    value={isCreating ? newRule.name : editingRule?.name || ''}
                    onChange={(e) => {
                      if (isCreating) {
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={isCreating ? newRule.status : editingRule?.status || 'draft'}
                    onChange={(e) => {
                      if (isCreating) {
                        setNewRule({ ...newRule, status: e.target.value as any });
                      } else if (editingRule) {
                        setEditingRule({ ...editingRule, status: e.target.value as any });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={isCreating ? newRule.description : editingRule?.description || ''}
                  onChange={(e) => {
                    if (isCreating) {
                      setNewRule({ ...newRule, description: e.target.value });
                    } else if (editingRule) {
                      setEditingRule({ ...editingRule, description: e.target.value });
                    }
                  }}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter rule description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trigger Type</label>
                <select
                  value={isCreating ? newRule.trigger?.type : editingRule?.trigger?.type || 'event'}
                  onChange={(e) => {
                    if (isCreating) {
                      setNewRule({ ...newRule, trigger: { ...newRule.trigger, type: e.target.value as any } });
                    } else if (editingRule) {
                      setEditingRule({ ...editingRule, trigger: { ...editingRule.trigger, type: e.target.value as any } });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="event">Event</option>
                  <option value="time">Time</option>
                  <option value="condition">Condition</option>
                  <option value="webhook">Webhook</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="email">Send Email</option>
                      <option value="sms">Send SMS</option>
                      <option value="task">Create Task</option>
                      <option value="tag">Add Tag</option>
                      <option value="score">Update Score</option>
                      <option value="webhook">Call Webhook</option>
                    </select>
                    <button className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Plus className="h-4 w-4" />
                    <span>Add Action</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 p-6 border-t bg-gray-50">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingRule(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={isCreating ? handleCreate : handleUpdate}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Zap className="h-4 w-4" />
                <span>{isCreating ? 'Create Rule' : 'Update Rule'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingAutomation;

