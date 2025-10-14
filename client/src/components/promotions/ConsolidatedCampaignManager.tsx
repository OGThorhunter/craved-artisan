import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  X,
  Zap
} from 'lucide-react';

// Consolidated types based on the new database models
interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: 'PROMOTIONAL' | 'SEASONAL' | 'PRODUCT_LAUNCH' | 'CLEARANCE' | 'LOYALTY' | 'REFERRAL';
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  targetAudience?: any;
  budget?: number;
  createdAt: string;
  updatedAt: string;
  promotions?: Promotion[];
  socialPosts?: SocialMediaPost[];
  analytics?: CampaignAnalytics[];
  _count?: {
    promotions: number;
    socialPosts: number;
  };
}

interface Promotion {
  id: string;
  campaignId?: string;
  name: string;
  description?: string;
  type: 'DISCOUNT_CODE' | 'AUTOMATIC_DISCOUNT' | 'BOGO' | 'FREE_SHIPPING' | 'LOYALTY_BONUS' | 'REFERRAL_REWARD';
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING' | 'BUY_X_GET_Y';
  discountValue: number;
  code?: string;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  currentUses: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableProducts?: string[];
  customerSegments?: string[];
  createdAt: string;
  updatedAt: string;
  campaign?: Campaign;
  analytics?: PromotionAnalytics[];
  usageHistory?: PromotionUsage[];
  _count?: {
    usageHistory: number;
  };
}

interface SocialMediaPost {
  id: string;
  campaignId?: string;
  content: string;
  platforms: string[];
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED';
  scheduledAt?: string;
  publishedAt?: string;
  hashtags?: string[];
  productTags?: string[];
  location?: string;
  mediaUrls?: string[];
  engagementData?: any;
  createdAt: string;
  updatedAt: string;
}

interface CampaignAnalytics {
  id: string;
  campaignId: string;
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  cost: number;
  reach: number;
  engagement: number;
}

interface PromotionAnalytics {
  id: string;
  promotionId: string;
  date: string;
  views: number;
  uses: number;
  revenue: number;
  discountGiven: number;
  conversionRate: number;
}

