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
  onOpportunityUpdate: (opportunity: Opportunity) => void;
  onOpportunityDelete: (opportunityId: string) => void;
}

const SalesPipeline: React.FC<SalesPipelineProps> = ({ 
  opportunities, 
  onOpportunityUpdate, 
  onOpportunityDelete 
}) => {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isCreatingOpportunity, setIsCreatingOpportunity] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
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
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Opportunity</span>
        </button>
      </div>

      {/* Pipeline Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pipeline</p>
              <p className="text-2xl font-bold text-gray-900">${totalPipelineValue.toLocaleString()}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Weighted Value</p>
              <p className="text-2xl font-bold text-gray-900">${weightedPipelineValue.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Opportunities</p>
              <p className="text-2xl font-bold text-gray-900">{totalOpportunities}</p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
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
      <div className="bg-white border border-gray-200 rounded-lg p-4">
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
          <div key={stage.id} className={`border-2 rounded-lg p-4 ${getStageColorClasses(stage.id)}`}>
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
                  className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
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
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpportunityDelete(opportunity.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600"
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
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{selectedOpportunity.title}</h3>
                <button
                  onClick={() => setSelectedOpportunity(null)}
                  className="p-1 text-gray-400 hover:text-gray-600"
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
    </div>
  );
};

export default SalesPipeline;


