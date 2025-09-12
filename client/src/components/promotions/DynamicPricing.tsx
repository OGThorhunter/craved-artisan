import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
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
  Percent,
  Calendar,
  Users,
  ShoppingCart,
  Star,
  Award,
  Download,
  RefreshCw,
  Filter,
  Search,
  Copy,
  Share2,
  Activity
} from 'lucide-react';

interface PricingRule {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  type: 'demand' | 'time' | 'inventory' | 'customer' | 'competitor';
  conditions: {
    minInventory?: number;
    maxInventory?: number;
    timeRange?: {
      start: string;
      end: string;
    };
    customerSegment?: string;
    competitorPrice?: number;
    demandLevel?: 'low' | 'medium' | 'high';
  };
  pricing: {
    basePrice: number;
    minPrice: number;
    maxPrice: number;
    adjustmentType: 'percentage' | 'fixed';
    adjustmentValue: number;
  };
  products: string[];
  metrics: {
    totalAdjustments: number;
    avgPriceChange: number;
    revenueImpact: number;
    conversionImpact: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface PriceHistory {
  id: string;
  productId: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  change: number;
  changeType: 'increase' | 'decrease';
  reason: string;
  ruleId: string;
  ruleName: string;
  timestamp: string;
  impact: {
    revenue: number;
    orders: number;
    conversion: number;
  };
}

const DynamicPricing: React.FC = () => {
  const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'rules' | 'history' | 'analytics'>('rules');

  // Mock data
  const pricingRules: PricingRule[] = [
    {
      id: '1',
      name: 'Inventory-Based Pricing',
      description: 'Reduce prices when inventory is high, increase when low',
      status: 'active',
      type: 'inventory',
      conditions: {
        minInventory: 50,
        maxInventory: 200,
        demandLevel: 'medium'
      },
      pricing: {
        basePrice: 25.99,
        minPrice: 19.99,
        maxPrice: 35.99,
        adjustmentType: 'percentage',
        adjustmentValue: 15
      },
      products: ['product-1', 'product-2', 'product-3'],
      metrics: {
        totalAdjustments: 45,
        avgPriceChange: 8.5,
        revenueImpact: 1250,
        conversionImpact: 12.3
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2025-01-20T00:00:00Z'
    },
    {
      id: '2',
      name: 'Time-Based Pricing',
      description: 'Higher prices during peak hours, lower during off-peak',
      status: 'active',
      type: 'time',
      conditions: {
        timeRange: {
          start: '09:00',
          end: '17:00'
        },
        demandLevel: 'high'
      },
      pricing: {
        basePrice: 15.99,
        minPrice: 12.99,
        maxPrice: 19.99,
        adjustmentType: 'percentage',
        adjustmentValue: 20
      },
      products: ['product-4', 'product-5'],
      metrics: {
        totalAdjustments: 32,
        avgPriceChange: 12.2,
        revenueImpact: 890,
        conversionImpact: 8.7
      },
      createdAt: '2024-02-15T00:00:00Z',
      updatedAt: '2025-01-18T00:00:00Z'
    },
    {
      id: '3',
      name: 'Customer Segment Pricing',
      description: 'VIP customers get better prices, new customers get introductory rates',
      status: 'paused',
      type: 'customer',
      conditions: {
        customerSegment: 'vip'
      },
      pricing: {
        basePrice: 29.99,
        minPrice: 24.99,
        maxPrice: 34.99,
        adjustmentType: 'percentage',
        adjustmentValue: 10
      },
      products: ['product-6', 'product-7', 'product-8'],
      metrics: {
        totalAdjustments: 18,
        avgPriceChange: 5.5,
        revenueImpact: 450,
        conversionImpact: 15.2
      },
      createdAt: '2024-03-01T00:00:00Z',
      updatedAt: '2025-01-10T00:00:00Z'
    }
  ];

  const priceHistory: PriceHistory[] = [
    {
      id: '1',
      productId: 'product-1',
      productName: 'Artisan Chocolate Cake',
      oldPrice: 25.99,
      newPrice: 22.99,
      change: -3.00,
      changeType: 'decrease',
      reason: 'High inventory levels detected',
      ruleId: '1',
      ruleName: 'Inventory-Based Pricing',
      timestamp: '2025-01-20T10:30:00Z',
      impact: {
        revenue: 150,
        orders: 8,
        conversion: 5.2
      }
    },
    {
      id: '2',
      productId: 'product-2',
      productName: 'Vanilla Cupcakes (6-pack)',
      oldPrice: 15.99,
      newPrice: 18.99,
      change: 3.00,
      changeType: 'increase',
      reason: 'Peak hours pricing applied',
      ruleId: '2',
      ruleName: 'Time-Based Pricing',
      timestamp: '2025-01-20T14:15:00Z',
      impact: {
        revenue: 75,
        orders: 4,
        conversion: -2.1
      }
    },
    {
      id: '3',
      productId: 'product-3',
      productName: 'Red Velvet Cookies',
      oldPrice: 12.99,
      newPrice: 11.99,
      change: -1.00,
      changeType: 'decrease',
      reason: 'Low demand detected',
      ruleId: '1',
      ruleName: 'Inventory-Based Pricing',
      timestamp: '2025-01-19T16:45:00Z',
      impact: {
        revenue: 25,
        orders: 3,
        conversion: 3.8
      }
    }
  ];

  const filteredRules = pricingRules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || rule.status === filterStatus;
    const matchesType = filterType === 'all' || rule.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
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
      case 'demand': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'time': return <Clock className="h-4 w-4 text-purple-500" />;
      case 'inventory': return <ShoppingCart className="h-4 w-4 text-green-500" />;
      case 'customer': return <Users className="h-4 w-4 text-orange-500" />;
      case 'competitor': return <Target className="h-4 w-4 text-red-500" />;
      default: return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'demand': return 'bg-blue-100 text-blue-800';
      case 'time': return 'bg-purple-100 text-purple-800';
      case 'inventory': return 'bg-green-100 text-green-800';
      case 'customer': return 'bg-orange-100 text-orange-800';
      case 'competitor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decrease': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase': return 'text-red-600';
      case 'decrease': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dynamic Pricing</h2>
          <p className="text-gray-600 mt-1">Automated pricing rules based on demand, inventory, and market conditions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => console.log('Export pricing data')}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            title="Export pricing data"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Create new pricing rule"
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
              { value: 'rules', label: 'Pricing Rules', icon: Settings },
              { value: 'history', label: 'Price History', icon: Clock },
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
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Rules</p>
              <p className="text-2xl font-bold text-gray-900">
                {pricingRules.filter(r => r.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Adjustments</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(pricingRules.reduce((sum, r) => sum + r.metrics.totalAdjustments, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenue Impact</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(pricingRules.reduce((sum, r) => sum + r.metrics.revenueImpact, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Price Change</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(pricingRules.reduce((sum, r) => sum + r.metrics.avgPriceChange, 0) / pricingRules.length)}
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
                  <option value="demand">Demand</option>
                  <option value="time">Time</option>
                  <option value="inventory">Inventory</option>
                  <option value="customer">Customer</option>
                  <option value="competitor">Competitor</option>
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

                      {/* Rule Conditions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Base Price:</span>
                          <span className="ml-1 text-sm text-gray-900">{formatCurrency(rule.pricing.basePrice)}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Price Range:</span>
                          <span className="ml-1 text-sm text-gray-900">
                            {formatCurrency(rule.pricing.minPrice)} - {formatCurrency(rule.pricing.maxPrice)}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Adjustment:</span>
                          <span className="ml-1 text-sm text-gray-900">
                            {rule.pricing.adjustmentType === 'percentage' ? `${rule.pricing.adjustmentValue}%` : `$${rule.pricing.adjustmentValue}`}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Products:</span>
                          <span className="ml-1 text-sm text-gray-900">{rule.products.length} products</span>
                        </div>
                      </div>

                      {/* Rule Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Adjustments:</span>
                          <span className="ml-1 text-sm font-semibold text-gray-900">{formatNumber(rule.metrics.totalAdjustments)}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Avg. Change:</span>
                          <span className="ml-1 text-sm font-semibold text-gray-900">{formatPercentage(rule.metrics.avgPriceChange)}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Revenue Impact:</span>
                          <span className="ml-1 text-sm font-semibold text-gray-900">{formatCurrency(rule.metrics.revenueImpact)}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Conversion Impact:</span>
                          <span className="ml-1 text-sm font-semibold text-gray-900">{formatPercentage(rule.metrics.conversionImpact)}</span>
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

      {viewMode === 'history' && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Price Change History</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {priceHistory.map((change) => (
                <div key={change.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getChangeIcon(change.changeType)}
                      <span className={`text-sm font-medium ${getChangeColor(change.changeType)}`}>
                        {change.changeType === 'increase' ? '+' : ''}{formatCurrency(change.change)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{change.productName}</p>
                      <p className="text-xs text-gray-500">{change.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(change.oldPrice)} → {formatCurrency(change.newPrice)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(change.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Revenue: {formatCurrency(change.impact.revenue)}</p>
                      <p className="text-xs text-gray-500">Orders: {change.impact.orders}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
                {pricingRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(rule.type)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{rule.name}</p>
                        <p className="text-xs text-gray-500">{rule.type} pricing</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatNumber(rule.metrics.totalAdjustments)}</p>
                      <p className="text-xs text-gray-500">adjustments</p>
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
                {pricingRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{rule.name}</p>
                        <p className="text-xs text-gray-500">{formatPercentage(rule.metrics.conversionImpact)} conversion impact</p>
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
          <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pricing rules found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all' || filterType !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first pricing rule.'}
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

export default DynamicPricing;
