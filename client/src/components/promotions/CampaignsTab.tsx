import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Target,
  Percent,
  DollarSign,
  Gift,
  ShoppingCart,
  Star,
  Tag,
  Edit,
  Trash2,
  Copy,
  Eye,
  Play,
  Pause,
  SquareStop,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Settings,
  MoreHorizontal,
  Calendar,
  Users,
  BarChart3,
  X
} from 'lucide-react';

interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed_amount' | 'bogo' | 'free_shipping' | 'loyalty_points';
  value: number;
  status: 'draft' | 'active' | 'paused' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  performance: {
    totalUses: number;
    totalDiscount: number;
    conversionRate: number;
    revenue: number;
    roi: number;
  };
}

interface Template {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  isPopular: boolean;
}

interface CampaignsTabProps {
  promotions: Promotion[];
  onPromotionCreate: () => void;
  onPromotionUpdate: (promotion: Promotion) => void;
  onPromotionDelete: (id: string) => void;
  onPromotionAction: (action: string, id: string) => void;
  onTemplateSelect: (template: Template) => void;
  onBulkAction: (action: string) => void;
  selectedPromotions: string[];
  onSelectPromotion: (id: string) => void;
  onSelectAll: () => void;
  isLoading: boolean;
}

const CampaignsTab: React.FC<CampaignsTabProps> = ({
  promotions,
  onPromotionCreate,
  onPromotionUpdate,
  onPromotionDelete,
  onPromotionAction,
  onTemplateSelect,
  onBulkAction,
  selectedPromotions,
  onSelectPromotion,
  onSelectAll,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Filter promotions
  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promotion.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || promotion.status === statusFilter;
    const matchesType = typeFilter === 'all' || promotion.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'expired': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'draft': return <Edit className="h-4 w-4 text-gray-500" />;
      case 'cancelled': return <SquareStop className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return <Percent className="h-4 w-4" />;
      case 'fixed_amount': return <DollarSign className="h-4 w-4" />;
      case 'bogo': return <Gift className="h-4 w-4" />;
      case 'free_shipping': return <ShoppingCart className="h-4 w-4" />;
      case 'loyalty_points': return <Star className="h-4 w-4" />;
      default: return <Tag className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  const formatPercentage = (value: number) => `${value}%`;

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Campaigns</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="Grid View"
              aria-label="Switch to grid view"
            >
              <Target className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="List View"
              aria-label="Switch to list view"
            >
              <BarChart3 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="Filter by status"
            aria-label="Filter campaigns by status"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="Filter by type"
            aria-label="Filter campaigns by type"
          >
            <option value="all">All Types</option>
            <option value="percentage">Percentage</option>
            <option value="fixed_amount">Fixed Amount</option>
            <option value="bogo">BOGO</option>
            <option value="free_shipping">Free Shipping</option>
            <option value="loyalty_points">Loyalty Points</option>
          </select>
          
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Settings className="h-4 w-4" />
            Templates
          </button>
          
          <button
            onClick={onPromotionCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Campaign
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{promotions.length}</p>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{promotions.filter(p => p.status === 'active').length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(promotions.reduce((sum, p) => sum + p.performance.revenue, 0))}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg ROI</p>
              <p className="text-2xl font-bold text-gray-900">
                {promotions.length > 0 ? 
                  formatPercentage(promotions.reduce((sum, p) => sum + p.performance.roi, 0) / promotions.length) : 
                  '0%'
                }
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Campaigns List/Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredPromotions.map((promotion) => (
            <div
              key={promotion.id}
              className={`rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer ${
                viewMode === 'grid' ? 'p-6' : 'p-4 flex items-center justify-between'
              }`}
              style={{ backgroundColor: '#F7F2EC' }}
            >
              {viewMode === 'grid' ? (
                <>
                  {/* Grid View */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getTypeIcon(promotion.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{promotion.name}</h3>
                        <p className="text-sm text-gray-600">{promotion.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(promotion.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(promotion.status)}`}>
                        {promotion.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Value</span>
                      <span className="font-semibold text-gray-900">
                        {promotion.type === 'percentage' ? `${promotion.value}%` : 
                         promotion.type === 'fixed_amount' ? formatCurrency(promotion.value) :
                         promotion.type === 'bogo' ? 'BOGO' :
                         promotion.type === 'free_shipping' ? 'Free Shipping' :
                         `${promotion.value} Points`}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Uses</span>
                      <span className="font-semibold text-gray-900">{promotion.performance.totalUses}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Revenue</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(promotion.performance.revenue)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">ROI</span>
                      <span className="font-semibold text-gray-900">{formatPercentage(promotion.performance.roi)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onPromotionAction('view', promotion.id)}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onPromotionAction('copy', promotion.id)}
                        className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                        title="Copy Campaign"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onPromotionUpdate(promotion)}
                        className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                        title="Edit Campaign"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* List View */}
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {getTypeIcon(promotion.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{promotion.name}</h3>
                        {getStatusIcon(promotion.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(promotion.status)}`}>
                          {promotion.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{promotion.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Value</p>
                      <p className="font-semibold text-gray-900">
                        {promotion.type === 'percentage' ? `${promotion.value}%` : 
                         promotion.type === 'fixed_amount' ? formatCurrency(promotion.value) :
                         promotion.type === 'bogo' ? 'BOGO' :
                         promotion.type === 'free_shipping' ? 'Free Shipping' :
                         `${promotion.value} Points`}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Uses</p>
                      <p className="font-semibold text-gray-900">{promotion.performance.totalUses}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Revenue</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(promotion.performance.revenue)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">ROI</p>
                      <p className="font-semibold text-gray-900">{formatPercentage(promotion.performance.roi)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onPromotionAction('view', promotion.id)}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onPromotionAction('copy', promotion.id)}
                        className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                        title="Copy Campaign"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onPromotionUpdate(promotion)}
                        className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                        title="Edit Campaign"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Campaign Templates</h2>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Template cards would go here */}
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Templates Coming Soon</h3>
                  <p className="text-gray-600">Pre-built campaign templates will be available here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignsTab;
