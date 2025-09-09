import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  Percent, 
  User, 
  Building, 
  Tag, 
  Clock, 
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  Download
} from 'lucide-react';

interface Opportunity {
  id: string;
  customerId: string;
  title: string;
  description?: string;
  stage: 'lead' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  value: number;
  probability: number;
  expectedCloseDate: string;
  actualCloseDate?: string;
  source?: string;
  assignedTo?: string;
  tags: string[];
  customFields: Record<string, any>;
  status: 'active' | 'on_hold' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
  };
}

interface OpportunityManagerProps {
  opportunities: Opportunity[];
  onOpportunityCreate: (opportunity: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'lastActivityAt'>) => void;
  onOpportunityUpdate: (opportunity: Opportunity) => void;
  onOpportunityDelete: (opportunityId: string) => void;
}

const OpportunityManager: React.FC<OpportunityManagerProps> = ({
  opportunities,
  onOpportunityCreate,
  onOpportunityUpdate,
  onOpportunityDelete,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    stage: '',
    status: 'active',
    assignedTo: '',
    source: '',
    dateRange: '',
  });
  const [sortBy, setSortBy] = useState<'value' | 'probability' | 'expectedCloseDate' | 'createdAt'>('expectedCloseDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const [newOpportunity, setNewOpportunity] = useState<Partial<Opportunity>>({
    title: '',
    description: '',
    stage: 'lead',
    value: 0,
    probability: 10,
    expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    source: '',
    assignedTo: '',
    tags: [],
    customFields: {},
    status: 'active',
  });

  const queryClient = useQueryClient();

  // Filter and sort opportunities
  const filteredOpportunities = opportunities
    .filter(opportunity => {
      const matchesSearch = searchTerm === '' || 
        opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opportunity.customer?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opportunity.customer?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opportunity.customer?.company?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStage = filters.stage === '' || opportunity.stage === filters.stage;
      const matchesStatus = opportunity.status === filters.status;
      const matchesAssignedTo = filters.assignedTo === '' || opportunity.assignedTo === filters.assignedTo;
      const matchesSource = filters.source === '' || opportunity.source === filters.source;

      return matchesSearch && matchesStage && matchesStatus && matchesAssignedTo && matchesSource;
    })
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Calculate metrics
  const totalValue = filteredOpportunities.reduce((sum, opp) => sum + opp.value, 0);
  const weightedValue = filteredOpportunities.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0);
  const averageValue = filteredOpportunities.length > 0 ? totalValue / filteredOpportunities.length : 0;
  const averageProbability = filteredOpportunities.length > 0 ? 
    filteredOpportunities.reduce((sum, opp) => sum + opp.probability, 0) / filteredOpportunities.length : 0;

  // Stage distribution
  const stageDistribution = filteredOpportunities.reduce((acc, opp) => {
    acc[opp.stage] = (acc[opp.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Handle create opportunity
  const handleCreate = () => {
    if (!newOpportunity.title || !newOpportunity.customerId) return;

    const opportunity: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'lastActivityAt'> = {
      title: newOpportunity.title,
      description: newOpportunity.description,
      stage: newOpportunity.stage || 'lead',
      value: newOpportunity.value || 0,
      probability: newOpportunity.probability || 10,
      expectedCloseDate: newOpportunity.expectedCloseDate || new Date().toISOString(),
      source: newOpportunity.source,
      assignedTo: newOpportunity.assignedTo,
      tags: newOpportunity.tags || [],
      customFields: newOpportunity.customFields || {},
      status: newOpportunity.status || 'active',
      customerId: newOpportunity.customerId,
    };

    onOpportunityCreate(opportunity);
    setIsCreating(false);
    setNewOpportunity({
      title: '',
      description: '',
      stage: 'lead',
      value: 0,
      probability: 10,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      source: '',
      assignedTo: '',
      tags: [],
      customFields: {},
      status: 'active',
    });
  };

  // Handle update opportunity
  const handleUpdate = () => {
    if (!editingOpportunity) return;

    const updatedOpportunity = {
      ...editingOpportunity,
      updatedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    };

    onOpportunityUpdate(updatedOpportunity);
    setEditingOpportunity(null);
  };

  // Get stage color
  const getStageColor = (stage: string) => {
    const colorMap: Record<string, string> = {
      lead: 'bg-gray-100 text-gray-800',
      qualification: 'bg-blue-100 text-blue-800',
      proposal: 'bg-yellow-100 text-yellow-800',
      negotiation: 'bg-orange-100 text-orange-800',
      closed_won: 'bg-green-100 text-green-800',
      closed_lost: 'bg-red-100 text-red-800',
    };
    return colorMap[stage] || 'bg-gray-100 text-gray-800';
  };

  // Get probability color
  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600 bg-green-100';
    if (probability >= 60) return 'text-blue-600 bg-blue-100';
    if (probability >= 40) return 'text-yellow-600 bg-yellow-100';
    if (probability >= 20) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Opportunity Management</h2>
          <p className="text-gray-600">Manage your sales opportunities and deals</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <FileText className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <Target className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Opportunity</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Weighted Value</p>
              <p className="text-2xl font-bold text-gray-900">${weightedValue.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Value</p>
              <p className="text-2xl font-bold text-gray-900">${averageValue.toLocaleString()}</p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Probability</p>
              <p className="text-2xl font-bold text-gray-900">{averageProbability.toFixed(1)}%</p>
            </div>
            <Percent className="h-8 w-8 text-orange-600" />
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
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.stage}
              onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Stages</option>
              <option value="lead">Lead</option>
              <option value="qualification">Qualification</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="closed_won">Closed Won</option>
              <option value="closed_lost">Closed Lost</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="expectedCloseDate">Sort by Close Date</option>
              <option value="value">Sort by Value</option>
              <option value="probability">Sort by Probability</option>
              <option value="createdAt">Sort by Created Date</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Opportunities List/Grid */}
      {viewMode === 'list' ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Opportunity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Probability
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Close Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOpportunities.map((opportunity) => (
                  <tr key={opportunity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{opportunity.title}</div>
                        {opportunity.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {opportunity.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {opportunity.customer ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {opportunity.customer.firstName} {opportunity.customer.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{opportunity.customer.email}</div>
                          {opportunity.customer.company && (
                            <div className="text-sm text-gray-500">{opportunity.customer.company}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No customer</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStageColor(opportunity.stage)}`}>
                        {opportunity.stage.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${opportunity.value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getProbabilityColor(opportunity.probability)}`}>
                        {opportunity.probability}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(opportunity.expectedCloseDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingOpportunity(opportunity)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onOpportunityDelete(opportunity.id)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opportunity) => (
            <div key={opportunity.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{opportunity.title}</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingOpportunity(opportunity)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onOpportunityDelete(opportunity.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {opportunity.customer && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900">
                    {opportunity.customer.firstName} {opportunity.customer.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{opportunity.customer.email}</p>
                  {opportunity.customer.company && (
                    <p className="text-sm text-gray-600">{opportunity.customer.company}</p>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Value:</span>
                  <span className="text-sm font-semibold text-gray-900">${opportunity.value.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Probability:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getProbabilityColor(opportunity.probability)}`}>
                    {opportunity.probability}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Stage:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStageColor(opportunity.stage)}`}>
                    {opportunity.stage.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Close Date:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(opportunity.expectedCloseDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                  <Phone className="h-3 w-3" />
                  <span>Call</span>
                </button>
                <button className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200">
                  <Mail className="h-3 w-3" />
                  <span>Email</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(isCreating || editingOpportunity) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {isCreating ? 'Create New Opportunity' : 'Edit Opportunity'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={isCreating ? newOpportunity.title : editingOpportunity?.title || ''}
                  onChange={(e) => {
                    if (isCreating) {
                      setNewOpportunity({ ...newOpportunity, title: e.target.value });
                    } else if (editingOpportunity) {
                      setEditingOpportunity({ ...editingOpportunity, title: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter opportunity title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={isCreating ? newOpportunity.description : editingOpportunity?.description || ''}
                  onChange={(e) => {
                    if (isCreating) {
                      setNewOpportunity({ ...newOpportunity, description: e.target.value });
                    } else if (editingOpportunity) {
                      setEditingOpportunity({ ...editingOpportunity, description: e.target.value });
                    }
                  }}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter opportunity description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Value *</label>
                  <input
                    type="number"
                    value={isCreating ? newOpportunity.value : editingOpportunity?.value || 0}
                    onChange={(e) => {
                      if (isCreating) {
                        setNewOpportunity({ ...newOpportunity, value: parseFloat(e.target.value) });
                      } else if (editingOpportunity) {
                        setEditingOpportunity({ ...editingOpportunity, value: parseFloat(e.target.value) });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={isCreating ? newOpportunity.probability : editingOpportunity?.probability || 0}
                    onChange={(e) => {
                      if (isCreating) {
                        setNewOpportunity({ ...newOpportunity, probability: parseInt(e.target.value) });
                      } else if (editingOpportunity) {
                        setEditingOpportunity({ ...editingOpportunity, probability: parseInt(e.target.value) });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stage</label>
                  <select
                    value={isCreating ? newOpportunity.stage : editingOpportunity?.stage || 'lead'}
                    onChange={(e) => {
                      if (isCreating) {
                        setNewOpportunity({ ...newOpportunity, stage: e.target.value as any });
                      } else if (editingOpportunity) {
                        setEditingOpportunity({ ...editingOpportunity, stage: e.target.value as any });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="lead">Lead</option>
                    <option value="qualification">Qualification</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closed_won">Closed Won</option>
                    <option value="closed_lost">Closed Lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expected Close Date</label>
                  <input
                    type="date"
                    value={isCreating ? newOpportunity.expectedCloseDate : editingOpportunity?.expectedCloseDate || ''}
                    onChange={(e) => {
                      if (isCreating) {
                        setNewOpportunity({ ...newOpportunity, expectedCloseDate: e.target.value });
                      } else if (editingOpportunity) {
                        setEditingOpportunity({ ...editingOpportunity, expectedCloseDate: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                  <input
                    type="text"
                    value={isCreating ? newOpportunity.source : editingOpportunity?.source || ''}
                    onChange={(e) => {
                      if (isCreating) {
                        setNewOpportunity({ ...newOpportunity, source: e.target.value });
                      } else if (editingOpportunity) {
                        setEditingOpportunity({ ...editingOpportunity, source: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Website, Referral"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                  <input
                    type="text"
                    value={isCreating ? newOpportunity.assignedTo : editingOpportunity?.assignedTo || ''}
                    onChange={(e) => {
                      if (isCreating) {
                        setNewOpportunity({ ...newOpportunity, assignedTo: e.target.value });
                      } else if (editingOpportunity) {
                        setEditingOpportunity({ ...editingOpportunity, assignedTo: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="User ID or name"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 p-6 border-t bg-gray-50">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingOpportunity(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={isCreating ? handleCreate : handleUpdate}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                <span>{isCreating ? 'Create' : 'Update'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunityManager;



