import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Percent,
  DollarSign,
  Gift,
  Users,
  Target,
  BarChart3,
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
  Star,
  Tag,
  ShoppingCart,
  Mail,
  Share2,
  Settings,
  MoreHorizontal,
  Lightbulb,
  Brain
} from 'lucide-react';
import { Link } from 'wouter';
import PromotionCreateModal from '../components/promotions/PromotionCreateModal';
import ABTestManager from '../components/promotions/ABTestManager';
import CustomerSegmentation from '../components/promotions/CustomerSegmentation';
import CampaignManager from '../components/promotions/CampaignManager';
import EmailCampaign from '../components/promotions/EmailCampaign';
import SocialMediaCampaign from '../components/promotions/SocialMediaCampaign';
import CampaignScheduler from '../components/promotions/CampaignScheduler';
import PromotionAnalytics from '../components/promotions/PromotionAnalytics';
import ROIAnalysis from '../components/promotions/ROIAnalysis';
import ConversionOptimization from '../components/promotions/ConversionOptimization';
import AutomatedRecommendations from '../components/promotions/AutomatedRecommendations';
import LoyaltyPrograms from '../components/promotions/LoyaltyPrograms';
import ReferralSystem from '../components/promotions/ReferralSystem';
import DynamicPricing from '../components/promotions/DynamicPricing';
import AIPersonalization from '../components/promotions/AIPersonalization';

// Types
interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed_amount' | 'bogo' | 'free_shipping' | 'loyalty_points';
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  status: 'draft' | 'active' | 'paused' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  targetType: 'all_customers' | 'new_customers' | 'returning_customers' | 'vip_customers' | 'segment';
  targetSegment?: string;
  productCategories: string[];
  excludedProducts: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  performance: {
    totalUses: number;
    totalDiscount: number;
    conversionRate: number;
    revenue: number;
    roi: number;
  };
}

interface PromotionTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  isPopular: boolean;
}

// Mock data
const dummyPromotions: Promotion[] = [
  {
    id: '1',
    name: 'New Customer Welcome',
    description: '20% off first order for new customers',
    type: 'percentage',
    value: 20,
    minOrderAmount: 50,
    maxDiscountAmount: 100,
    usageLimit: 1000,
    usageCount: 234,
    status: 'active',
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-12-31T23:59:59Z',
    targetType: 'new_customers',
    productCategories: ['all'],
    excludedProducts: [],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
    createdBy: 'admin',
    performance: {
      totalUses: 234,
      totalDiscount: 4680,
      conversionRate: 12.5,
      revenue: 18720,
      roi: 300
    }
  },
  {
    id: '2',
    name: 'Holiday Sale',
    description: '$10 off orders over $75',
    type: 'fixed_amount',
    value: 10,
    minOrderAmount: 75,
    usageLimit: 500,
    usageCount: 89,
    status: 'active',
    startDate: '2025-01-15T00:00:00Z',
    endDate: '2025-01-31T23:59:59Z',
    targetType: 'all_customers',
    productCategories: ['baked-goods', 'desserts'],
    excludedProducts: [],
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
    createdBy: 'admin',
    performance: {
      totalUses: 89,
      totalDiscount: 890,
      conversionRate: 8.2,
      revenue: 4450,
      roi: 400
    }
  },
  {
    id: '3',
    name: 'Buy 2 Get 1 Free',
    description: 'Buy 2 items, get 1 free (lowest price)',
    type: 'bogo',
    value: 1,
    minOrderAmount: 0,
    usageLimit: 200,
    usageCount: 45,
    status: 'paused',
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-03-31T23:59:59Z',
    targetType: 'all_customers',
    productCategories: ['cookies', 'pastries'],
    excludedProducts: [],
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2025-01-20T00:00:00Z',
    createdBy: 'admin',
    performance: {
      totalUses: 45,
      totalDiscount: 675,
      conversionRate: 15.3,
      revenue: 2700,
      roi: 300
    }
  }
];

const promotionTemplates: PromotionTemplate[] = [
  {
    id: '1',
    name: 'New Customer Welcome',
    description: 'Welcome discount for first-time customers',
    type: 'percentage',
    category: 'acquisition',
    isPopular: true
  },
  {
    id: '2',
    name: 'Holiday Sale',
    description: 'Seasonal promotion template',
    type: 'fixed_amount',
    category: 'seasonal',
    isPopular: true
  },
  {
    id: '3',
    name: 'BOGO Offer',
    description: 'Buy one get one free promotion',
    type: 'bogo',
    category: 'volume',
    isPopular: false
  },
  {
    id: '4',
    name: 'Free Shipping',
    description: 'Free shipping on orders over amount',
    type: 'free_shipping',
    category: 'shipping',
    isPopular: true
  },
  {
    id: '5',
    name: 'Loyalty Rewards',
    description: 'Points-based reward system',
    type: 'loyalty_points',
    category: 'retention',
    isPopular: false
  }
];

const VendorPromotionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPromotions, setSelectedPromotions] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [activeTab, setActiveTab] = useState<'promotions' | 'ab-tests' | 'segments' | 'campaigns' | 'email' | 'social' | 'scheduler' | 'analytics' | 'roi' | 'conversion' | 'recommendations' | 'loyalty' | 'referrals' | 'pricing' | 'personalization'>('promotions');
  const [showABTestModal, setShowABTestModal] = useState(false);
  const [showSegmentModal, setShowSegmentModal] = useState(false);

  // Mock data - in real app, this would come from API
  const { data: promotions = dummyPromotions, isLoading } = useQuery({
    queryKey: ['promotions'],
    queryFn: () => Promise.resolve(dummyPromotions),
  });

  const queryClient = useQueryClient();

  // Filter promotions
  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promotion.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || promotion.status === statusFilter;
    const matchesType = typeFilter === 'all' || promotion.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Helper functions
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  const formatPercentage = (value: number) => `${value}%`;

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

  const handleSelectPromotion = (promotionId: string) => {
    setSelectedPromotions(prev => 
      prev.includes(promotionId) 
        ? prev.filter(id => id !== promotionId)
        : [...prev, promotionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPromotions.length === filteredPromotions.length) {
      setSelectedPromotions([]);
    } else {
      setSelectedPromotions(filteredPromotions.map(p => p.id));
    }
  };

  const handlePromotionAction = (action: string, promotionId: string) => {
    console.log(`${action} promotion ${promotionId}`);
    // Implement promotion actions
  };

  const handleBulkAction = (action: string) => {
    console.log(`${action} selected promotions:`, selectedPromotions);
    // Implement bulk actions
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Promotions</h1>
              <p className="text-gray-600 mt-2">Create and manage promotional campaigns, discounts, and customer incentives</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowTemplateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                title="Browse templates"
              >
                <Settings className="h-4 w-4" />
                <span>Templates</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Create new promotion"
              >
                <Plus className="h-4 w-4" />
                <span>New Promotion</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('promotions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'promotions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4" />
                  <span>Promotions</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('ab-tests')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'ab-tests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>A/B Testing</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('segments')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'segments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Segments</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'campaigns'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>Campaigns</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'email'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('social')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'social'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Share2 className="h-4 w-4" />
                  <span>Social</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('scheduler')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'scheduler'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Scheduler</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('roi')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'roi'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>ROI</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('conversion')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'conversion'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>Conversion</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'recommendations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4" />
                  <span>Recommendations</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('loyalty')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'loyalty'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4" />
                  <span>Loyalty</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('referrals')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'referrals'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Share2 className="h-4 w-4" />
                  <span>Referrals</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('pricing')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'pricing'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Pricing</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('personalization')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'personalization'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4" />
                  <span>AI</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'promotions' && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Tag className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Promotions</p>
                <p className="text-2xl font-bold text-gray-900">{promotions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {promotions.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Uses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {promotions.reduce((sum, p) => sum + p.performance.totalUses, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Discount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(promotions.reduce((sum, p) => sum + p.performance.totalDiscount, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search promotions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="draft">Draft</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Filter by type"
              >
                <option value="all">All Types</option>
                <option value="percentage">Percentage</option>
                <option value="fixed_amount">Fixed Amount</option>
                <option value="bogo">BOGO</option>
                <option value="free_shipping">Free Shipping</option>
                <option value="loyalty_points">Loyalty Points</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Grid view"
              >
                <BarChart3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="List view"
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Promotions Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPromotions.map((promotion) => (
              <div key={promotion.id} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-200">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(promotion.type)}
                      <h3 className="text-lg font-semibold text-gray-900">{promotion.name}</h3>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(promotion.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(promotion.status)}`}>
                        {promotion.status}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4">{promotion.description}</p>

                  {/* Value */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-2xl font-bold text-blue-600">
                      {promotion.type === 'percentage' ? formatPercentage(promotion.value) : formatCurrency(promotion.value)}
                    </span>
                    {promotion.minOrderAmount && (
                      <span className="text-sm text-gray-500">
                        on orders over {formatCurrency(promotion.minOrderAmount)}
                      </span>
                    )}
                  </div>

                  {/* Performance */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Uses</p>
                      <p className="text-sm font-semibold">{promotion.performance.totalUses}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">ROI</p>
                      <p className="text-sm font-semibold text-green-600">{promotion.performance.roi}%</p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="text-xs text-gray-500 mb-4">
                    <p>Start: {formatDate(promotion.startDate)}</p>
                    <p>End: {formatDate(promotion.endDate)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingPromotion(promotion)}
                        className="text-gray-600 hover:text-blue-600"
                        title="Edit promotion"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePromotionAction('copy', promotion.id)}
                        className="text-gray-600 hover:text-green-600"
                        title="Copy promotion"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePromotionAction('view', promotion.id)}
                        className="text-gray-600 hover:text-purple-600"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600" title="More options">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedPromotions.length === filteredPromotions.length && filteredPromotions.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        title="Select all promotions"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Promotion</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPromotions.map((promotion) => (
                    <tr key={promotion.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedPromotions.includes(promotion.id)}
                          onChange={() => handleSelectPromotion(promotion.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          title={`Select promotion ${promotion.name}`}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getTypeIcon(promotion.type)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{promotion.name}</div>
                            <div className="text-sm text-gray-500">{promotion.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">{promotion.type.replace('_', ' ')}</div>
                        <div className="text-sm text-gray-500">
                          {promotion.type === 'percentage' ? formatPercentage(promotion.value) : formatCurrency(promotion.value)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(promotion.status)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(promotion.status)}`}>
                            {promotion.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{promotion.performance.totalUses} uses</div>
                        <div className="text-sm text-green-600">{promotion.performance.roi}% ROI</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(promotion.startDate)}</div>
                        <div className="text-sm text-gray-500">to {formatDate(promotion.endDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingPromotion(promotion)}
                            className="text-gray-600 hover:text-blue-600"
                            title="Edit promotion"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handlePromotionAction('copy', promotion.id)}
                            className="text-gray-600 hover:text-green-600"
                            title="Copy promotion"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handlePromotionAction('view', promotion.id)}
                            className="text-gray-600 hover:text-purple-600"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedPromotions.length > 0 && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {selectedPromotions.length} promotion{selectedPromotions.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('pause')}
                  className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                >
                  Pause
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredPromotions.length === 0 && (
          <div className="text-center py-12">
            <Tag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No promotions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first promotion.'}
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Promotion
              </button>
            </div>
          </div>
        )}
          </>
        )}

        {/* A/B Testing Tab */}
        {activeTab === 'ab-tests' && (
          <ABTestManager />
        )}

        {/* Customer Segments Tab */}
        {activeTab === 'segments' && (
          <CustomerSegmentation />
        )}

        {/* Campaign Management Tab */}
        {activeTab === 'campaigns' && (
          <CampaignManager />
        )}

        {/* Email Campaigns Tab */}
        {activeTab === 'email' && (
          <EmailCampaign />
        )}

        {/* Social Media Campaigns Tab */}
        {activeTab === 'social' && (
          <SocialMediaCampaign />
        )}

        {/* Campaign Scheduler Tab */}
        {activeTab === 'scheduler' && (
          <CampaignScheduler />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <PromotionAnalytics />
        )}

        {/* ROI Analysis Tab */}
        {activeTab === 'roi' && (
          <ROIAnalysis />
        )}

        {/* Conversion Optimization Tab */}
        {activeTab === 'conversion' && (
          <ConversionOptimization />
        )}

        {/* Automated Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <AutomatedRecommendations />
        )}

        {/* Loyalty Programs Tab */}
        {activeTab === 'loyalty' && (
          <LoyaltyPrograms />
        )}

        {/* Referral System Tab */}
        {activeTab === 'referrals' && (
          <ReferralSystem />
        )}

        {/* Dynamic Pricing Tab */}
        {activeTab === 'pricing' && (
          <DynamicPricing />
        )}

        {/* AI Personalization Tab */}
        {activeTab === 'personalization' && (
          <AIPersonalization />
        )}

        {/* Modals */}
        {showCreateModal && (
          <PromotionCreateModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSave={(promotion) => {
              console.log('Save promotion:', promotion);
              setShowCreateModal(false);
            }}
          />
        )}

        {editingPromotion && (
          <PromotionCreateModal
            isOpen={!!editingPromotion}
            onClose={() => setEditingPromotion(null)}
            onSave={(promotion) => {
              console.log('Update promotion:', promotion);
              setEditingPromotion(null);
            }}
            template={editingPromotion}
          />
        )}
      </div>
    </div>
  );
};

export default VendorPromotionsPage;