interface PromotionUsage {
  id: string;
  promotionId: string;
  userId: string;
  orderId?: string;
  usedAt: string;
  discountAmount: number;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

interface ConsolidatedCampaignManagerProps {
  // Removed duplicate props, consolidated into single interface
}

const ConsolidatedCampaignManager: React.FC<ConsolidatedCampaignManagerProps> = () => {
  // Consolidated state management
  const [activeView, setActiveView] = useState<'campaigns' | 'promotions'>('campaigns');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Campaign | Promotion | null>(null);

  const queryClient = useQueryClient();

  // Consolidated API calls to reduce redundancy
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await fetch('/api/vendor/promotions/campaigns');
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      const result = await response.json();
      return result.data || [];
    }
  });

  const { data: promotions, isLoading: promotionsLoading } = useQuery({
    queryKey: ['promotions'],
    queryFn: async () => {
      const response = await fetch('/api/vendor/promotions');
      if (!response.ok) throw new Error('Failed to fetch promotions');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Consolidated mutations
  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: Partial<Campaign>) => {
      const response = await fetch('/api/vendor/promotions/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      });
      if (!response.ok) throw new Error('Failed to create campaign');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setShowCreateModal(false);
    }
  });

  const createPromotionMutation = useMutation({
    mutationFn: async (promotionData: Partial<Promotion>) => {
      const response = await fetch('/api/vendor/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promotionData)
      });
      if (!response.ok) throw new Error('Failed to create promotion');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      setShowCreateModal(false);
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data, type }: { id: string; data: any; type: 'campaign' | 'promotion' }) => {
      const endpoint = type === 'campaign' ? `/api/vendor/promotions/campaigns/${id}` : `/api/vendor/promotions/${id}`;
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`Failed to update ${type}`);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.type === 'campaign' ? 'campaigns' : 'promotions'] });
      setShowEditModal(false);
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: 'campaign' | 'promotion' }) => {
      const endpoint = type === 'campaign' ? `/api/vendor/promotions/campaigns/${id}` : `/api/vendor/promotions/${id}`;
      const response = await fetch(endpoint, { method: 'DELETE' });
      if (!response.ok) throw new Error(`Failed to delete ${type}`);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.type === 'campaign' ? 'campaigns' : 'promotions'] });
    }
  });

  const togglePromotionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/vendor/promotions/${id}/toggle`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to toggle promotion');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    }
  });

  // Consolidated filtering logic
  const getFilteredItems = () => {
    const items = activeView === 'campaigns' ? campaigns || [] : promotions || [];
    
    return items.filter((item: any) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || 
                           (activeView === 'campaigns' ? item.status === statusFilter.toUpperCase() : 
                            statusFilter === 'active' ? item.isActive : !item.isActive);
      
      const matchesType = typeFilter === 'all' || item.type === typeFilter.toUpperCase();
      
      return matchesSearch && matchesStatus && matchesType;
    });
  };

  // Consolidated handlers
  const handleCreate = () => {
    setSelectedItem(null);
    setShowCreateModal(true);
  };

  const handleEdit = (item: Campaign | Promotion) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleDelete = (item: Campaign | Promotion) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      deleteItemMutation.mutate({ 
        id: item.id, 
        type: activeView === 'campaigns' ? 'campaign' : 'promotion' 
      });
    }
  };

  const handleTogglePromotion = (promotion: Promotion) => {
    togglePromotionMutation.mutate(promotion.id);
  };

  const handleViewDetails = (item: Campaign | Promotion) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const filteredItems = getFilteredItems();
    setSelectedItems(
      selectedItems.length === filteredItems.length ? [] : filteredItems.map((item: any) => item.id)
    );
  };

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'delete':
        if (confirm(`Delete ${selectedItems.length} items?`)) {
          selectedItems.forEach(id => {
            deleteItemMutation.mutate({ 
              id, 
              type: activeView === 'campaigns' ? 'campaign' : 'promotion' 
            });
          });
          setSelectedItems([]);
        }
        break;
      case 'activate':
        if (activeView === 'promotions') {
          // Bulk activate promotions
          selectedItems.forEach(id => togglePromotionMutation.mutate(id));
          setSelectedItems([]);
        }
        break;
    }
  };

  // Consolidated rendering functions
  const renderCampaignCard = (campaign: Campaign) => (
    <div key={campaign.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedItems.includes(campaign.id)}
            onChange={() => handleSelectItem(campaign.id)}
            className="rounded"
            aria-label={`Select campaign ${campaign.name}`}
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
            <p className="text-sm text-gray-600">{campaign.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
            {campaign.status}
          </span>
          <div className="relative">
            <button 
              className="p-1 hover:bg-gray-100 rounded"
              title="Campaign options"
              aria-label="Campaign options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Type:</span>
          <span className="ml-1 font-medium">{campaign.type}</span>
        </div>
        <div>
          <span className="text-gray-500">Budget:</span>
          <span className="ml-1 font-medium">${campaign.budget?.toLocaleString() || 'N/A'}</span>
        </div>
        <div>
          <span className="text-gray-500">Promotions:</span>
          <span className="ml-1 font-medium">{campaign._count?.promotions || 0}</span>
        </div>
        <div>
          <span className="text-gray-500">Social Posts:</span>
          <span className="ml-1 font-medium">{campaign._count?.socialPosts || 0}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewDetails(campaign)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(campaign)}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(campaign)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderPromotionCard = (promotion: Promotion) => (
    <div key={promotion.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedItems.includes(promotion.id)}
            onChange={() => handleSelectItem(promotion.id)}
            className="rounded"
            aria-label={`Select promotion ${promotion.name}`}
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{promotion.name}</h3>
            <p className="text-sm text-gray-600">{promotion.description}</p>
            {promotion.code && (
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">{promotion.code}</code>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${promotion.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {promotion.isActive ? 'Active' : 'Inactive'}
          </span>
          <button
            onClick={() => handleTogglePromotion(promotion)}
            className={`p-1 rounded ${promotion.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
            title={promotion.isActive ? 'Deactivate' : 'Activate'}
          >
            {promotion.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Type:</span>
          <span className="ml-1 font-medium">{promotion.type}</span>
        </div>
        <div>
          <span className="text-gray-500">Discount:</span>
          <span className="ml-1 font-medium">
            {promotion.discountType === 'PERCENTAGE' ? `${promotion.discountValue}%` : 
             promotion.discountType === 'FIXED_AMOUNT' ? `$${promotion.discountValue}` : 
             'Free Shipping'}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Uses:</span>
          <span className="ml-1 font-medium">{promotion.currentUses}{promotion.usageLimit && `/${promotion.usageLimit}`}</span>
        </div>
        <div>
          <span className="text-gray-500">Min Order:</span>
          <span className="ml-1 font-medium">${promotion.minOrderAmount || 0}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {new Date(promotion.startDate).toLocaleDateString()} - {new Date(promotion.endDate).toLocaleDateString()}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewDetails(promotion)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(promotion)}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(promotion)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isLoading = activeView === 'campaigns' ? campaignsLoading : promotionsLoading;
  const filteredItems = getFilteredItems();

  return (
    <div className="space-y-6">
      {/* Consolidated Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {activeView === 'campaigns' ? 'Campaigns' : 'Promotions'}
          </h1>
          <p className="text-gray-600">
            {activeView === 'campaigns' 
              ? 'Manage your promotional campaigns and track their performance'
              : 'Create and manage discount codes and promotional offers'
            }
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create {activeView === 'campaigns' ? 'Campaign' : 'Promotion'}</span>
        </button>
      </div>

      {/* Consolidated Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveView('campaigns')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'campaigns'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Campaigns</span>
            </div>
          </button>
          <button
            onClick={() => setActiveView('promotions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'promotions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Percent className="w-4 h-4" />
              <span>Promotions</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Consolidated Filters and Controls */}
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Search ${activeView}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label={`Search ${activeView}`}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            {activeView === 'campaigns' ? (
              <>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </>
            ) : (
              <>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </>
            )}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="Filter by type"
            aria-label="Filter by type"
          >
            <option value="all">All Types</option>
            {activeView === 'campaigns' ? (
              <>
                <option value="promotional">Promotional</option>
                <option value="seasonal">Seasonal</option>
                <option value="product_launch">Product Launch</option>
                <option value="clearance">Clearance</option>
              </>
            ) : (
              <>
                <option value="discount_code">Discount Code</option>
                <option value="automatic_discount">Automatic</option>
                <option value="bogo">BOGO</option>
                <option value="free_shipping">Free Shipping</option>
              </>
            )}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          {selectedItems.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{selectedItems.length} selected</span>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Delete
              </button>
              {activeView === 'promotions' && (
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Toggle
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Consolidated Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {activeView === 'campaigns' ? <Target className="w-8 h-8 text-gray-400" /> : <Percent className="w-8 h-8 text-gray-400" />}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No {activeView} found
          </h3>
          <p className="text-gray-600 mb-4">
            Get started by creating your first {activeView.slice(0, -1)}.
          </p>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create {activeView === 'campaigns' ? 'Campaign' : 'Promotion'}
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedItems.length === filteredItems.length}
                onChange={handleSelectAll}
                className="rounded"
                title="Select all items"
                aria-label="Select all items"
              />
              <span className="text-sm text-gray-600">
                {filteredItems.length} {activeView}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item: any) => 
              activeView === 'campaigns' ? renderCampaignCard(item) : renderPromotionCard(item)
            )}
          </div>
        </>
      )}

      {/* Consolidated Modals would be added here */}
    </div>
  );
};

export default ConsolidatedCampaignManager;
