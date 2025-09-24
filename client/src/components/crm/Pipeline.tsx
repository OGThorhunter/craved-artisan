import React, { useState } from 'react';
import {
  Target,
  Plus,
  Search,
  Filter,
  DollarSign,
  Calendar,
  User,
  TrendingUp,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Star,
  Phone,
  Mail,
  MessageSquare,
  MoreVertical,
  X
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

interface PipelineProps {
  opportunities: Opportunity[];
  onOpportunityCreate: (opportunity: Partial<Opportunity>) => void;
  onOpportunityUpdate: (opportunity: Opportunity) => void;
  onOpportunityDelete: (id: string) => void;
  onStageChange: (id: string, stage: string) => void;
  onForecastUpdate: () => void;
  isLoading: boolean;
}

const Pipeline: React.FC<PipelineProps> = ({
  opportunities,
  onOpportunityCreate,
  onOpportunityUpdate,
  onOpportunityDelete,
  onStageChange,
  onForecastUpdate,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [assignedToFilter, setAssignedToFilter] = useState('');
  const [valueRange, setValueRange] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const stages = [
    { id: 'lead', name: 'Lead', color: 'bg-blue-100 text-blue-800' },
    { id: 'qualification', name: 'Qualification', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'proposal', name: 'Proposal', color: 'bg-orange-100 text-orange-800' },
    { id: 'negotiation', name: 'Negotiation', color: 'bg-purple-100 text-purple-800' },
    { id: 'closed_won', name: 'Closed Won', color: 'bg-green-100 text-green-800' },
    { id: 'closed_lost', name: 'Closed Lost', color: 'bg-red-100 text-red-800' }
  ];

  // Filter opportunities
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        opp.customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        opp.customer?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAssigned = !assignedToFilter || opp.assignedTo === assignedToFilter;
    const matchesValue = !valueRange || (
      valueRange === 'low' && opp.value < 10000 ||
      valueRange === 'medium' && opp.value >= 10000 && opp.value < 50000 ||
      valueRange === 'high' && opp.value >= 50000
    );
    return matchesSearch && matchesAssigned && matchesValue;
  });

  // Group opportunities by stage
  const opportunitiesByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = filteredOpportunities.filter(opp => opp.stage === stage.id);
    return acc;
  }, {} as Record<string, Opportunity[]>);

  // Calculate pipeline metrics
  const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
  const weightedValue = opportunities.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0);
  const wonValue = opportunities.filter(opp => opp.stage === 'closed_won').reduce((sum, opp) => sum + opp.value, 0);
  const conversionRate = opportunities.length > 0 ? 
    (opportunities.filter(opp => opp.stage === 'closed_won').length / opportunities.length) * 100 : 0;

  const getStageColor = (stage: string) => {
    const stageConfig = stages.find(s => s.id === stage);
    return stageConfig?.color || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntilClose = (expectedCloseDate: string) => {
    const today = new Date();
    const closeDate = new Date(expectedCloseDate);
    const diffTime = closeDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Pipeline</h2>
          <p className="text-gray-600">Manage opportunities and track sales progress</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={assignedToFilter}
            onChange={(e) => setAssignedToFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="Filter by assignee"
            aria-label="Filter opportunities by assignee"
          >
            <option value="">All Assignees</option>
            <option value="sales@company.com">Sales Team</option>
            <option value="manager@company.com">Manager</option>
          </select>
          
          <select
            value={valueRange}
            onChange={(e) => setValueRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="Filter by value range"
            aria-label="Filter opportunities by value range"
          >
            <option value="">All Values</option>
            <option value="low">Under $10K</option>
            <option value="medium">$10K - $50K</option>
            <option value="high">Over $50K</option>
          </select>
          
          <button
            onClick={() => onOpportunityCreate({})}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Opportunity
          </button>
        </div>
      </div>

      {/* Pipeline Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pipeline</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Weighted Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(weightedValue)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Won Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(wonValue)}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{conversionRate.toFixed(1)}%</p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Pipeline Board */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          {stages.map((stage) => (
            <div key={stage.id} className="space-y-4">
              {/* Stage Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {opportunitiesByStage[stage.id]?.length || 0}
                </span>
              </div>
              
              {/* Stage Value */}
              <div className="text-sm text-gray-600">
                {formatCurrency(
                  opportunitiesByStage[stage.id]?.reduce((sum, opp) => sum + opp.value, 0) || 0
                )}
              </div>
              
              {/* Opportunities in Stage */}
              <div className="space-y-3">
                {opportunitiesByStage[stage.id]?.map((opportunity) => (
                  <div
                    key={opportunity.id}
                    className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200 cursor-pointer"
                    style={{ backgroundColor: '#F7F2EC' }}
                    onClick={() => {
                      setSelectedOpportunity(opportunity);
                      setShowDetails(true);
                    }}
                  >
                    <div className="space-y-3">
                      {/* Opportunity Header */}
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-gray-900 text-sm">{opportunity.title}</h4>
                        <div className="flex items-center gap-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(opportunity.stage)}`}>
                            {opportunity.probability}%
                          </span>
                        </div>
                      </div>
                      
                      {/* Customer Info */}
                      {opportunity.customer && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {opportunity.customer.firstName} {opportunity.customer.lastName}
                          </span>
                        </div>
                      )}
                      
                      {/* Value */}
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-gray-900">{formatCurrency(opportunity.value)}</span>
                      </div>
                      
                      {/* Expected Close Date */}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {formatDate(opportunity.expectedCloseDate)}
                        </span>
                        {getDaysUntilClose(opportunity.expectedCloseDate) < 7 && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      
                      {/* Tags */}
                      {opportunity.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {opportunity.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                          {opportunity.tags.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              +{opportunity.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Quick Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onStageChange(opportunity.id, 'closed_won');
                            }}
                            className="p-1 text-green-600 hover:text-green-700 transition-colors"
                            title="Mark as Won"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onStageChange(opportunity.id, 'closed_lost');
                            }}
                            className="p-1 text-red-600 hover:text-red-700 transition-colors"
                            title="Mark as Lost"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpportunityUpdate(opportunity);
                            }}
                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOpportunity(opportunity);
                              setShowDetails(true);
                            }}
                            className="p-1 text-gray-500 hover:text-purple-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Opportunity Details Modal */}
      {showDetails && selectedOpportunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedOpportunity.title}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Opportunity Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Deal Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Value:</span> {formatCurrency(selectedOpportunity.value)}</p>
                    <p><span className="font-medium">Probability:</span> {selectedOpportunity.probability}%</p>
                    <p><span className="font-medium">Expected Close:</span> {formatDate(selectedOpportunity.expectedCloseDate)}</p>
                    <p><span className="font-medium">Stage:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStageColor(selectedOpportunity.stage)}`}>
                        {selectedOpportunity.stage}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                  {selectedOpportunity.customer ? (
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> {selectedOpportunity.customer.firstName} {selectedOpportunity.customer.lastName}</p>
                      <p><span className="font-medium">Email:</span> {selectedOpportunity.customer.email}</p>
                      {selectedOpportunity.customer.company && (
                        <p><span className="font-medium">Company:</span> {selectedOpportunity.customer.company}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">No customer information available</p>
                  )}
                </div>
              </div>
              
              {/* Description */}
              {selectedOpportunity.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                  <p className="text-gray-700">{selectedOpportunity.description}</p>
                </div>
              )}
              
              {/* Tags */}
              {selectedOpportunity.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedOpportunity.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onStageChange(selectedOpportunity.id, 'closed_won')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark as Won
                  </button>
                  <button
                    onClick={() => onStageChange(selectedOpportunity.id, 'closed_lost')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    Mark as Lost
                  </button>
                  <button
                    onClick={() => onOpportunityUpdate(selectedOpportunity)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Opportunity
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pipeline;
