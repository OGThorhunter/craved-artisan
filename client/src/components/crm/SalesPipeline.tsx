import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Target, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  User, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Filter,
  Search,
  MoreVertical,
  Star,
  Phone,
  Mail,
  MessageSquare
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

interface PipelineStage {
  id: string;
  name: string;
  description: string;
  color: string;
  order: number;
  opportunities: Opportunity[];
  totalValue: number;
  weightedValue: number;
  count: number;
}

interface SalesPipelineProps {
  opportunities: Opportunity[];
  onOpportunityCreate?: (opportunity: Opportunity) => void;
  onOpportunityUpdate: (opportunity: Opportunity) => void;
  onOpportunityDelete: (opportunityId: string) => void;
}

const SalesPipeline: React.FC<SalesPipelineProps> = ({ 
  opportunities, 
  onOpportunityCreate,
  onOpportunityUpdate, 
  onOpportunityDelete 
}) => {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isCreatingOpportunity, setIsCreatingOpportunity] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(null);
  const [filters, setFilters] = useState({
    assignedTo: '',
    source: '',
    status: 'active',
    dateRange: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const queryClient = useQueryClient();

  // Define pipeline stages
  const pipelineStages = [
    { id: 'lead', name: 'Lead', description: 'Initial contact made', color: 'bg-gray-100', order: 1 },
    { id: 'qualification', name: 'Qualification', description: 'Needs and budget verified', color: 'bg-blue-100', order: 2 },
    { id: 'proposal', name: 'Proposal', description: 'Proposal sent to customer', color: 'bg-yellow-100', order: 3 },
    { id: 'negotiation', name: 'Negotiation', description: 'Terms being negotiated', color: 'bg-orange-100', order: 4 },
    { id: 'closed_won', name: 'Closed Won', description: 'Deal successfully closed', color: 'bg-green-100', order: 5 },
    { id: 'closed_lost', name: 'Closed Lost', description: 'Deal lost or cancelled', color: 'bg-red-100', order: 6 },
  ];

  // Process opportunities into stages
  useEffect(() => {
    const processedStages = pipelineStages.map(stage => {
      const stageOpportunities = opportunities.filter(opp => 
        opp.stage === stage.id && 
        opp.status === filters.status &&
        (filters.assignedTo === '' || opp.assignedTo === filters.assignedTo) &&
        (filters.source === '' || opp.source === filters.source) &&
        (searchTerm === '' || 
          opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.customer?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.customer?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.customer?.company?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

      const totalValue = stageOpportunities.reduce((sum, opp) => sum + opp.value, 0);
      const weightedValue = stageOpportunities.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0);

      return {
        ...stage,
        opportunities: stageOpportunities,
        totalValue,
        weightedValue,
        count: stageOpportunities.length,
      };
    });

    setStages(processedStages);
  }, [opportunities, filters, searchTerm]);

  // Move opportunity to next stage
  const moveOpportunity = (opportunityId: string, newStage: string) => {
    const opportunity = opportunities.find(opp => opp.id === opportunityId);
    if (!opportunity) return;

    const updatedOpportunity = {
      ...opportunity,
      stage: newStage as any,
      updatedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    };

    onOpportunityUpdate(updatedOpportunity);
  };

  // Get stage color classes
  const getStageColorClasses = (stageId: string) => {
    const colorMap: Record<string, string> = {
      lead: 'border-gray-300 bg-gray-50',
      qualification: 'border-blue-300 bg-blue-50',
      proposal: 'border-yellow-300 bg-yellow-50',
      negotiation: 'border-orange-300 bg-orange-50',
      closed_won: 'border-green-300 bg-green-50',
      closed_lost: 'border-red-300 bg-red-50',
    };
    return colorMap[stageId] || 'border-gray-300 bg-gray-50';
  };

  // Get probability color
  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600 bg-green-100';
    if (probability >= 60) return 'text-blue-600 bg-blue-100';
    if (probability >= 40) return 'text-yellow-600 bg-yellow-100';
    if (probability >= 20) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  // Calculate pipeline metrics
  const totalPipelineValue = stages.reduce((sum, stage) => sum + stage.totalValue, 0);
  const weightedPipelineValue = stages.reduce((sum, stage) => sum + stage.weightedValue, 0);
  const totalOpportunities = stages.reduce((sum, stage) => sum + stage.count, 0);
  const wonValue = stages.find(stage => stage.id === 'closed_won')?.totalValue || 0;
  const lostValue = stages.find(stage => stage.id === 'closed_lost')?.totalValue || 0;
  const winRate = wonValue + lostValue > 0 ? (wonValue / (wonValue + lostValue)) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Pipeline</h2>
          <p className="text-gray-600">Track and manage your sales opportunities</p>
        </div>
        <button
          onClick={() => setIsCreatingOpportunity(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Opportunity</span>
        </button>
      </div>

      {/* Pipeline Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-gray-200 rounded-lg p-4 shadow-lg" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pipeline</p>
              <p className="text-2xl font-bold text-gray-900">${totalPipelineValue.toLocaleString()}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 shadow-lg" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Weighted Value</p>
              <p className="text-2xl font-bold text-gray-900">${weightedPipelineValue.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 shadow-lg" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Opportunities</p>
              <p className="text-2xl font-bold text-gray-900">{totalOpportunities}</p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 shadow-lg" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Win Rate</p>
              <p className="text-2xl font-bold text-gray-900">{winRate.toFixed(1)}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border border-gray-200 rounded-lg p-4 shadow-lg" style={{ backgroundColor: '#F7F2EC' }}>
        <div className="flex flex-col sm:flex-row gap-4">
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
          <div className="flex space-x-4">
            <select
              value={filters.assignedTo}
              onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Assignees</option>
              <option value="user1">John Doe</option>
              <option value="user2">Jane Smith</option>
            </select>
            <select
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sources</option>
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="cold_call">Cold Call</option>
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
          </div>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stages.map((stage) => (
          <div 
            key={stage.id} 
            className={`border-2 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all duration-200 ${getStageColorClasses(stage.id)}`}
            onClick={() => setSelectedStage(stage)}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                <p className="text-sm text-gray-600">{stage.description}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{stage.count}</p>
                <p className="text-xs text-gray-600">opportunities</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Value:</span>
                <span className="font-semibold">${stage.totalValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Weighted:</span>
                <span className="font-semibold">${stage.weightedValue.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              {stage.opportunities.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="border border-gray-200 rounded-lg p-3 cursor-pointer shadow-lg hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}
                  onClick={() => setSelectedOpportunity(opportunity)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm truncate">{opportunity.title}</h4>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingOpportunity(opportunity);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Edit opportunity"
                        aria-label="Edit opportunity"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpportunityDelete(opportunity.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete opportunity"
                        aria-label="Delete opportunity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Value:</span>
                      <span className="font-semibold">${opportunity.value.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Probability:</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getProbabilityColor(opportunity.probability)}`}>
                        {opportunity.probability}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Close Date:</span>
                      <span className="text-gray-900">
                        {new Date(opportunity.expectedCloseDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {opportunity.customer && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-600 truncate">
                        {opportunity.customer.firstName} {opportunity.customer.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{opportunity.customer.company}</p>
                    </div>
                  )}

                  {/* Stage progression buttons */}
                  {stage.id !== 'closed_won' && stage.id !== 'closed_lost' && (
                    <div className="mt-2 flex justify-between">
                      {stage.order > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const prevStage = pipelineStages.find(s => s.order === stage.order - 1);
                            if (prevStage) moveOpportunity(opportunity.id, prevStage.id);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Move to previous stage"
                          aria-label="Move to previous stage"
                        >
                          <ArrowLeft className="h-3 w-3" />
                        </button>
                      )}
                      {stage.order < 5 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const nextStage = pipelineStages.find(s => s.order === stage.order + 1);
                            if (nextStage) moveOpportunity(opportunity.id, nextStage.id);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Move to next stage"
                          aria-label="Move to next stage"
                        >
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Opportunity Detail Modal */}
      {selectedOpportunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#F7F2EC' }}>
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{selectedOpportunity.title}</h3>
                <button
                  onClick={() => setSelectedOpportunity(null)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Close opportunity details"
                  aria-label="Close opportunity details"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <p className="text-lg font-semibold text-gray-900">${selectedOpportunity.value.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Probability</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedOpportunity.probability}%</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStageColorClasses(selectedOpportunity.stage)}`}>
                    {selectedOpportunity.stage.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedOpportunity.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedOpportunity.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedOpportunity.status}
                  </span>
                </div>
              </div>

              {/* Customer Information */}
              {selectedOpportunity.customer && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Customer</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium text-gray-900">
                      {selectedOpportunity.customer.firstName} {selectedOpportunity.customer.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{selectedOpportunity.customer.email}</p>
                    {selectedOpportunity.customer.company && (
                      <p className="text-sm text-gray-600">{selectedOpportunity.customer.company}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedOpportunity.description && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700">{selectedOpportunity.description}</p>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Timeline</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-900">
                      {new Date(selectedOpportunity.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Expected Close:</span>
                    <span className="text-gray-900">
                      {new Date(selectedOpportunity.expectedCloseDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Activity:</span>
                    <span className="text-gray-900">
                      {new Date(selectedOpportunity.lastActivityAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setEditingOpportunity(selectedOpportunity);
                    setSelectedOpportunity(null);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Phone className="h-4 w-4" />
                  <span>Call</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stage Detail Modal */}
      {selectedStage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#F7F2EC' }}>
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedStage.name} Stage</h3>
                  <p className="text-gray-600">{selectedStage.description}</p>
                </div>
                <button
                  onClick={() => setSelectedStage(null)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Close stage details"
                  aria-label="Close stage details"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Stage Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="border border-gray-200 rounded-lg p-4 shadow-lg" style={{ backgroundColor: '#F7F2EC' }}>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{selectedStage.count}</p>
                    <p className="text-sm text-gray-600">Total Opportunities</p>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 shadow-lg" style={{ backgroundColor: '#F7F2EC' }}>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">${selectedStage.totalValue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Value</p>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 shadow-lg" style={{ backgroundColor: '#F7F2EC' }}>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">${selectedStage.weightedValue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Weighted Value</p>
                  </div>
                </div>
              </div>

              {/* Opportunities List */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Opportunities in this Stage</h4>
                {selectedStage.opportunities.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No opportunities in this stage</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedStage.opportunities.map((opportunity) => (
                      <div
                        key={opportunity.id}
                        className="border border-gray-200 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer"
                        style={{ backgroundColor: '#F7F2EC' }}
                        onClick={() => {
                          setSelectedOpportunity(opportunity);
                          setSelectedStage(null);
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900">{opportunity.title}</h5>
                            {opportunity.customer && (
                              <p className="text-sm text-gray-600">
                                {opportunity.customer.firstName} {opportunity.customer.lastName}
                                {opportunity.customer.company && ` • ${opportunity.customer.company}`}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getProbabilityColor(opportunity.probability)}`}>
                              {opportunity.probability}%
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              opportunity.status === 'active' ? 'bg-green-100 text-green-800' :
                              opportunity.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {opportunity.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Value:</span>
                            <p className="font-semibold">${opportunity.value.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Close Date:</span>
                            <p className="font-semibold">
                              {new Date(opportunity.expectedCloseDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Source:</span>
                            <p className="font-semibold">{opportunity.source || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Assigned To:</span>
                            <p className="font-semibold">{opportunity.assignedTo || 'Unassigned'}</p>
                          </div>
                        </div>

                        {opportunity.description && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-700 line-clamp-2">{opportunity.description}</p>
                          </div>
                        )}

                        <div className="mt-3 flex justify-end space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingOpportunity(opportunity);
                              setSelectedStage(null);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit opportunity"
                            aria-label="Edit opportunity"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpportunityDelete(opportunity.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete opportunity"
                            aria-label="Delete opportunity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Opportunity Modal */}
      {isCreatingOpportunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#F7F2EC' }}>
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Create New Opportunity</h3>
                <button
                  onClick={() => setIsCreatingOpportunity(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Close create opportunity modal"
                  aria-label="Close create opportunity modal"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newOpportunity = {
                  customerId: 'cust-new',
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  stage: formData.get('stage') as any,
                  value: parseFloat(formData.get('value') as string) || 0,
                  probability: parseFloat(formData.get('probability') as string) || 50,
                  expectedCloseDate: formData.get('expectedCloseDate') as string,
                  source: formData.get('source') as string,
                  assignedTo: 'user1',
                  tags: [],
                  customFields: {},
                  status: 'active' as const,
                  customer: {
                    id: 'cust-new',
                    firstName: 'New',
                    lastName: 'Customer',
                    email: 'new@customer.com',
                    company: 'New Company'
                  }
                };
                
                // Call the parent's create handler
                if (onOpportunityCreate) {
                  onOpportunityCreate(newOpportunity as any);
                }
                
                setIsCreatingOpportunity(false);
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter opportunity title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Value *</label>
                    <input
                      type="number"
                      name="value"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Probability (%)</label>
                    <input
                      type="number"
                      name="probability"
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                    <select name="stage" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="lead">Lead</option>
                      <option value="qualification">Qualification</option>
                      <option value="proposal">Proposal</option>
                      <option value="negotiation">Negotiation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close Date</label>
                    <input
                      type="date"
                      name="expectedCloseDate"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                    <select name="source" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select source</option>
                      <option value="website">Website</option>
                      <option value="referral">Referral</option>
                      <option value="cold_call">Cold Call</option>
                      <option value="email">Email</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter opportunity description"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsCreatingOpportunity(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    Create Opportunity
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Opportunity Modal */}
      {editingOpportunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#F7F2EC' }}>
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Edit Opportunity</h3>
                <button
                  onClick={() => setEditingOpportunity(null)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Close edit opportunity modal"
                  aria-label="Close edit opportunity modal"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                // Handle form submission
                console.log('Updating opportunity:', editingOpportunity);
                onOpportunityUpdate(editingOpportunity);
                setEditingOpportunity(null);
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      defaultValue={editingOpportunity.title}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Value *</label>
                    <input
                      type="number"
                      required
                      defaultValue={editingOpportunity.value}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Probability (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={editingOpportunity.probability}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                    <select 
                      defaultValue={editingOpportunity.stage}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="lead">Lead</option>
                      <option value="qualification">Qualification</option>
                      <option value="proposal">Proposal</option>
                      <option value="negotiation">Negotiation</option>
                      <option value="closed_won">Closed Won</option>
                      <option value="closed_lost">Closed Lost</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    defaultValue={editingOpportunity.description || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setEditingOpportunity(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    Update Opportunity
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPipeline;




