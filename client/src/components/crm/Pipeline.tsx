import React, { useState, useMemo } from 'react';
import {
  Target,
  Plus,
  Search,
  DollarSign,
  Calendar,
  User,
  TrendingUp,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  List
} from 'lucide-react';
import AIInsights from './AIInsights';
import AddOpportunityWizard from './AddOpportunityWizard';

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
  customFields: Record<string, unknown>;
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
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [assignedToFilter, setAssignedToFilter] = useState('');
  const [valueRange, setValueRange] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');
  const [activeInsightFilter, setActiveInsightFilter] = useState<string | null>(null);
  const [newOpportunity, setNewOpportunity] = useState({
    title: '',
    description: '',
    customerId: '',
    stage: 'lead' as 'lead' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost',
    value: 0,
    probability: 25,
    expectedCloseDate: '',
    source: 'Website',
    assignedTo: '',
    tags: [] as string[],
    status: 'active' as const
  });

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
      valueRange === 'high' && opp.value >= 50000 ||
      valueRange === '50000+' && opp.value > 50000
    );
    
    // Apply insight filters
    let matchesInsight = true;
    if (activeInsightFilter === 'stuck-opportunities') {
      const daysSinceUpdate = Math.floor((Date.now() - new Date(opp.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24));
      matchesInsight = daysSinceUpdate > 14 && opp.stage !== 'closed_won' && opp.stage !== 'closed_lost';
    } else if (activeInsightFilter === 'overdue-opportunities') {
      const expectedClose = new Date(opp.expectedCloseDate);
      const today = new Date();
      matchesInsight = expectedClose < today && opp.stage !== 'closed_won' && opp.stage !== 'closed_lost';
    } else if (activeInsightFilter === 'low-probability-deals') {
      matchesInsight = opp.probability < 30 && opp.stage !== 'closed_won' && opp.stage !== 'closed_lost';
    }
    
    return matchesSearch && matchesAssigned && matchesValue && matchesInsight;
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

  // Generate AI insights based on pipeline data
  const pipelineInsights = useMemo(() => {
    const insights = [];
    
    // Stuck opportunities insight
    const stuckOpportunities = opportunities.filter(op => {
      const daysSinceUpdate = Math.floor((Date.now() - new Date(op.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceUpdate > 14 && op.stage !== 'closed_won' && op.stage !== 'closed_lost';
    });
    
    if (stuckOpportunities.length > 0) {
      insights.push({
        id: 'stuck-opportunities',
        type: 'warning' as const,
        title: 'Stuck Opportunities',
        description: `${stuckOpportunities.length} opportunities haven't been updated in 14+ days. These may need immediate attention.`,
        confidence: 90,
        priority: 'high' as const,
        category: 'pipeline-optimization' as const,
        action: 'Review Stuck Deals'
      });
    }

    // High-value opportunities insight
    const highValueOpportunities = opportunities.filter(op => op.value > 50000 && op.stage !== 'closed_won' && op.stage !== 'closed_lost');
    if (highValueOpportunities.length > 0) {
      insights.push({
        id: 'high-value-deals',
        type: 'success' as const,
        title: 'High-Value Opportunities',
        description: `${highValueOpportunities.length} opportunities worth over $50,000. Focus on closing these high-impact deals.`,
        confidence: 95,
        priority: 'high' as const,
        category: 'sales-opportunity' as const,
        action: 'Prioritize High-Value Deals'
      });
    }

    // Low probability deals insight
    const lowProbabilityDeals = opportunities.filter(op => op.probability < 30 && op.stage !== 'closed_won' && op.stage !== 'closed_lost');
    if (lowProbabilityDeals.length > 3) {
      insights.push({
        id: 'low-probability-deals',
        type: 'info' as const,
        title: 'Low Probability Deals',
        description: `${lowProbabilityDeals.length} deals have less than 30% probability. Consider re-qualifying or adjusting strategy.`,
        confidence: 85,
        priority: 'medium' as const,
        category: 'pipeline-optimization' as const,
        action: 'Review Deal Qualification'
      });
    }

    // Overdue opportunities insight
    const overdueOpportunities = opportunities.filter(op => {
      const expectedClose = new Date(op.expectedCloseDate);
      const today = new Date();
      return expectedClose < today && op.stage !== 'closed_won' && op.stage !== 'closed_lost';
    });
    
    if (overdueOpportunities.length > 0) {
      insights.push({
        id: 'overdue-opportunities',
        type: 'warning' as const,
        title: 'Overdue Opportunities',
        description: `${overdueOpportunities.length} opportunities are past their expected close date. Update timelines or close out.`,
        confidence: 92,
        priority: 'high' as const,
        category: 'pipeline-optimization' as const,
        action: 'Update Close Dates'
      });
    }

    // Conversion rate insight
    const closedWon = opportunities.filter(op => op.stage === 'closed_won').length;
    const closedTotal = opportunities.filter(op => op.stage === 'closed_won' || op.stage === 'closed_lost').length;
    const conversionRate = closedTotal > 0 ? (closedWon / closedTotal) * 100 : 0;
    
    if (conversionRate < 25 && closedTotal > 5) {
      insights.push({
        id: 'low-conversion-rate',
        type: 'warning' as const,
        title: 'Low Conversion Rate',
        description: `Current conversion rate is ${conversionRate.toFixed(1)}%. Industry average is 25-30%. Focus on qualification and follow-up.`,
        confidence: 88,
        priority: 'high' as const,
        category: 'pipeline-optimization' as const,
        action: 'Improve Sales Process'
      });
    } else if (conversionRate > 35 && closedTotal > 5) {
      insights.push({
        id: 'high-conversion-rate',
        type: 'success' as const,
        title: 'Excellent Conversion Rate',
        description: `Current conversion rate is ${conversionRate.toFixed(1)}%. Above industry average! Keep up the great work.`,
        confidence: 90,
        priority: 'low' as const,
        category: 'sales-opportunity' as const,
        action: 'Analyze Success Factors'
      });
    }

    return insights;
  }, [opportunities]);

  // Check for duplicate opportunities
  const checkForDuplicateOpportunity = (title: string, customerId: string) => {
    return opportunities.find(opportunity => 
      opportunity.title.toLowerCase() === title.toLowerCase() && 
      opportunity.customerId === customerId
    );
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
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-brand-green text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="List view"
            >
              <List className="h-4 w-4" />
              List
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'card' 
                  ? 'bg-brand-green text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="Card view"
            >
              <BarChart3 className="h-4 w-4" />
              Card
            </button>
          </div>
          
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
          
          {/* Active Insight Filter Indicator */}
          {activeInsightFilter && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm font-medium text-blue-800">
                {activeInsightFilter === 'stuck-opportunities' && '🔍 Stuck Deals (14+ days)'}
                {activeInsightFilter === 'overdue-opportunities' && '⏰ Overdue Deals'}
                {activeInsightFilter === 'high-value-deals' && '💰 High-Value Deals ($50k+)'}
                {activeInsightFilter === 'low-probability-deals' && '📉 Low Probability Deals (<30%)'}
              </span>
              <button
                onClick={() => setActiveInsightFilter(null)}
                className="text-blue-600 hover:text-blue-800"
                title="Clear insight filter"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          
          <button
            onClick={() => {
              setNewOpportunity({
                title: '',
                description: '',
                customerId: '',
                stage: 'lead',
                value: 0,
                probability: 25,
                expectedCloseDate: '',
                source: 'Website',
                assignedTo: '',
                tags: [],
                status: 'active'
              });
              setShowAddWizard(true);
            }}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-md transition-colors text-sm font-medium"
            title="Add new opportunity"
            aria-label="Add new opportunity to pipeline"
          >
            <Plus className="h-4 w-4" />
            Add Opportunity Wizard
          </button>
        </div>
      </div>

      {/* AI Insights */}
      <AIInsights 
        insights={pipelineInsights}
        isLoading={isLoading}
        maxInsights={4}
        showCategories={true}
      />

      {/* Pipeline Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Pipeline</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Weighted Value</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(weightedValue)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Won Value</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(wonValue)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Conversion Rate</p>
              <p className="text-3xl font-bold text-gray-900">{conversionRate.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Board */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {stages.map((stage) => (
            <div key={stage.id} className="rounded-xl shadow-lg border border-gray-200 p-3 min-h-[200px]" style={{ backgroundColor: '#F7F2EC' }}>
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-lg">{stage.name}</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                  {opportunitiesByStage[stage.id]?.length || 0}
                </span>
              </div>
              
              {/* Stage Value */}
              <div className="mb-4">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    opportunitiesByStage[stage.id]?.reduce((sum, opp) => sum + opp.value, 0) || 0
                  )}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Total Value</div>
              </div>
              
              {/* Opportunities in Stage */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {opportunitiesByStage[stage.id]?.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="text-gray-400 text-sm">No opportunities</div>
                  </div>
                ) : (
                  opportunitiesByStage[stage.id]?.map((opportunity) => (
                    <div
                      key={opportunity.id}
                      className={`bg-[#F7F2EC] rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer shadow-sm ${
                        viewMode === 'list' ? 'p-2' : 'p-3'
                      }`}
                      onClick={() => {
                        setSelectedOpportunity(opportunity);
                        setShowDetails(true);
                      }}
                    >
                      {viewMode === 'list' ? (
                        /* List View - Compact horizontal layout */
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 text-sm truncate">{opportunity.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(opportunity.stage)}`}>
                                {opportunity.probability}%
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {formatCurrency(opportunity.value)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(opportunity.expectedCloseDate)}
                                {getDaysUntilClose(opportunity.expectedCloseDate) < 7 && (
                                  <AlertCircle className="h-3 w-3 text-red-500" />
                                )}
                              </span>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onStageChange(opportunity.id, 'closed_won');
                              }}
                              className="p-1 text-green-600 hover:text-green-700 transition-colors"
                              title="Mark as Won"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onStageChange(opportunity.id, 'closed_lost');
                              }}
                              className="p-1 text-red-600 hover:text-red-700 transition-colors"
                              title="Mark as Lost"
                            >
                              <XCircle className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingOpportunity(opportunity);
                                setShowEditModal(true);
                              }}
                              className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-3 w-3" />
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
                              <Eye className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpportunityDelete(opportunity.id);
                              }}
                              className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Card View - Compact vertical layout */
                        <div className="space-y-2">
                          {/* Opportunity Header */}
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-gray-900 text-sm truncate flex-1 mr-2">{opportunity.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStageColor(opportunity.stage)}`}>
                              {opportunity.probability}%
                            </span>
                          </div>
                          
                          {/* Key Info Row */}
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-green-600" />
                              {formatCurrency(opportunity.value)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(opportunity.expectedCloseDate)}
                              {getDaysUntilClose(opportunity.expectedCloseDate) < 7 && (
                                <AlertCircle className="h-3 w-3 text-red-500" />
                              )}
                            </span>
                          </div>
                          
                          {/* Customer Info - Only if available */}
                          {opportunity.customer && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <User className="h-3 w-3 text-gray-500" />
                              <span className="truncate">
                                {opportunity.customer.firstName} {opportunity.customer.lastName}
                              </span>
                            </div>
                          )}
                          
                          {/* Tags - Compact display */}
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
                          <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStageChange(opportunity.id, 'closed_won');
                                }}
                                className="p-1 text-green-600 hover:text-green-700 transition-colors"
                                title="Mark as Won"
                              >
                                <CheckCircle className="h-3 w-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStageChange(opportunity.id, 'closed_lost');
                                }}
                                className="p-1 text-red-600 hover:text-red-700 transition-colors"
                                title="Mark as Lost"
                              >
                                <XCircle className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingOpportunity(opportunity);
                                  setShowEditModal(true);
                                }}
                                className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                                title="Edit"
                              >
                                <Edit className="h-3 w-3" />
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
                                <Eye className="h-3 w-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpportunityDelete(opportunity.id);
                                }}
                                className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Opportunity Details Modal */}
      {showDetails && selectedOpportunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#F7F2EC] rounded-lg shadow-xl border border-gray-200 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedOpportunity.title}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close modal"
                  aria-label="Close opportunity details modal"
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
                    className="flex items-center gap-2 px-3 py-2 bg-brand-green text-white rounded-md hover:bg-brand-green/80 transition-colors text-sm font-medium"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark as Won
                  </button>
                  <button
                    onClick={() => onStageChange(selectedOpportunity.id, 'closed_lost')}
                    className="flex items-center gap-2 px-3 py-2 bg-brand-maroon text-white rounded-md hover:bg-brand-maroon/80 transition-colors text-sm font-medium"
                  >
                    <XCircle className="h-4 w-4" />
                    Mark as Lost
                  </button>
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      setEditingOpportunity(selectedOpportunity);
                      setShowEditModal(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-brand-green text-white rounded-md hover:bg-brand-green/80 transition-colors text-sm font-medium"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Opportunity
                  </button>
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      onOpportunityDelete(selectedOpportunity.id);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Opportunity
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Opportunity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#F7F2EC] rounded-lg shadow-xl border border-gray-200 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Add New Opportunity</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close modal"
                  aria-label="Close add opportunity modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opportunity Title *
                    </label>
                    <input
                      type="text"
                      value={newOpportunity.title}
                      onChange={(e) => setNewOpportunity({...newOpportunity, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter opportunity title"
                      title="Enter opportunity title"
                      aria-label="Enter opportunity title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer ID
                    </label>
                    <input
                      type="text"
                      value={newOpportunity.customerId}
                      onChange={(e) => setNewOpportunity({...newOpportunity, customerId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter customer ID"
                      title="Enter customer ID"
                      aria-label="Enter customer ID"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Deal Value *
                      </label>
                      <div className="group relative">
                        <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center cursor-help">
                          <span className="text-blue-600 text-xs font-bold">?</span>
                        </div>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          <div className="max-w-xs">
                            <div className="font-semibold mb-1">Deal Value Guide:</div>
                            <div className="text-xs space-y-1">
                              <div>• <span className="text-green-300">Under $10K:</span> Small deals</div>
                              <div>• <span className="text-yellow-300">$10K - $50K:</span> Medium deals</div>
                              <div>• <span className="text-orange-300">$50K - $100K:</span> Large deals</div>
                              <div>• <span className="text-red-300">Over $100K:</span> Enterprise deals</div>
                            </div>
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={newOpportunity.value}
                      onChange={(e) => setNewOpportunity({...newOpportunity, value: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter deal value"
                      title="Enter deal value in dollars"
                      aria-label="Enter deal value in dollars"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Probability (%)
                      </label>
                      <div className="group relative">
                        <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center cursor-help">
                          <span className="text-blue-600 text-xs font-bold">?</span>
                        </div>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          <div className="max-w-xs">
                            <div className="font-semibold mb-1">Probability Guide:</div>
                            <div className="text-xs space-y-1">
                              <div>• <span className="text-green-300">76-100%:</span> Very likely to close</div>
                              <div>• <span className="text-yellow-300">51-75%:</span> Likely to close</div>
                              <div>• <span className="text-orange-300">26-50%:</span> Moderate chance</div>
                              <div>• <span className="text-red-300">0-25%:</span> Low probability</div>
                            </div>
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newOpportunity.probability}
                      onChange={(e) => setNewOpportunity({...newOpportunity, probability: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="Enter probability percentage"
                      aria-label="Enter probability percentage"
                    />
                  </div>
                </div>
                
                {/* Additional Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stage *
                    </label>
                    <select
                      value={newOpportunity.stage}
                      onChange={(e) => setNewOpportunity({...newOpportunity, stage: e.target.value as 'lead' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="Select opportunity stage"
                      aria-label="Select opportunity stage"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Close Date *
                    </label>
                    <input
                      type="date"
                      value={newOpportunity.expectedCloseDate}
                      onChange={(e) => setNewOpportunity({...newOpportunity, expectedCloseDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="Select expected close date"
                      aria-label="Select expected close date"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source
                    </label>
                    <select
                      value={newOpportunity.source}
                      onChange={(e) => setNewOpportunity({...newOpportunity, source: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="Select opportunity source"
                      aria-label="Select opportunity source"
                    >
                      <option value="Website">Website</option>
                      <option value="Referral">Referral</option>
                      <option value="Cold Call">Cold Call</option>
                      <option value="Email">Email</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Trade Show">Trade Show</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned To
                    </label>
                    <select
                      value={newOpportunity.assignedTo}
                      onChange={(e) => setNewOpportunity({...newOpportunity, assignedTo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="Select assignee"
                      aria-label="Select assignee"
                    >
                      <option value="">Select Assignee</option>
                      <option value="sales@company.com">Sales Team</option>
                      <option value="manager@company.com">Manager</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newOpportunity.description}
                  onChange={(e) => setNewOpportunity({...newOpportunity, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter opportunity description..."
                  title="Enter opportunity description"
                  aria-label="Enter opportunity description"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Check for duplicate opportunity
                    const duplicate = checkForDuplicateOpportunity(newOpportunity.title, newOpportunity.customerId);
                    if (duplicate) {
                      alert(`An opportunity with the title "${newOpportunity.title}" already exists for this customer. Please choose a different title.`);
                      return;
                    }

                    // Create new opportunity object
                    const opportunity: Partial<Opportunity> = {
                      ...newOpportunity,
                      id: Date.now().toString(),
                      actualCloseDate: undefined,
                      customFields: {},
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      lastActivityAt: new Date().toISOString()
                    };
                    
                    onOpportunityCreate(opportunity);
                    
                    // Reset form and close modal
                    setShowAddModal(false);
                    setNewOpportunity({
                      title: '',
                      description: '',
                      customerId: '',
                      stage: 'lead',
                      value: 0,
                      probability: 25,
                      expectedCloseDate: '',
                      source: 'Website',
                      assignedTo: '',
                      tags: [],
                      status: 'active'
                    });
                  }}
                  disabled={!newOpportunity.title || !newOpportunity.expectedCloseDate}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Create Opportunity
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Opportunity Modal */}
      {showEditModal && editingOpportunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#F7F2EC] rounded-lg shadow-xl border border-gray-200 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Edit Opportunity</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingOpportunity(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close modal"
                  aria-label="Close edit opportunity modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opportunity Title *
                    </label>
                    <input
                      type="text"
                      value={editingOpportunity.title}
                      onChange={(e) => setEditingOpportunity({...editingOpportunity, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter opportunity title"
                      title="Enter opportunity title"
                      aria-label="Enter opportunity title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer ID
                    </label>
                    <input
                      type="text"
                      value={editingOpportunity.customerId}
                      onChange={(e) => setEditingOpportunity({...editingOpportunity, customerId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter customer ID"
                      title="Enter customer ID"
                      aria-label="Enter customer ID"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Deal Value *
                      </label>
                      <div className="group relative">
                        <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center cursor-help">
                          <span className="text-blue-600 text-xs font-bold">?</span>
                        </div>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          <div className="max-w-xs">
                            <div className="font-semibold mb-1">Deal Value Guide:</div>
                            <div className="text-xs space-y-1">
                              <div>• <span className="text-green-300">Under $10K:</span> Small deals</div>
                              <div>• <span className="text-yellow-300">$10K - $50K:</span> Medium deals</div>
                              <div>• <span className="text-orange-300">$50K - $100K:</span> Large deals</div>
                              <div>• <span className="text-red-300">Over $100K:</span> Enterprise deals</div>
                            </div>
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={editingOpportunity.value}
                      onChange={(e) => setEditingOpportunity({...editingOpportunity, value: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter deal value"
                      title="Enter deal value in dollars"
                      aria-label="Enter deal value in dollars"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Probability (%)
                      </label>
                      <div className="group relative">
                        <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center cursor-help">
                          <span className="text-blue-600 text-xs font-bold">?</span>
                        </div>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          <div className="max-w-xs">
                            <div className="font-semibold mb-1">Probability Guide:</div>
                            <div className="text-xs space-y-1">
                              <div>• <span className="text-green-300">76-100%:</span> Very likely to close</div>
                              <div>• <span className="text-yellow-300">51-75%:</span> Likely to close</div>
                              <div>• <span className="text-orange-300">26-50%:</span> Moderate chance</div>
                              <div>• <span className="text-red-300">0-25%:</span> Low probability</div>
                            </div>
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editingOpportunity.probability}
                      onChange={(e) => setEditingOpportunity({...editingOpportunity, probability: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="Enter probability percentage"
                      aria-label="Enter probability percentage"
                    />
                  </div>
                </div>
                
                {/* Additional Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stage *
                    </label>
                    <select
                      value={editingOpportunity.stage}
                      onChange={(e) => setEditingOpportunity({...editingOpportunity, stage: e.target.value as 'lead' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="Select opportunity stage"
                      aria-label="Select opportunity stage"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Close Date *
                    </label>
                    <input
                      type="date"
                      value={editingOpportunity.expectedCloseDate}
                      onChange={(e) => setEditingOpportunity({...editingOpportunity, expectedCloseDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="Select expected close date"
                      aria-label="Select expected close date"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source
                    </label>
                    <select
                      value={editingOpportunity.source || 'Website'}
                      onChange={(e) => setEditingOpportunity({...editingOpportunity, source: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="Select opportunity source"
                      aria-label="Select opportunity source"
                    >
                      <option value="Website">Website</option>
                      <option value="Referral">Referral</option>
                      <option value="Cold Call">Cold Call</option>
                      <option value="Email">Email</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Trade Show">Trade Show</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned To
                    </label>
                    <select
                      value={editingOpportunity.assignedTo || ''}
                      onChange={(e) => setEditingOpportunity({...editingOpportunity, assignedTo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="Select assignee"
                      aria-label="Select assignee"
                    >
                      <option value="">Select Assignee</option>
                      <option value="sales@company.com">Sales Team</option>
                      <option value="manager@company.com">Manager</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editingOpportunity.description || ''}
                  onChange={(e) => setEditingOpportunity({...editingOpportunity, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter opportunity description..."
                  title="Enter opportunity description"
                  aria-label="Enter opportunity description"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingOpportunity(null);
                  }}
                  className="px-3 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Update the opportunity
                    onOpportunityUpdate({
                      ...editingOpportunity,
                      updatedAt: new Date().toISOString(),
                      lastActivityAt: new Date().toISOString()
                    });
                    
                    // Close modal and reset state
                    setShowEditModal(false);
                    setEditingOpportunity(null);
                  }}
                  disabled={!editingOpportunity.title || !editingOpportunity.expectedCloseDate}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Opportunity Wizard */}
      <AddOpportunityWizard
        isOpen={showAddWizard}
        onClose={() => setShowAddWizard(false)}
        onComplete={(opportunityData) => {
          // Create the opportunity with the wizard data
          const opportunity: Partial<Opportunity> = {
            title: opportunityData.title || '',
            description: opportunityData.description || '',
            customerId: opportunityData.customerId || '',
            stage: opportunityData.stage || 'lead',
            value: opportunityData.value || 0,
            probability: opportunityData.probability || 10,
            expectedCloseDate: opportunityData.expectedCloseDate || '',
            source: opportunityData.source || 'Manual',
            assignedTo: opportunityData.assignedTo || '',
            tags: opportunityData.tags || [],
            status: opportunityData.status || 'active',
            customFields: {}
          };
          
          onOpportunityCreate(opportunity);
        }}
        customers={[
          // Mock customers - in a real app, this would come from props
          { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', company: 'Acme Corp' },
          { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', company: 'Tech Inc' }
        ]}
      />
    </div>
  );
};

export default Pipeline;
