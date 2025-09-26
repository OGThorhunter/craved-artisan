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
  X,
  Zap
} from 'lucide-react';

// Types
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

interface CampaignsTabProps {
  promotions: Promotion[];
  onPromotionCreate: () => void;
  onPromotionUpdate: (promotion: Promotion) => void;
  onPromotionDelete: (id: string) => void;
  onPromotionAction: (action: string, id: string) => void;
  onTemplateSelect: (templateId: string) => void;
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
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCustomTemplateEditor, setShowCustomTemplateEditor] = useState(false);
  const [showCampaignCreationModal, setShowCampaignCreationModal] = useState(false);
  const [showCampaignDetailsModal, setShowCampaignDetailsModal] = useState(false); // New state for campaign details
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null); // New state for selected campaign
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // New state for delete confirmation
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null); // New state for campaign to delete
  const [showEditModal, setShowEditModal] = useState(false); // New state for edit modal
  const [campaignToEdit, setCampaignToEdit] = useState<any>(null); // New state for campaign to edit
  const [editCampaign, setEditCampaign] = useState<any>(null); // New state for edit form data
  const [templateCategory, setTemplateCategory] = useState('all');
  const [templateSearch, setTemplateSearch] = useState('');
  const [customTemplate, setCustomTemplate] = useState({
    name: '',
    description: '',
    category: 'custom',
    type: 'percentage',
    value: 0,
    conditions: '',
    targetAudience: 'all'
  });
  const [campaignCreationMode, setCampaignCreationMode] = useState<'template' | 'custom'>('template');
  const [selectedTemplateForCampaign, setSelectedTemplateForCampaign] = useState<any>(null);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    type: 'percentage',
    value: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    targetAudience: 'all',
    conditions: ''
  });
  const [savedCustomTemplates, setSavedCustomTemplates] = useState<any[]>(() => {
    // Load saved templates from localStorage on component mount
    try {
      const saved = localStorage.getItem('customTemplates');
      const parsed = saved ? JSON.parse(saved) : [];
      // Restore icon components for custom templates
      return parsed.map((template: any) => ({
        ...template,
        icon: Settings // Use Settings icon for all custom templates
      }));
    } catch (error) {
      console.error('Error loading custom templates:', error);
      return [];
    }
  });

  // Template data
  const templates = [
    {
      id: 'black-friday-blitz',
      name: 'Black Friday Blitz',
      category: 'seasonal',
      description: 'High-converting Black Friday campaign with urgency messaging and countdown timers.',
      rating: 4.8,
      uses: '2.3k',
      icon: Gift,
      color: 'red'
    },
    {
      id: 'flash-sale-frenzy',
      name: 'Flash Sale Frenzy',
      category: 'flash-sales',
      description: 'Create urgency with limited-time offers and scarcity messaging.',
      rating: 4.6,
      uses: '1.8k',
      icon: Zap,
      color: 'orange'
    },
    {
      id: 'vip-rewards',
      name: 'VIP Rewards',
      category: 'loyalty',
      description: 'Exclusive rewards for your most valuable customers with tier-based benefits.',
      rating: 4.9,
      uses: '3.1k',
      icon: Star,
      color: 'purple'
    },
    {
      id: 'product-launch',
      name: 'Product Launch',
      category: 'product-launch',
      description: 'Build anticipation for new products with pre-launch campaigns and early access.',
      rating: 4.7,
      uses: '1.5k',
      icon: Target,
      color: 'green'
    },
    {
      id: 'holiday-special',
      name: 'Holiday Special',
      category: 'seasonal',
      description: 'Festive campaigns for holidays with gift guides and special offers.',
      rating: 4.5,
      uses: '2.7k',
      icon: Calendar,
      color: 'blue'
    },
    {
      id: 'bogo-bonanza',
      name: 'BOGO Bonanza',
      category: 'flash-sales',
      description: 'Buy one get one free campaigns that drive volume and customer acquisition.',
      rating: 4.4,
      uses: '1.9k',
      icon: Percent,
      color: 'pink'
    }
  ];

  // Function to save templates to localStorage
  const saveTemplatesToStorage = (templates: any[]) => {
    try {
      // Remove icon property before saving (can't serialize React components)
      const templatesForStorage = templates.map(({ icon, ...template }) => template);
      localStorage.setItem('customTemplates', JSON.stringify(templatesForStorage));
      console.log('Templates saved to localStorage:', templatesForStorage);
    } catch (error) {
      console.error('Error saving templates to localStorage:', error);
    }
  };

  // Function to handle campaign view
  const handleCampaignView = (campaignId: string) => {
    const campaign = promotions.find(p => p.id === campaignId);
    if (campaign) {
      setSelectedCampaign(campaign);
      setShowCampaignDetailsModal(true);
    }
  };

  // Function to handle campaign delete
  const handleCampaignDelete = (campaignId: string) => {
    setCampaignToDelete(campaignId);
    setShowDeleteConfirm(true);
  };

  // Function to confirm campaign delete
  const confirmDelete = () => {
    if (campaignToDelete) {
      onPromotionDelete(campaignToDelete);
      setShowDeleteConfirm(false);
      setCampaignToDelete(null);
    }
  };

  // Function to cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setCampaignToDelete(null);
  };

  // Function to handle campaign copy
  const handleCampaignCopy = (campaignId: string) => {
    const campaign = promotions.find(p => p.id === campaignId);
    if (campaign) {
      // Create a copy of the campaign with a new name and ID
      const copiedCampaign = {
        ...campaign,
        id: `campaign-${Date.now()}`,
        name: `${campaign.name} (Copy)`,
        status: 'draft' as const,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        performance: {
          totalUses: 0,
          totalDiscount: 0,
          conversionRate: 0,
          revenue: 0,
          roi: 0
        }
      };
      
      console.log('Copying campaign:', copiedCampaign);
      onPromotionCreate(copiedCampaign);
    }
  };

  // Function to handle campaign edit
  const handleCampaignEdit = (campaignId: string) => {
    const campaign = promotions.find(p => p.id === campaignId);
    if (campaign) {
      setCampaignToEdit(campaign);
      setEditCampaign({
        ...campaign,
        startDate: campaign.startDate.split('T')[0], // Convert ISO to date input format
        endDate: campaign.endDate.split('T')[0]
      });
      setShowEditModal(true);
    }
  };

  // Function to save campaign edits
  const handleSaveEdit = () => {
    if (!editCampaign.name || !editCampaign.description) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Validate date range
    if (new Date(editCampaign.endDate) <= new Date(editCampaign.startDate)) {
      alert('End date must be after start date');
      return;
    }

    const updatedCampaign = {
      ...editCampaign,
      startDate: new Date(editCampaign.startDate).toISOString(),
      endDate: new Date(editCampaign.endDate).toISOString()
    };

    console.log('Saving campaign edit:', updatedCampaign);
    onPromotionUpdate(updatedCampaign);
    setShowEditModal(false);
    setCampaignToEdit(null);
    setEditCampaign(null);
  };

  // Function to cancel edit
  const handleCancelEdit = () => {
    setShowEditModal(false);
    setCampaignToEdit(null);
    setEditCampaign(null);
  };

  // Function to handle template usage
  const handleTemplateUse = (templateId: string) => {
    console.log(`Using template: ${templateId}`);
    
    // Find the template (either built-in or custom)
    const selectedTemplate = allTemplates.find(t => t.id === templateId);
    
    if (selectedTemplate) {
      console.log('Selected template:', selectedTemplate);
      
      // If it's a custom template, increment usage count
      if (selectedTemplate.isCustom) {
        const updatedTemplates = savedCustomTemplates.map(t => 
          t.id === templateId 
            ? { ...t, uses: (parseInt(t.uses) + 1).toString() }
            : t
        );
        setSavedCustomTemplates(updatedTemplates);
        saveTemplatesToStorage(updatedTemplates);
        console.log(`Template usage incremented: ${templateId}`);
      }
      
      // Create a new campaign using the template
      const newCampaign = {
        id: `campaign-${Date.now()}`,
        name: `${selectedTemplate.name} Campaign`,
        description: selectedTemplate.description,
        type: selectedTemplate.type || 'percentage',
        value: selectedTemplate.value || 0,
        status: 'draft' as const,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        performance: {
          totalUses: 0,
          totalDiscount: 0,
          conversionRate: 0,
          revenue: 0,
          roi: 0
        },
        templateId: templateId,
        templateName: selectedTemplate.name,
        createdAt: new Date().toISOString()
      };
      
      console.log('Creating new campaign from template:', newCampaign);
      
      // Call the promotion creation callback to add the new campaign
      onPromotionCreate(newCampaign);
      
      // Show success message (you could replace this with a toast notification)
      alert(`Campaign "${newCampaign.name}" created successfully from template "${selectedTemplate.name}"!`);
    }
    
    // Close the template modal
    setShowTemplateModal(false);
  };

  // Combine built-in templates with saved custom templates
  const allTemplates = [...templates, ...savedCustomTemplates];

  // Filter templates based on category and search
  const filteredTemplates = allTemplates.filter(template => {
    const matchesCategory = templateCategory === 'all' || template.category === templateCategory;
    const matchesSearch = templateSearch === '' ||
      template.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      template.description.toLowerCase().includes(templateSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filter promotions based on search and filters - only show active/open campaigns
  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promotion.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || promotion.status === statusFilter;
    const matchesType = typeFilter === 'all' || promotion.type === typeFilter;
    
    // Only show active/open campaigns (not closed, expired, or cancelled)
    const isActiveOrOpen = ['active', 'draft', 'paused'].includes(promotion.status);
    
    return matchesSearch && matchesStatus && matchesType && isActiveOrOpen;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{promotions.filter(p => ['active', 'draft', 'paused'].includes(p.status)).length}</p>
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
              <p className="text-sm font-medium text-gray-600">Active Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(promotions.filter(p => p.status === 'active').reduce((sum, p) => sum + p.performance.revenue, 0))}
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
                {promotions.filter(p => p.status === 'active').length > 0 
                  ? formatPercentage(promotions.filter(p => p.status === 'active').reduce((sum, p) => sum + p.performance.roi, 0) / promotions.filter(p => p.status === 'active').length)
                  : '0%'
                }
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search open campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="Filter by status"
            aria-label="Filter campaigns by status"
          >
            <option value="all">All Open Campaigns</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="paused">Paused</option>
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
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
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

          <button
            onClick={() => {
              console.log('Templates button clicked');
              setShowTemplateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Settings className="h-4 w-4" />
            Templates
          </button>
          <button
            onClick={() => {
              console.log('New Campaign button clicked');
              setShowCampaignCreationModal(true);
              setCampaignCreationMode('template');
              setSelectedTemplateForCampaign(null);
              setNewCampaign({
                name: '',
                description: '',
                type: 'percentage',
                value: 0,
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                targetAudience: 'all',
                conditions: ''
              });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Create new campaign"
            aria-label="Create new campaign"
          >
            <Plus className="h-4 w-4" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Open Campaigns & Promotions</h2>
          <p className="text-sm text-gray-600">Manage your active campaigns, promotions, and discount codes</p>
        </div>
        <div className="text-sm text-gray-500">
          Showing {filteredPromotions.length} of {promotions.filter(p => ['active', 'draft', 'paused'].includes(p.status)).length} open campaigns
        </div>
      </div>

      {/* Promotions List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredPromotions.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Open Campaigns</h3>
            <p className="text-gray-600 mb-4">You don't have any active campaigns, promotions, or discount codes at the moment.</p>
            <button
              onClick={() => {
                console.log('New Campaign button clicked from empty state');
                setShowCampaignCreationModal(true);
                setCampaignCreationMode('template');
                setSelectedTemplateForCampaign(null);
                setNewCampaign({
                  name: '',
                  description: '',
                  type: 'percentage',
                  value: 0,
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  targetAudience: 'all',
                  conditions: ''
                });
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Your First Campaign
            </button>
          </div>
        ) : (
          filteredPromotions.map((promotion) => (
            <div
              key={promotion.id}
              className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
              style={{ backgroundColor: '#F7F2EC' }}
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Target className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{promotion.name}</h3>
                          {promotion.templateName && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              From: {promotion.templateName}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{promotion.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(promotion.status)}`}>
                        {promotion.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Value</span>
                      <span className="font-semibold text-gray-900">
                        {promotion.type === 'percentage' 
                          ? `${promotion.value}% off`
                          : promotion.type === 'fixed_amount'
                          ? `${formatCurrency(promotion.value)} off`
                          : promotion.type === 'bogo'
                          ? 'Buy 1 Get 1'
                          : promotion.type === 'free_shipping'
                          ? 'Free Shipping'
                          : `${promotion.value} points`
                        }
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
                        onClick={() => handleCampaignView(promotion.id)}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        title="View Details"
                        aria-label="View campaign details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleCampaignCopy(promotion.id)}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Copy Campaign"
                        aria-label="Copy campaign"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleCampaignEdit(promotion.id)}
                        className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                        title="Edit Campaign"
                        aria-label="Edit campaign"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleCampaignDelete(promotion.id)}
                        className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                        title="Delete Campaign"
                        aria-label="Delete campaign"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(promotion.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{promotion.name}</h3>
                        {promotion.templateName && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            From: {promotion.templateName}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(promotion.status)}`}>
                          {promotion.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{promotion.description}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Value</p>
                        <p className="font-semibold text-gray-900">
                          {promotion.type === 'percentage' 
                            ? `${promotion.value}% off`
                            : promotion.type === 'fixed_amount'
                            ? `${formatCurrency(promotion.value)} off`
                            : promotion.type === 'bogo'
                            ? 'Buy 1 Get 1'
                            : promotion.type === 'free_shipping'
                            ? 'Free Shipping'
                            : `${promotion.value} points`
                          }
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
                          onClick={() => handleCampaignView(promotion.id)}
                          className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                          title="View Details"
                          aria-label="View campaign details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleCampaignCopy(promotion.id)}
                          className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                          title="Copy Campaign"
                          aria-label="Copy campaign"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleCampaignEdit(promotion.id)}
                          className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                          title="Edit Campaign"
                          aria-label="Edit campaign"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleCampaignDelete(promotion.id)}
                          className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                          title="Delete Campaign"
                          aria-label="Delete campaign"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="p-6 border-b border-gray-200" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Campaign Templates</h2>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Close template modal clicked');
                    setShowTemplateModal(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                  type="button"
                  title="Close modal"
                  aria-label="Close template modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6" style={{ backgroundColor: '#FFFFFF' }}>
              {/* Template Categories */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Template Categories</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTemplateCategory('all')}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        templateCategory === 'all'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setTemplateCategory('seasonal')}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        templateCategory === 'seasonal'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Seasonal
                    </button>
                    <button
                      onClick={() => setTemplateCategory('flash-sales')}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        templateCategory === 'flash-sales'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Flash Sales
                    </button>
                    <button
                      onClick={() => setTemplateCategory('loyalty')}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        templateCategory === 'loyalty'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Loyalty
                    </button>
                        <button
                          onClick={() => setTemplateCategory('product-launch')}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            templateCategory === 'product-launch'
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Product Launch
                        </button>
                        <button
                          onClick={() => setTemplateCategory('custom')}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            templateCategory === 'custom'
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          My Templates
                        </button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search templates..."
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Sort templates"
                    aria-label="Sort templates by"
                  >
                    <option>Sort by Popularity</option>
                    <option>Sort by Newest</option>
                    <option>Sort by Name</option>
                  </select>
                </div>
              </div>

              {/* Template Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
                    <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                  </div>
                ) : (
                  filteredTemplates.map((template) => {
                    const Icon = template.icon || Settings;
                    const colorClasses = {
                      red: 'bg-red-100 text-red-600',
                      orange: 'bg-orange-100 text-orange-600',
                      purple: 'bg-purple-100 text-purple-600',
                      green: 'bg-green-100 text-green-600',
                      blue: 'bg-blue-100 text-blue-600',
                      pink: 'bg-pink-100 text-pink-600'
                    };
                    
                      return (
                        <div key={template.id} className={`rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer group ${template.isCustom ? 'border-2 border-blue-200' : ''}`} style={{ backgroundColor: '#F7F2EC' }}>
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 ${colorClasses[template.color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center`}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{template.name}</h4>
                                  <p className="text-xs text-gray-500 capitalize">
                                    {template.isCustom ? 'My Template' : template.category.replace('-', ' ')}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {template.isCustom && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log(`Deleting custom template: ${template.name}`);
                                      const updatedTemplates = savedCustomTemplates.filter(t => t.id !== template.id);
                                      setSavedCustomTemplates(updatedTemplates);
                                      saveTemplatesToStorage(updatedTemplates);
                                    }}
                                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                    title="Delete custom template"
                                    aria-label="Delete custom template"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-600">{template.rating}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Users className="h-3 w-3" />
                                <span>{template.uses} uses</span>
                                {template.isCustom && (
                                  <span className="text-blue-600 font-medium">• Custom</span>
                                )}
                              </div>
                              <button
                                onClick={() => handleTemplateUse(template.id)}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Use Template
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                  })
                )}
              </div>

              {/* Create Custom Template */}
              <div className="mt-8 pt-6 border-t border-gray-200 rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F7F2EC' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Don't see what you need?</h3>
                    <p className="text-gray-600">Create your own custom template and save it for future use.</p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Creating custom template button clicked');
                      setShowTemplateModal(false);
                      setShowCustomTemplateEditor(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    type="button"
                  >
                    <Plus className="h-4 w-4" />
                    Create Custom Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Template Editor Modal */}
      {showCustomTemplateEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="p-6 border-b border-gray-200" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Back to templates clicked');
                      setShowCustomTemplateEditor(false);
                      setShowTemplateModal(true);
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                    type="button"
                    title="Back to templates"
                    aria-label="Back to templates"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Templates
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900">Create Custom Template</h2>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Close custom template editor clicked');
                    setShowCustomTemplateEditor(false);
                    // Reset form
                    setCustomTemplate({
                      name: '',
                      description: '',
                      category: 'custom',
                      type: 'percentage',
                      value: 0,
                      conditions: '',
                      targetAudience: 'all'
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                  type="button"
                  title="Close editor"
                  aria-label="Close custom template editor"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6" style={{ backgroundColor: '#FFFFFF' }}>
              <form onSubmit={(e) => {
                e.preventDefault();
                console.log('Custom template submitted:', customTemplate);
                
                // Create a new template object with unique ID
                const newTemplate = {
                  id: `custom-${Date.now()}`,
                  name: customTemplate.name,
                  description: customTemplate.description,
                  category: 'custom',
                  type: customTemplate.type,
                  value: customTemplate.value,
                  conditions: customTemplate.conditions,
                  targetAudience: customTemplate.targetAudience,
                  rating: 5.0,
                  uses: '0',
                  icon: Settings,
                  color: 'blue',
                  isCustom: true,
                  createdAt: new Date().toISOString()
                };
                
                // Save the template to state and localStorage
                const updatedTemplates = [...savedCustomTemplates, newTemplate];
                setSavedCustomTemplates(updatedTemplates);
                saveTemplatesToStorage(updatedTemplates);
                console.log('Custom template saved:', newTemplate);
                
                // Select the newly created template
                onTemplateSelect(newTemplate.id);
                setShowCustomTemplateEditor(false);
                
                // Reset form
                setCustomTemplate({
                  name: '',
                  description: '',
                  category: 'custom',
                  type: 'percentage',
                  value: 0,
                  conditions: '',
                  targetAudience: 'all'
                });
              }} className="space-y-6">
                
                {/* Template Name */}
                <div>
                  <label htmlFor="template-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    id="template-name"
                    type="text"
                    required
                    value={customTemplate.name}
                    onChange={(e) => setCustomTemplate({...customTemplate, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter template name"
                  />
                </div>

                {/* Template Description */}
                <div>
                  <label htmlFor="template-description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="template-description"
                    required
                    rows={3}
                    value={customTemplate.description}
                    onChange={(e) => setCustomTemplate({...customTemplate, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your custom template"
                  />
                </div>

                {/* Template Type and Value */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="template-type" className="block text-sm font-medium text-gray-700 mb-2">
                      Promotion Type *
                    </label>
                    <select
                      id="template-type"
                      required
                      value={customTemplate.type}
                      onChange={(e) => setCustomTemplate({...customTemplate, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="percentage">Percentage Discount</option>
                      <option value="fixed_amount">Fixed Amount Discount</option>
                      <option value="bogo">Buy One Get One</option>
                      <option value="free_shipping">Free Shipping</option>
                      <option value="loyalty_points">Loyalty Points</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="template-value" className="block text-sm font-medium text-gray-700 mb-2">
                      Value *
                    </label>
                    <input
                      id="template-value"
                      type="number"
                      required
                      min="0"
                      value={customTemplate.value}
                      onChange={(e) => setCustomTemplate({...customTemplate, value: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter value"
                    />
                  </div>
                </div>

                {/* Target Audience */}
                <div>
                  <label htmlFor="target-audience" className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <select
                    id="target-audience"
                    value={customTemplate.targetAudience}
                    onChange={(e) => setCustomTemplate({...customTemplate, targetAudience: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Customers</option>
                    <option value="new">New Customers Only</option>
                    <option value="returning">Returning Customers</option>
                    <option value="vip">VIP Customers</option>
                    <option value="segments">Specific Segments</option>
                  </select>
                </div>

                {/* Conditions */}
                <div>
                  <label htmlFor="template-conditions" className="block text-sm font-medium text-gray-700 mb-2">
                    Conditions (Optional)
                  </label>
                  <textarea
                    id="template-conditions"
                    rows={3}
                    value={customTemplate.conditions}
                    onChange={(e) => setCustomTemplate({...customTemplate, conditions: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any special conditions or requirements for this template"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomTemplateEditor(false);
                      // Reset form
                      setCustomTemplate({
                        name: '',
                        description: '',
                        category: 'custom',
                        type: 'percentage',
                        value: 0,
                        conditions: '',
                        targetAudience: 'all'
                      });
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Template
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Creation Modal */}
      {showCampaignCreationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="p-6 border-b border-gray-200" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      console.log('Back to campaigns clicked');
                      setShowCampaignCreationModal(false);
                      setSelectedTemplateForCampaign(null);
                      setCampaignCreationMode('template');
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                    title="Back to campaigns"
                    aria-label="Back to campaigns"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Campaigns
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900">Create New Campaign</h2>
                </div>
                <button
                  onClick={() => {
                    setShowCampaignCreationModal(false);
                    setSelectedTemplateForCampaign(null);
                    setCampaignCreationMode('template');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close modal"
                  aria-label="Close campaign creation modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6" style={{ backgroundColor: '#FFFFFF' }}>
              {/* Creation Mode Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Creation Method</h3>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setCampaignCreationMode('template')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      campaignCreationMode === 'template'
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                        : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Use Template
                    </div>
                  </button>
                  <button
                    onClick={() => setCampaignCreationMode('custom')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      campaignCreationMode === 'custom'
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                        : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Create Custom
                    </div>
                  </button>
                </div>
              </div>

              {/* Template Selection */}
              {campaignCreationMode === 'template' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Template</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allTemplates.map((template) => {
                        const Icon = template.icon || Settings;
                        const colorClasses = {
                          red: 'bg-red-100 text-red-600',
                          orange: 'bg-orange-100 text-orange-600',
                          purple: 'bg-purple-100 text-purple-600',
                          green: 'bg-green-100 text-green-600',
                          blue: 'bg-blue-100 text-blue-600',
                          pink: 'bg-pink-100 text-pink-600'
                        };

                        return (
                          <div
                            key={template.id}
                            onClick={() => {
                              setSelectedTemplateForCampaign(template);
                              setNewCampaign(prev => ({
                                ...prev,
                                name: `${template.name} Campaign`,
                                description: template.description,
                                type: template.type || 'percentage',
                                value: template.value || 0
                              }));
                            }}
                            className={`rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-all ${
                              selectedTemplateForCampaign?.id === template.id
                                ? 'ring-2 ring-blue-500 bg-blue-50'
                                : 'hover:bg-gray-50'
                            } ${template.isCustom ? 'border-2 border-blue-200' : ''}`}
                            style={{ backgroundColor: selectedTemplateForCampaign?.id === template.id ? '#EFF6FF' : '#F7F2EC' }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 ${colorClasses[template.color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center`}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{template.name}</h4>
                                  <p className="text-xs text-gray-500 capitalize">
                                    {template.isCustom ? 'My Template' : template.category.replace('-', ' ')}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-600">{template.rating}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Users className="h-3 w-3" />
                                <span>{template.uses} uses</span>
                                {template.isCustom && (
                                  <span className="text-blue-600 font-medium">• Custom</span>
                                )}
                              </div>
                              {selectedTemplateForCampaign?.id === template.id && (
                                <div className="text-blue-600 text-sm font-medium">Selected</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Campaign Form */}
              {campaignCreationMode === 'custom' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="campaign-name" className="block text-sm font-medium text-gray-700 mb-2">
                          Campaign Name *
                        </label>
                        <input
                          id="campaign-name"
                          type="text"
                          required
                          value={newCampaign.name}
                          onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter campaign name"
                        />
                      </div>
                      <div>
                        <label htmlFor="campaign-type" className="block text-sm font-medium text-gray-700 mb-2">
                          Promotion Type *
                        </label>
                        <select
                          id="campaign-type"
                          required
                          value={newCampaign.type}
                          onChange={(e) => setNewCampaign({...newCampaign, type: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="percentage">Percentage Discount</option>
                          <option value="fixed_amount">Fixed Amount Discount</option>
                          <option value="bogo">Buy One Get One</option>
                          <option value="free_shipping">Free Shipping</option>
                          <option value="loyalty_points">Loyalty Points</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="campaign-description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        id="campaign-description"
                        required
                        rows={3}
                        value={newCampaign.description}
                        onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe your campaign"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label htmlFor="campaign-value" className="block text-sm font-medium text-gray-700 mb-2">
                          Value *
                        </label>
                        <input
                          id="campaign-value"
                          type="number"
                          required
                          min="0"
                          value={newCampaign.value}
                          onChange={(e) => setNewCampaign({...newCampaign, value: parseFloat(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter value"
                        />
                      </div>
                      <div>
                        <label htmlFor="campaign-audience" className="block text-sm font-medium text-gray-700 mb-2">
                          Target Audience
                        </label>
                        <select
                          id="campaign-audience"
                          value={newCampaign.targetAudience}
                          onChange={(e) => setNewCampaign({...newCampaign, targetAudience: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all">All Customers</option>
                          <option value="new">New Customers Only</option>
                          <option value="returning">Returning Customers</option>
                          <option value="vip">VIP Customers</option>
                          <option value="segments">Specific Segments</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label htmlFor="campaign-start" className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date *
                        </label>
                        <input
                          id="campaign-start"
                          type="date"
                          required
                          value={newCampaign.startDate}
                          onChange={(e) => {
                            console.log('Start date changed:', e.target.value);
                            setNewCampaign({...newCampaign, startDate: e.target.value});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="campaign-end" className="block text-sm font-medium text-gray-700 mb-2">
                          End Date *
                        </label>
                        <input
                          id="campaign-end"
                          type="date"
                          required
                          value={newCampaign.endDate}
                          onChange={(e) => {
                            console.log('End date changed:', e.target.value);
                            setNewCampaign({...newCampaign, endDate: e.target.value});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    {/* Date Range Display */}
                    {newCampaign.startDate && newCampaign.endDate && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 text-sm text-blue-800">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">Campaign Duration:</span>
                          <span>{new Date(newCampaign.startDate).toLocaleDateString()} - {new Date(newCampaign.endDate).toLocaleDateString()}</span>
                          <span className="text-blue-600">
                            ({Math.ceil((new Date(newCampaign.endDate).getTime() - new Date(newCampaign.startDate).getTime()) / (1000 * 60 * 60 * 24))} days)
                          </span>
                        </div>
                        {new Date(newCampaign.endDate) <= new Date(newCampaign.startDate) && (
                          <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            End date must be after start date
                          </div>
                        )}
                      </div>
                    )}
                    <div className="mt-4">
                      <label htmlFor="campaign-conditions" className="block text-sm font-medium text-gray-700 mb-2">
                        Conditions (Optional)
                      </label>
                      <textarea
                        id="campaign-conditions"
                        rows={3}
                        value={newCampaign.conditions}
                        onChange={(e) => setNewCampaign({...newCampaign, conditions: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Any special conditions or requirements"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => {
                    setShowCampaignCreationModal(false);
                    setSelectedTemplateForCampaign(null);
                    setCampaignCreationMode('template');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (campaignCreationMode === 'template' && !selectedTemplateForCampaign) {
                      alert('Please select a template to continue');
                      return;
                    }
                    if (campaignCreationMode === 'custom' && (!newCampaign.name || !newCampaign.description)) {
                      alert('Please fill in all required fields');
                      return;
                    }
                    
                    // Validate date range
                    if (new Date(newCampaign.endDate) <= new Date(newCampaign.startDate)) {
                      alert('End date must be after start date');
                      return;
                    }

                    // Create the campaign
                    console.log('Creating campaign with dates:', {
                      startDate: newCampaign.startDate,
                      endDate: newCampaign.endDate,
                      startDateISO: new Date(newCampaign.startDate).toISOString(),
                      endDateISO: new Date(newCampaign.endDate).toISOString()
                    });
                    
                    const campaignData = {
                      name: newCampaign.name,
                      description: newCampaign.description,
                      type: newCampaign.type,
                      value: newCampaign.value,
                      status: 'draft' as const,
                      startDate: new Date(newCampaign.startDate).toISOString(),
                      endDate: new Date(newCampaign.endDate).toISOString(),
                      performance: {
                        totalUses: 0,
                        totalDiscount: 0,
                        conversionRate: 0,
                        revenue: 0,
                        roi: 0
                      },
                      ...(selectedTemplateForCampaign && {
                        templateId: selectedTemplateForCampaign.id,
                        templateName: selectedTemplateForCampaign.name
                      })
                    };

                    console.log('Creating campaign with data:', campaignData);
                    onPromotionCreate(campaignData);
                    setShowCampaignCreationModal(false);
                    setSelectedTemplateForCampaign(null);
                    setCampaignCreationMode('template');
                    
                    // Show success message
                    alert(`Campaign "${campaignData.name}" created successfully!`);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Details Modal */}
      {showCampaignDetailsModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="p-6 border-b border-gray-200" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedCampaign.name}</h2>
                <button
                  onClick={() => setShowCampaignDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close modal"
                  aria-label="Close campaign details"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Campaign Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Campaign Details</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-gray-700">Name:</span>
                        <span className="ml-2 text-gray-900">{selectedCampaign.name}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Description:</span>
                        <p className="ml-2 text-gray-900">{selectedCampaign.description}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Type:</span>
                        <span className="ml-2 text-gray-900">{selectedCampaign.type.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Value:</span>
                        <span className="ml-2 text-gray-900">{selectedCampaign.value}{selectedCampaign.type === 'percentage' ? '%' : '€'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCampaign.status)}`}>
                          {selectedCampaign.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Timeline</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-gray-700">Start Date:</span>
                        <span className="ml-2 text-gray-900">{formatDate(selectedCampaign.startDate)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">End Date:</span>
                        <span className="ml-2 text-gray-900">{formatDate(selectedCampaign.endDate)}</span>
                      </div>
                      {selectedCampaign.templateName && (
                        <div>
                          <span className="font-medium text-gray-700">Created from Template:</span>
                          <span className="ml-2 text-blue-600">{selectedCampaign.templateName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-gray-900">{selectedCampaign.performance.totalUses}</div>
                        <div className="text-sm text-gray-600">Total Uses</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(selectedCampaign.performance.revenue)}</div>
                        <div className="text-sm text-gray-600">Revenue</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-gray-900">{formatPercentage(selectedCampaign.performance.conversionRate)}</div>
                        <div className="text-sm text-gray-600">Conversion Rate</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-gray-900">{formatPercentage(selectedCampaign.performance.roi)}</div>
                        <div className="text-sm text-gray-600">ROI</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => setShowCampaignDetailsModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowCampaignDetailsModal(false);
                    onPromotionUpdate(selectedCampaign);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Delete Campaign</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone.</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this campaign? All associated data will be permanently removed.
              </p>

              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Campaign
                </button>
              </div>
            </div>
        </div>
      </div>
    )}

    {/* Edit Campaign Modal */}
    {showEditModal && editCampaign && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="p-6 border-b border-gray-200" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Edit Campaign</h2>
              <button
                onClick={handleCancelEdit}
                className="text-gray-500 hover:text-gray-700"
                title="Close modal"
                aria-label="Close edit modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-6" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="space-y-4">
              <div>
                <label htmlFor="edit-campaign-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name *
                </label>
                <input
                  id="edit-campaign-name"
                  type="text"
                  required
                  value={editCampaign.name}
                  onChange={(e) => setEditCampaign({...editCampaign, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="edit-campaign-description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="edit-campaign-description"
                  required
                  rows={3}
                  value={editCampaign.description}
                  onChange={(e) => setEditCampaign({...editCampaign, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-campaign-type" className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    id="edit-campaign-type"
                    value={editCampaign.type}
                    onChange={(e) => setEditCampaign({...editCampaign, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="free_shipping">Free Shipping</option>
                    <option value="buy_x_get_y">Buy X Get Y</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="edit-campaign-value" className="block text-sm font-medium text-gray-700 mb-2">
                    Value
                  </label>
                  <input
                    id="edit-campaign-value"
                    type="number"
                    value={editCampaign.value}
                    onChange={(e) => setEditCampaign({...editCampaign, value: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-campaign-start" className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    id="edit-campaign-start"
                    type="date"
                    required
                    value={editCampaign.startDate}
                    onChange={(e) => setEditCampaign({...editCampaign, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="edit-campaign-end" className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    id="edit-campaign-end"
                    type="date"
                    required
                    value={editCampaign.endDate}
                    onChange={(e) => setEditCampaign({...editCampaign, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Date Range Display for Edit */}
              {editCampaign.startDate && editCampaign.endDate && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-sm text-blue-800">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Campaign Duration:</span>
                    <span>{new Date(editCampaign.startDate).toLocaleDateString()} - {new Date(editCampaign.endDate).toLocaleDateString()}</span>
                    <span className="text-blue-600">
                      ({Math.ceil((new Date(editCampaign.endDate).getTime() - new Date(editCampaign.startDate).getTime()) / (1000 * 60 * 60 * 24))} days)
                    </span>
                  </div>
                  {new Date(editCampaign.endDate) <= new Date(editCampaign.startDate) && (
                    <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      End date must be after start date
                    </div>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="edit-campaign-conditions" className="block text-sm font-medium text-gray-700 mb-2">
                  Conditions (Optional)
                </label>
                <textarea
                  id="edit-campaign-conditions"
                  rows={2}
                  value={editCampaign.conditions || ''}
                  onChange={(e) => setEditCampaign({...editCampaign, conditions: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default CampaignsTab;