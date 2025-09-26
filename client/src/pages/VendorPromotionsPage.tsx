import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Plus,
  Target,
  Mail,
  Calendar,
  BarChart3,
  Star,
  Settings,
  X,
  Percent,
  DollarSign,
  Gift,
  Truck,
  Award,
  AlertCircle
} from 'lucide-react';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';

// Import consolidated promotion components
import CampaignsTab from '../components/promotions/CampaignsTab';
import SocialMediaTab from '../components/promotions/SocialMediaTab';
import SchedulerAutomationTab from '../components/promotions/SchedulerAutomationTab';
import AnalyticsTab from '../components/promotions/AnalyticsTab';
import LoyaltyReferralsTab from '../components/promotions/LoyaltyReferralsTab';

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

const VendorPromotionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'social-media' | 'scheduler-automation' | 'analytics' | 'loyalty-referrals'>('campaigns');
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [isCreatingPromotion, setIsCreatingPromotion] = useState(false);
  const [showDiscountCodeModal, setShowDiscountCodeModal] = useState(false);
  const [isCreatingDiscountCode, setIsCreatingDiscountCode] = useState(false);
  
  // Advanced modal state
  const [expandedAccordions, setExpandedAccordions] = useState({
    eligibility: false,
    guardrails: false,
    distribution: false
  });
  const [collisionCheck, setCollisionCheck] = useState<{ [key: string]: boolean }>({});

  // Promotion creation form state
  const [promotionForm, setPromotionForm] = useState({
    name: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed_amount' | 'bogo' | 'free_shipping' | 'loyalty_points',
    value: 0,
    status: 'draft' as 'draft' | 'active' | 'paused' | 'expired' | 'cancelled',
    startDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    minimumOrderAmount: 0,
    maximumDiscountAmount: 0,
    usageLimit: 0,
    applicableProducts: [] as string[],
    customerSegments: [] as string[],
    promoCode: '',
    autoGenerateCode: true
  });

  // Advanced discount code creation form state
  const [discountCodeForm, setDiscountCodeForm] = useState({
    // Basic Info
    code: '',
    description: '',
    autoGenerateCode: true,
    generatePattern: 'SAVE{RAND4}',
    
    // Code Type & Scope
    type: 'percentage' as 'percentage' | 'fixed_amount' | 'free_shipping' | 'bogo' | 'tiered',
    value: 0,
    bogoConfig: { buyQty: 1, getQty: 1, sameCollection: true },
    tieredConfig: [{ threshold: 50, reward: 10 }],
    scope: ['entire_cart'] as string[],
    collections: [] as string[],
    products: [] as string[],
    channels: ['marketplace'] as string[],
    
    // Dates & Status
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    timezone: 'EST',
    isActive: true,
    
    // Eligibility & Limits
    limits: {
      totalUsage: 0,
      perCustomer: 0,
      perOrder: 0,
      minSpend: 0,
      maxSpend: 0,
      minQty: 0,
      maxQty: 0,
      oneTime: false
    },
    audience: {
      newReturning: 'all',
      loyaltyTier: '',
      zipRadius: 0,
      tags: [] as string[]
    },
    stacking: {
      policy: 'exclusive' as 'exclusive' | 'stackable' | 'mutually_exclusive',
      group: ''
    },
    blackoutRanges: [] as { start: string; end: string }[],
    
    // Guardrails & Forecast
    guardrails: {
      maxDiscount: 0,
      marginFloor: 0,
      inventoryThreshold: 10
    },
    forecast: {
      exposure: 0,
      redemptionsPerDay: 0,
      inventoryAlerts: [] as string[]
    },
    
    // Distribution
    distribution: {
      autoApplyLink: '',
      qrCode: '',
      influencerTag: '',
      participateInBestCode: false
    }
  });

// Mock data
  const { data: mockPromotions = [], isLoading: queryLoading } = useQuery({
    queryKey: ['promotions'],
    queryFn: () => Promise.resolve([]),
  });

  // Helper functions for promotion form
  const generatePromoCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const applyQuickTemplate = (templateType: string) => {
    const templates = {
      holiday: {
        name: 'Holiday Special',
        description: 'Special holiday discount for our valued customers',
        type: 'percentage' as const,
        value: 15,
        status: 'active' as const,
        minimumOrderAmount: 50,
        promoCode: 'HOLIDAY15'
      },
      new_customer: {
        name: 'Welcome New Customer',
        description: 'Welcome discount for first-time customers',
        type: 'fixed_amount' as const,
        value: 10,
        status: 'active' as const,
        minimumOrderAmount: 25,
        promoCode: 'WELCOME10'
      },
      clearance: {
        name: 'Clearance Sale',
        description: 'Clearance sale on selected items',
        type: 'percentage' as const,
        value: 25,
        status: 'active' as const,
        minimumOrderAmount: 0,
        promoCode: 'CLEAR25'
      },
      loyalty: {
        name: 'Loyalty Rewards',
        description: 'Extra points for loyal customers',
        type: 'loyalty_points' as const,
        value: 100,
        status: 'active' as const,
        minimumOrderAmount: 0,
        promoCode: 'LOYAL100'
      },
      free_shipping: {
        name: 'Free Shipping Weekend',
        description: 'Free shipping on all orders this weekend',
        type: 'free_shipping' as const,
        value: 0,
        status: 'active' as const,
        minimumOrderAmount: 0,
        promoCode: 'FREESHIP'
      }
    };

    const template = templates[templateType as keyof typeof templates];
    if (template) {
      setPromotionForm(prev => ({
        ...prev,
        ...template,
        autoGenerateCode: false
      }));
    }
  };

  const resetPromotionForm = () => {
    setPromotionForm({
      name: '',
      description: '',
      type: 'percentage',
      value: 0,
      status: 'draft',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      minimumOrderAmount: 0,
      maximumDiscountAmount: 0,
      usageLimit: 0,
      applicableProducts: [],
      customerSegments: [],
      promoCode: '',
      autoGenerateCode: true
    });
  };

  // Advanced helper functions for discount code form
  const generateDiscountCode = (pattern: string = 'SAVE{RAND4}') => {
    const rand4 = Math.floor(Math.random() * 9000) + 1000;
    return pattern.replace('{RAND4}', rand4.toString());
  };

  const checkCodeCollision = async (code: string) => {
    // Mock API call - in real implementation would call /api/discounts/check?code=
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockCollisions = ['SAVE20', 'WELCOME10', 'HOLIDAY15'];
    const isCollision = mockCollisions.includes(code.toUpperCase());
    setCollisionCheck(prev => ({ ...prev, [code]: isCollision }));
    return isCollision;
  };

  const applyDiscountCodeTemplate = (templateType: string) => {
    const templates = {
      welcome: {
        code: 'WELCOME10',
        description: '$10 off your first order - Welcome to our marketplace!',
        type: 'fixed_amount' as const,
        value: 10,
        scope: ['entire_cart'],
        channels: ['marketplace', 'app'],
        limits: { minSpend: 25, perCustomer: 1, oneTime: true },
        audience: { newReturning: 'new' }
      },
      holiday: {
        code: 'HOLIDAY20',
        description: '20% off holiday orders - Limited time offer',
        type: 'percentage' as const,
        value: 20,
        scope: ['entire_cart'],
        channels: ['marketplace', 'delivery', 'pickup'],
        limits: { minSpend: 50, maxDiscount: 100 },
        audience: { newReturning: 'all' }
      },
      flash_sale: {
        code: 'FLASH15',
        description: '15% off flash sale - While supplies last',
        type: 'percentage' as const,
        value: 15,
        scope: ['entire_cart'],
        channels: ['marketplace', 'app'],
        limits: { minSpend: 30, totalUsage: 100 },
        audience: { newReturning: 'all' }
      },
      loyalty: {
        code: 'LOYAL25',
        description: '25% off for loyal customers - Thank you for your support',
        type: 'percentage' as const,
        value: 25,
        scope: ['entire_cart'],
        channels: ['marketplace', 'delivery'],
        limits: { minSpend: 75, perCustomer: 3 },
        audience: { loyaltyTier: 'gold' }
      },
      clearance: {
        code: 'CLEAR30',
        description: '30% off clearance items - Final sale',
        type: 'percentage' as const,
        value: 30,
        scope: ['collections'],
        collections: ['clearance'],
        channels: ['marketplace'],
        limits: { maxDiscount: 50 },
        audience: { newReturning: 'all' }
      },
      bulk: {
        code: 'BULK15',
        description: '15% off bulk orders - Save more when you buy more',
        type: 'percentage' as const,
        value: 15,
        scope: ['entire_cart'],
        channels: ['marketplace', 'pickup'],
        limits: { minSpend: 100, minQty: 5 },
        audience: { newReturning: 'all' }
      },
      referral: {
        code: 'FRIEND20',
        description: '20% off for referring a friend - Share the love',
        type: 'percentage' as const,
        value: 20,
        scope: ['entire_cart'],
        channels: ['marketplace', 'app'],
        limits: { minSpend: 40, perCustomer: 1 },
        audience: { newReturning: 'all' }
      },
      seasonal: {
        code: 'SPRING25',
        description: '25% off spring collection - Fresh seasonal items',
        type: 'percentage' as const,
        value: 25,
        scope: ['collections'],
        collections: ['spring'],
        channels: ['marketplace', 'delivery'],
        limits: { minSpend: 60, maxDiscount: 75 },
        audience: { newReturning: 'all' }
      },
      early_bird: {
        code: 'EARLY10',
        description: '10% off early bird special - Order before 10am',
        type: 'percentage' as const,
        value: 10,
        scope: ['entire_cart'],
        channels: ['marketplace', 'app'],
        limits: { minSpend: 35, totalUsage: 50 },
        audience: { newReturning: 'all' }
      }
    };

    const template = templates[templateType as keyof typeof templates];
    if (template) {
      setDiscountCodeForm(prev => ({
        ...prev,
        ...template,
        autoGenerateCode: false
      }));
    }
  };

  const resetDiscountCodeForm = () => {
    setDiscountCodeForm({
      code: '',
      description: '',
      autoGenerateCode: true,
      generatePattern: 'SAVE{RAND4}',
      type: 'percentage',
      value: 0,
      bogoConfig: { buyQty: 1, getQty: 1, sameCollection: true },
      tieredConfig: [{ threshold: 50, reward: 10 }],
      scope: ['entire_cart'],
      collections: [],
      products: [],
      channels: ['marketplace'],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      timezone: 'EST',
      isActive: true,
      limits: {
        totalUsage: 0,
        perCustomer: 0,
        perOrder: 0,
        minSpend: 0,
        maxSpend: 0,
        minQty: 0,
        maxQty: 0,
        oneTime: false
      },
      audience: {
        newReturning: 'all',
        loyaltyTier: '',
        zipRadius: 0,
        tags: []
      },
      stacking: {
        policy: 'exclusive',
        group: ''
      },
      blackoutRanges: [],
      guardrails: {
        maxDiscount: 0,
        marginFloor: 0,
        inventoryThreshold: 10
      },
      forecast: {
        exposure: 0,
        redemptionsPerDay: 0,
        inventoryAlerts: []
      },
      distribution: {
        autoApplyLink: '',
        qrCode: '',
        influencerTag: '',
        participateInBestCode: false
      }
    });
  };

  const toggleAccordion = (accordion: keyof typeof expandedAccordions) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [accordion]: !prev[accordion]
    }));
  };

  const generateRuleSummary = () => {
    const { code, type, value, scope, collections, channels, limits, startDate, endDate, timezone, stacking } = discountCodeForm;
    
    let summary = `${code || 'NEWCODE'} → `;
    
    if (type === 'percentage') summary += `${value}% off `;
    else if (type === 'fixed_amount') summary += `$${value} off `;
    else if (type === 'free_shipping') summary += `Free shipping `;
    else if (type === 'bogo') summary += `BOGO ${discountCodeForm.bogoConfig.buyQty} get ${discountCodeForm.bogoConfig.getQty} `;
    
    if (scope.includes('collections') && collections.length > 0) {
      summary += `Collections: '${collections.slice(0, 2).join("', '")}'${collections.length > 2 ? '...' : ''}, `;
    }
    
    summary += `Channels: ${channels.join(' + ')}, `;
    
    if (limits.minSpend > 0) summary += `Min $${limits.minSpend}, `;
    if (limits.maxDiscount > 0) summary += `Max $${limits.maxDiscount}, `;
    
    summary += `Stack: ${stacking.policy.charAt(0).toUpperCase() + stacking.policy.slice(1)}, `;
    summary += `${new Date(startDate).toLocaleDateString()}–${new Date(endDate).toLocaleDateString()} (${timezone})`;
    
    return summary;
  };

  // Handle promotion creation
  const handlePromotionCreate = (campaignData?: Partial<Promotion>) => {
    const newPromotion: Promotion = {
      id: `promotion-${Date.now()}`,
      name: campaignData?.name || `New Campaign ${promotions.length + 1}`,
      description: campaignData?.description || 'A new promotional campaign',
      type: campaignData?.type || 'percentage',
      value: campaignData?.value || 10,
      status: campaignData?.status || 'draft',
      startDate: campaignData?.startDate || new Date().toISOString(),
      endDate: campaignData?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      performance: campaignData?.performance || {
        totalUses: 0,
        totalDiscount: 0,
        conversionRate: 0,
        revenue: 0,
        roi: 0
      },
      ...campaignData
    };
    
    setPromotions(prev => [...prev, newPromotion]);
    console.log('Created new promotion:', newPromotion);
    
    // Show success message
    alert(`✅ New promotion created successfully!\n\nName: ${newPromotion.name}\nType: ${newPromotion.type}\nStatus: ${newPromotion.status}\n\nIn a real implementation, this would:\n• Open a promotion creation wizard\n• Allow you to configure details\n• Save to database\n• Update the campaigns list`);
    
    // Switch to campaigns tab to show the new promotion
    setActiveTab('campaigns');
  };

  // Handle custom promotion creation from form
  const handleCustomPromotionCreate = async () => {
    if (!promotionForm.name.trim()) {
      alert('Please enter a promotion name');
      return;
    }

    if (!promotionForm.description.trim()) {
      alert('Please enter a promotion description');
      return;
    }

    if (promotionForm.value <= 0 && promotionForm.type !== 'free_shipping') {
      alert('Please enter a valid promotion value');
      return;
    }

    setIsCreatingPromotion(true);

    try {
      // Generate promo code if auto-generate is enabled
      const finalPromoCode = promotionForm.autoGenerateCode 
        ? generatePromoCode() 
        : promotionForm.promoCode || generatePromoCode();

      const newPromotion: Promotion = {
        id: `promotion-${Date.now()}`,
        name: promotionForm.name,
        description: promotionForm.description,
        type: promotionForm.type,
        value: promotionForm.value,
        status: promotionForm.status,
        startDate: new Date(promotionForm.startDate).toISOString(),
        endDate: new Date(promotionForm.endDate).toISOString(),
        performance: {
          totalUses: 0,
          totalDiscount: 0,
          conversionRate: 0,
          revenue: 0,
          roi: 0
        }
      };

      setPromotions(prev => [...prev, newPromotion]);
      
      alert(`✅ Custom promotion created successfully!\n\n🎯 ${newPromotion.name}\n📝 ${newPromotion.description}\n💰 Value: ${newPromotion.type === 'percentage' ? newPromotion.value + '%' : 
            newPromotion.type === 'fixed_amount' ? '$' + newPromotion.value : 
            newPromotion.type === 'bogo' ? newPromotion.value + '% off second item' :
            newPromotion.type === 'free_shipping' ? 'Free shipping' :
            newPromotion.value + ' bonus points'}\n🔑 Promo Code: ${finalPromoCode}\n📅 Active: ${new Date(newPromotion.startDate).toLocaleDateString()} - ${new Date(newPromotion.endDate).toLocaleDateString()}\n\n✅ This promotion is now ${newPromotion.status.toUpperCase()} and ready to use!`);
      
      // Reset form and close modal
      resetPromotionForm();
      setShowPromotionModal(false);
      setActiveTab('campaigns');

    } catch (error) {
      console.error('Promotion creation failed:', error);
      alert(`❌ Failed to create promotion. Please try again.\n\nError: ${error}`);
    } finally {
      setIsCreatingPromotion(false);
    }
  };

  // Handle advanced discount code creation
  const handleDiscountCodeCreate = async () => {
    if (!discountCodeForm.code.trim() && !discountCodeForm.autoGenerateCode) {
      alert('Please enter a discount code or enable auto-generation');
      return;
    }

    if (!discountCodeForm.description.trim()) {
      alert('Please enter a description for the discount code');
      return;
    }

    if (discountCodeForm.value <= 0 && discountCodeForm.type !== 'free_shipping') {
      alert('Please enter a valid discount value');
      return;
    }

    // Check for collisions
    const finalCode = discountCodeForm.autoGenerateCode 
      ? generateDiscountCode(discountCodeForm.generatePattern)
      : discountCodeForm.code.toUpperCase();

    const hasCollision = await checkCodeCollision(finalCode);
    if (hasCollision) {
      alert('❌ This code already exists. Please choose a different code or generate a new one.');
      return;
    }

    setIsCreatingDiscountCode(true);

    try {
      const discountCodeData = {
        id: `discount-code-${Date.now()}`,
        code: finalCode,
        description: discountCodeForm.description,
        type: discountCodeForm.type,
        value: discountCodeForm.value,
        bogoConfig: discountCodeForm.bogoConfig,
        tieredConfig: discountCodeForm.tieredConfig,
        scope: discountCodeForm.scope,
        collections: discountCodeForm.collections,
        products: discountCodeForm.products,
        channels: discountCodeForm.channels,
        dateRange: {
          start: new Date(discountCodeForm.startDate).toISOString(),
          end: new Date(discountCodeForm.endDate).toISOString(),
          timezone: discountCodeForm.timezone
        },
        limits: discountCodeForm.limits,
        audience: discountCodeForm.audience,
        stacking: discountCodeForm.stacking,
        blackoutRanges: discountCodeForm.blackoutRanges,
        guardrails: discountCodeForm.guardrails,
        distribution: discountCodeForm.distribution,
        status: discountCodeForm.isActive ? 'active' : 'draft',
        createdAt: new Date().toISOString(),
        usageCount: 0
      };

      // Mock API call to create discount code
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Created advanced discount code:', discountCodeData);
      
      const ruleSummary = generateRuleSummary();
      alert(`✅ Advanced discount code created successfully!\n\n🔑 Code: ${finalCode}\n📝 Description: ${discountCodeForm.description}\n📋 Rule: ${ruleSummary}\n\n✅ This discount code is now ${discountCodeForm.isActive ? 'ACTIVE' : 'DRAFT'} and ready to use!\n\n🚀 Advanced features enabled:\n• Smart collision detection\n• Multi-channel distribution\n• Advanced eligibility rules\n• Safety guardrails\n• Auto-apply links\n• QR code generation\n\nIn a real implementation, this would:\n• Save to database with full configuration\n• Generate shareable links and QR codes\n• Set up tracking and analytics\n• Configure stacking policies\n• Enable inventory monitoring`);
      
      // Reset form and close modal
      resetDiscountCodeForm();
      setShowDiscountCodeModal(false);
      setExpandedAccordions({ eligibility: false, guardrails: false, distribution: false });

    } catch (error) {
      console.error('Advanced discount code creation failed:', error);
      alert(`❌ Failed to create discount code. Please try again.\n\nError: ${error}`);
    } finally {
      setIsCreatingDiscountCode(false);
    }
  };

  // Handle promotion update
  const handlePromotionUpdate = (updatedPromotion: Promotion) => {
    setPromotions(prev => 
      prev.map(p => p.id === updatedPromotion.id ? updatedPromotion : p)
    );
    console.log('Updated promotion:', updatedPromotion);
  };

  // Handle promotion deletion
  const handlePromotionDelete = (id: string) => {
    setPromotions(prev => prev.filter(p => p.id !== id));
    console.log('Deleted promotion:', id);
  };

  // New consolidated tabs
  const tabs = [
    { 
      id: 'campaigns', 
      label: 'Campaigns', 
      icon: Target,
      description: 'Create and manage promotional campaigns, discounts, and templates'
    },
    { 
      id: 'social-media', 
      label: 'Social Media', 
      icon: Mail,
      description: 'Plan posts, manage engagement, and measure performance'
    },
    { 
      id: 'scheduler-automation', 
      label: 'Scheduler & Automation', 
      icon: Calendar,
      description: 'Schedule campaigns and set up automated promotion rules'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: BarChart3,
      description: 'Track performance, A/B testing, and AI-powered insights'
    },
    { 
      id: 'loyalty-referrals', 
      label: 'Loyalty & Referrals', 
      icon: Star,
      description: 'Loyalty programs, referral systems, and customer rewards'
    },
  ];

  return (
    <VendorDashboardLayout>
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
                onClick={() => setShowDiscountCodeModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                title="Create custom discount code"
                aria-label="Create custom discount code"
              >
                <Percent className="h-4 w-4" />
                <span>Create Discount Code</span>
              </button>
              <button
                onClick={() => setShowPromotionModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Create new promotion"
                aria-label="Create new promotion"
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
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
              <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                        activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                      title={tab.description}
              >
                <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                </div>
              </button>
                  );
                })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'campaigns' && (
              <CampaignsTab
                promotions={promotions}
                onPromotionCreate={handlePromotionCreate}
                onPromotionUpdate={handlePromotionUpdate}
                onPromotionDelete={handlePromotionDelete}
                onPromotionAction={(action, id) => console.log('Promotion action:', action, id)}
                onTemplateSelect={(template) => console.log('Select template:', template)}
                onBulkAction={(action) => console.log('Bulk action:', action)}
                selectedPromotions={[]}
                onSelectPromotion={(id) => console.log('Select promotion:', id)}
                onSelectAll={() => console.log('Select all')}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'social-media' && (
              <SocialMediaTab
                posts={[]}
                assets={[]}
                threads={[]}
                analytics={{}}
                onPostCreate={(post) => console.log('Create post:', post)}
                onPostUpdate={(post) => console.log('Update post:', post)}
                onPostDelete={(id) => console.log('Delete post:', id)}
                onPostSchedule={(id, time) => console.log('Schedule post:', id, time)}
                onAssetUpload={(asset) => console.log('Upload asset:', asset)}
                onThreadReply={(threadId, reply) => console.log('Reply to thread:', threadId, reply)}
                onThreadAssign={(threadId, assignee) => console.log('Assign thread:', threadId, assignee)}
                isLoading={false}
              />
            )}

            {activeTab === 'scheduler-automation' && (
              <SchedulerAutomationTab
                schedules={[]}
                automations={[]}
                onScheduleCreate={(schedule) => console.log('Create schedule:', schedule)}
                onScheduleUpdate={(schedule) => console.log('Update schedule:', schedule)}
                onScheduleDelete={(id) => console.log('Delete schedule:', id)}
                onAutomationCreate={(automation) => console.log('Create automation:', automation)}
                onAutomationUpdate={(automation) => console.log('Update automation:', automation)}
                onAutomationToggle={(id, status) => console.log('Toggle automation:', id, status)}
                onConflictResolve={(conflict) => console.log('Resolve conflict:', conflict)}
                isLoading={false}
              />
            )}

        {activeTab === 'analytics' && (
              <AnalyticsTab
                analytics={{
                  impressions: 0,
                  clicks: 0,
                  redemptions: 0,
                  revenue: 0,
                  conversionRate: 0,
                  aovShift: 0,
                  topPromotions: [],
                  funnelData: []
                }}
                abTests={[]}
                onReportGenerate={(type) => console.log('Generate report:', type)}
                onABTestCreate={(test) => console.log('Create A/B test:', test)}
                onABTestUpdate={(test) => console.log('Update A/B test:', test)}
                onABTestRun={(id) => console.log('Run A/B test:', id)}
                onInsightAction={(id, action) => console.log('Insight action:', id, action)}
                onExportData={(format) => console.log('Export data:', format)}
                timeRange="30d"
                onTimeRangeChange={(range) => console.log('Time range changed:', range)}
                isLoading={false}
              />
            )}

            {activeTab === 'loyalty-referrals' && (
              <LoyaltyReferralsTab
                loyaltyPrograms={[]}
                referralPrograms={[]}
                customers={[]}
                onLoyaltyCreate={(program) => console.log('Create loyalty program:', program)}
                onLoyaltyUpdate={(program) => console.log('Update loyalty program:', program)}
                onLoyaltyDelete={(id) => console.log('Delete loyalty program:', id)}
                onReferralCreate={(program) => console.log('Create referral program:', program)}
                onReferralUpdate={(program) => console.log('Update referral program:', program)}
                onReferralDelete={(id) => console.log('Delete referral program:', id)}
                onCustomerAction={(customerId, action) => console.log('Customer action:', customerId, action)}
                onAIGenerate={(type) => console.log('AI generate:', type)}
                onExportData={(format) => console.log('Export data:', format)}
                isLoading={false}
              />
            )}
          </div>
        </div>
      </div>

      {/* Custom Promotion Creation Modal */}
      {showPromotionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Create Custom Promotion</h2>
                <button
                  onClick={() => {
                    resetPromotionForm();
                    setShowPromotionModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  title="Close promotion modal"
                  aria-label="Close promotion modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Quick Templates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Quick Templates (Optional)</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => applyQuickTemplate('holiday')}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                    title="Apply holiday template"
                  >
                    🎄 Holiday Special
                  </button>
                  <button
                    onClick={() => applyQuickTemplate('new_customer')}
                    className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                    title="Apply new customer template"
                  >
                    👋 New Customer
                  </button>
                  <button
                    onClick={() => applyQuickTemplate('clearance')}
                    className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm"
                    title="Apply clearance template"
                  >
                    🔥 Clearance Sale
                  </button>
                  <button
                    onClick={() => applyQuickTemplate('loyalty')}
                    className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                    title="Apply loyalty template"
                  >
                    ⭐ Loyalty Rewards
                  </button>
                  <button
                    onClick={() => applyQuickTemplate('free_shipping')}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    title="Apply free shipping template"
                  >
                    🚚 Free Shipping
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Promotion Name *</label>
                    <input
                      type="text"
                      value={promotionForm.name}
                      onChange={(e) => setPromotionForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Black Friday Sale"
                      title="Enter promotion name"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      rows={3}
                      value={promotionForm.description}
                      onChange={(e) => setPromotionForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe your promotion..."
                      title="Enter promotion description"
                    />
                  </div>

                  {/* Type and Value */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                      <select
                        value={promotionForm.type}
                        onChange={(e) => setPromotionForm(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Select promotion type"
                      >
                        <option value="percentage">Percentage Discount</option>
                        <option value="fixed_amount">Fixed Amount</option>
                        <option value="bogo">Buy One Get One</option>
                        <option value="free_shipping">Free Shipping</option>
                        <option value="loyalty_points">Loyalty Points</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Value * {promotionForm.type === 'percentage' && '(%)'}
                        {promotionForm.type === 'fixed_amount' && '($)'}
                        {promotionForm.type === 'bogo' && '(%)'}
                        {promotionForm.type === 'loyalty_points' && '(points)'}
                        {promotionForm.type === 'free_shipping' && '(N/A)'}
                      </label>
                      <input
                        type="number"
                        value={promotionForm.value}
                        onChange={(e) => setPromotionForm(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={promotionForm.type === 'free_shipping' ? 'N/A' : '0'}
                        disabled={promotionForm.type === 'free_shipping'}
                        title="Enter promotion value"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={promotionForm.status}
                      onChange={(e) => setPromotionForm(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="Select promotion status"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>
                </div>

                {/* Right Column - Advanced Settings */}
                <div className="space-y-6">
                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={promotionForm.startDate}
                        onChange={(e) => setPromotionForm(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Select start date"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="date"
                        value={promotionForm.endDate}
                        onChange={(e) => setPromotionForm(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Select end date"
                      />
                    </div>
                  </div>

                  {/* Limits */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Min Order Amount ($)</label>
                      <input
                        type="number"
                        value={promotionForm.minimumOrderAmount}
                        onChange={(e) => setPromotionForm(prev => ({ ...prev, minimumOrderAmount: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                        title="Minimum order amount"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Usage Limit</label>
                      <input
                        type="number"
                        value={promotionForm.usageLimit}
                        onChange={(e) => setPromotionForm(prev => ({ ...prev, usageLimit: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0 = unlimited"
                        title="Usage limit (0 for unlimited)"
                      />
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promotionForm.promoCode}
                        onChange={(e) => setPromotionForm(prev => ({ ...prev, promoCode: e.target.value, autoGenerateCode: false }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter custom code or leave empty for auto-generation"
                        title="Enter promo code"
                      />
                      <button
                        onClick={() => {
                          const newCode = generatePromoCode();
                          setPromotionForm(prev => ({ ...prev, promoCode: newCode, autoGenerateCode: false }));
                        }}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Generate random promo code"
                      >
                        Generate
                      </button>
                    </div>
                    <label className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        checked={promotionForm.autoGenerateCode}
                        onChange={(e) => setPromotionForm(prev => ({ ...prev, autoGenerateCode: e.target.checked, promoCode: '' }))}
                        className="mr-2"
                        title="Auto-generate promo code"
                      />
                      <span className="text-sm text-gray-600">Auto-generate code</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      resetPromotionForm();
                      setShowPromotionModal(false);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCustomPromotionCreate}
                    disabled={isCreatingPromotion}
                    className={`px-6 py-2 rounded-lg transition-colors ${
                      isCreatingPromotion
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    title="Create custom promotion"
                  >
                    {isCreatingPromotion ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Creating...
                      </div>
                    ) : (
                      'Create Promotion'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Discount Code Creation Modal */}
      {showDiscountCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Create Advanced Discount Code</h2>
                  <p className="text-gray-600 mt-1">Smart templates, collision detection, and enterprise-grade features</p>
                </div>
                <button
                  onClick={() => {
                    resetDiscountCodeForm();
                    setShowDiscountCodeModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  title="Close discount code modal"
                  aria-label="Close discount code modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {/* Quick Templates */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Smart Templates</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => applyDiscountCodeTemplate('welcome')}
                    className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                    title="Apply welcome template"
                  >
                    👋 New Customer ($10 off)
                  </button>
                  <button
                    onClick={() => applyDiscountCodeTemplate('holiday')}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                    title="Apply holiday template"
                  >
                    🎄 Holiday (20% off)
                  </button>
                  <button
                    onClick={() => applyDiscountCodeTemplate('flash_sale')}
                    className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
                    title="Apply flash sale template"
                  >
                    ⚡ Flash Sale (15% off)
                  </button>
                  <button
                    onClick={() => applyDiscountCodeTemplate('loyalty')}
                    className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                    title="Apply loyalty template"
                  >
                    ⭐ VIP Customer (25% off)
                  </button>
                  <button
                    onClick={() => applyDiscountCodeTemplate('clearance')}
                    className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
                    title="Apply clearance template"
                  >
                    🔥 Clearance (30% off)
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    onClick={() => applyDiscountCodeTemplate('bulk')}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                    title="Apply bulk order template"
                  >
                    📦 Bulk Order (15% off)
                  </button>
                  <button
                    onClick={() => applyDiscountCodeTemplate('referral')}
                    className="px-3 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors text-sm font-medium"
                    title="Apply referral template"
                  >
                    👥 Refer Friend (20% off)
                  </button>
                  <button
                    onClick={() => applyDiscountCodeTemplate('seasonal')}
                    className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-sm font-medium"
                    title="Apply seasonal template"
                  >
                    🌸 Seasonal (25% off)
                  </button>
                  <button
                    onClick={() => applyDiscountCodeTemplate('early_bird')}
                    className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
                    title="Apply early bird template"
                  >
                    🌅 Early Bird (10% off)
                  </button>
                </div>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* 1. Smart Templates & Code Generator */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Code Generation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Code *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={discountCodeForm.code}
                      onChange={(e) => {
                        const code = e.target.value.toUpperCase();
                        setDiscountCodeForm(prev => ({ ...prev, code, autoGenerateCode: false }));
                        if (code) checkCodeCollision(code);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-lg"
                      placeholder="SAVE20"
                      disabled={discountCodeForm.autoGenerateCode}
                      title="Enter discount code"
                    />
                    <button
                      onClick={() => {
                        const newCode = generateDiscountCode(discountCodeForm.generatePattern);
                        setDiscountCodeForm(prev => ({ ...prev, code: newCode, autoGenerateCode: false }));
                        checkCodeCollision(newCode);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      title="Generate discount code"
                    >
                      Generate
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={discountCodeForm.autoGenerateCode}
                        onChange={(e) => setDiscountCodeForm(prev => ({ ...prev, autoGenerateCode: e.target.checked, code: '' }))}
                        className="mr-2"
                        title="Auto-generate discount code"
                      />
                      <span className="text-sm text-gray-600">Auto-generate</span>
                    </label>
                    <input
                      type="text"
                      value={discountCodeForm.generatePattern}
                      onChange={(e) => setDiscountCodeForm(prev => ({ ...prev, generatePattern: e.target.value }))}
                      className="px-2 py-1 text-xs border border-gray-300 rounded font-mono"
                      placeholder="SAVE{RAND4}"
                      title="Code generation pattern"
                    />
                  </div>
                  {discountCodeForm.code && collisionCheck[discountCodeForm.code] && (
                    <div className="mt-2 flex items-center text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Code already exists
                    </div>
                  )}
                </div>

                {/* Description & Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <input
                    type="text"
                    value={discountCodeForm.description}
                    onChange={(e) => setDiscountCodeForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 20% off all items"
                    title="Enter discount code description"
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={discountCodeForm.isActive}
                        onChange={(e) => setDiscountCodeForm(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="mr-2"
                        title="Enable/disable discount code"
                      />
                      <span className="text-sm font-medium text-gray-700">Active immediately</span>
                    </label>
                    <select
                      value={discountCodeForm.timezone}
                      onChange={(e) => setDiscountCodeForm(prev => ({ ...prev, timezone: e.target.value }))}
                      className="px-2 py-1 text-sm border border-gray-300 rounded"
                      title="Timezone"
                    >
                      <option value="EST">EST</option>
                      <option value="PST">PST</option>
                      <option value="CST">CST</option>
                      <option value="MST">MST</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Code Type & Scope */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Type & Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select
                    value={discountCodeForm.type}
                    onChange={(e) => setDiscountCodeForm(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    title="Select discount type"
                  >
                    <option value="percentage">Percentage Discount</option>
                    <option value="fixed_amount">Fixed Amount</option>
                    <option value="free_shipping">Free Shipping</option>
                    <option value="bogo">Buy X Get Y</option>
                    <option value="tiered">Tiered (Spend Thresholds)</option>
                  </select>
                  
                  {/* Dynamic Value Input */}
                  {discountCodeForm.type === 'percentage' && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Percentage (%)</label>
                      <input
                        type="number"
                        value={discountCodeForm.value}
                        onChange={(e) => setDiscountCodeForm(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="20"
                        title="Discount percentage"
                      />
                    </div>
                  )}
                  
                  {discountCodeForm.type === 'fixed_amount' && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
                      <input
                        type="number"
                        value={discountCodeForm.value}
                        onChange={(e) => setDiscountCodeForm(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="10"
                        title="Fixed discount amount"
                      />
                    </div>
                  )}
                  
                  {discountCodeForm.type === 'bogo' && (
                    <div className="mt-3 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Buy Quantity</label>
                          <input
                            type="number"
                            value={discountCodeForm.bogoConfig.buyQty}
                            onChange={(e) => setDiscountCodeForm(prev => ({
                              ...prev,
                              bogoConfig: { ...prev.bogoConfig, buyQty: parseInt(e.target.value) || 1 }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            title="Buy quantity"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Get Quantity</label>
                          <input
                            type="number"
                            value={discountCodeForm.bogoConfig.getQty}
                            onChange={(e) => setDiscountCodeForm(prev => ({
                              ...prev,
                              bogoConfig: { ...prev.bogoConfig, getQty: parseInt(e.target.value) || 1 }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            title="Get quantity"
                          />
                        </div>
                      </div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={discountCodeForm.bogoConfig.sameCollection}
                          onChange={(e) => setDiscountCodeForm(prev => ({
                            ...prev,
                            bogoConfig: { ...prev.bogoConfig, sameCollection: e.target.checked }
                          }))}
                          className="mr-2"
                          title="Same collection requirement"
                        />
                        <span className="text-sm text-gray-600">Same collection required</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Scope & Channels */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Scope</label>
                  <div className="space-y-2">
                    {['entire_cart', 'collections', 'products', 'first_order', 'subscription', 'sales_window'].map((scope) => (
                      <label key={scope} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={discountCodeForm.scope.includes(scope)}
                          onChange={(e) => {
                            const newScope = e.target.checked
                              ? [...discountCodeForm.scope, scope]
                              : discountCodeForm.scope.filter(s => s !== scope);
                            setDiscountCodeForm(prev => ({ ...prev, scope: newScope }));
                          }}
                          className="mr-2"
                          title={`Apply to ${scope.replace('_', ' ')}`}
                        />
                        <span className="text-sm text-gray-700 capitalize">{scope.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                  
                  <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">Channels</label>
                  <div className="space-y-2">
                    {['marketplace', 'pickup', 'delivery', 'dropoff', 'market_event', 'app_only'].map((channel) => (
                      <label key={channel} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={discountCodeForm.channels.includes(channel)}
                          onChange={(e) => {
                            const newChannels = e.target.checked
                              ? [...discountCodeForm.channels, channel]
                              : discountCodeForm.channels.filter(c => c !== channel);
                            setDiscountCodeForm(prev => ({ ...prev, channels: newChannels }));
                          }}
                          className="mr-2"
                          title={`Available on ${channel.replace('_', ' ')}`}
                        />
                        <span className="text-sm text-gray-700 capitalize">{channel.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={discountCodeForm.startDate}
                    onChange={(e) => setDiscountCodeForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    title="Select start date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={discountCodeForm.endDate}
                    onChange={(e) => setDiscountCodeForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    title="Select end date"
                  />
                </div>
              </div>

              {/* 3. Eligibility & Limits Accordion */}
              <div className="border border-gray-200 rounded-lg mb-6">
                <button
                  onClick={() => toggleAccordion('eligibility')}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-900">Advanced · Eligibility & Limits</span>
                  <span className={`transform transition-transform ${expandedAccordions.eligibility ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {expandedAccordions.eligibility && (
                  <div className="px-4 pb-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                      {/* Limits */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Usage Limits</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Usage</label>
                            <input
                              type="number"
                              value={discountCodeForm.limits.totalUsage}
                              onChange={(e) => setDiscountCodeForm(prev => ({
                                ...prev,
                                limits: { ...prev.limits, totalUsage: parseInt(e.target.value) || 0 }
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="0 = unlimited"
                              title="Total usage limit"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Per Customer</label>
                            <input
                              type="number"
                              value={discountCodeForm.limits.perCustomer}
                              onChange={(e) => setDiscountCodeForm(prev => ({
                                ...prev,
                                limits: { ...prev.limits, perCustomer: parseInt(e.target.value) || 0 }
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="0 = unlimited"
                              title="Per customer limit"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Min Spend ($)</label>
                            <input
                              type="number"
                              value={discountCodeForm.limits.minSpend}
                              onChange={(e) => setDiscountCodeForm(prev => ({
                                ...prev,
                                limits: { ...prev.limits, minSpend: parseFloat(e.target.value) || 0 }
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="0"
                              title="Minimum spend"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Spend ($)</label>
                            <input
                              type="number"
                              value={discountCodeForm.limits.maxSpend}
                              onChange={(e) => setDiscountCodeForm(prev => ({
                                ...prev,
                                limits: { ...prev.limits, maxSpend: parseFloat(e.target.value) || 0 }
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="0 = unlimited"
                              title="Maximum spend"
                            />
                          </div>
                        </div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={discountCodeForm.limits.oneTime}
                            onChange={(e) => setDiscountCodeForm(prev => ({
                              ...prev,
                              limits: { ...prev.limits, oneTime: e.target.checked }
                            }))}
                            className="mr-2"
                            title="One-time use only"
                          />
                          <span className="text-sm text-gray-600">One-time use only</span>
                        </label>
                      </div>

                      {/* Audience & Stacking */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Audience & Stacking</h4>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
                          <select
                            value={discountCodeForm.audience.newReturning}
                            onChange={(e) => setDiscountCodeForm(prev => ({
                              ...prev,
                              audience: { ...prev.audience, newReturning: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            title="Select customer type"
                          >
                            <option value="all">All customers</option>
                            <option value="new">New customers only</option>
                            <option value="returning">Returning customers only</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Stacking Policy</label>
                          <select
                            value={discountCodeForm.stacking.policy}
                            onChange={(e) => setDiscountCodeForm(prev => ({
                              ...prev,
                              stacking: { ...prev.stacking, policy: e.target.value as any }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            title="Select stacking policy"
                          >
                            <option value="exclusive">Exclusive (cannot combine)</option>
                            <option value="stackable">Stackable (can combine)</option>
                            <option value="mutually_exclusive">Mutually Exclusive (group)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Guardrails & Forecast Accordion */}
              <div className="border border-gray-200 rounded-lg mb-6">
                <button
                  onClick={() => toggleAccordion('guardrails')}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-900">Advanced · Guardrails & Forecast</span>
                  <span className={`transform transition-transform ${expandedAccordions.guardrails ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {expandedAccordions.guardrails && (
                  <div className="px-4 pb-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                      {/* Guardrails */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Safety Guardrails</h4>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount ($)</label>
                          <input
                            type="number"
                            value={discountCodeForm.guardrails.maxDiscount}
                            onChange={(e) => setDiscountCodeForm(prev => ({
                              ...prev,
                              guardrails: { ...prev.guardrails, maxDiscount: parseFloat(e.target.value) || 0 }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="0 = no limit"
                            title="Maximum discount amount"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Margin Floor (%)</label>
                          <input
                            type="number"
                            value={discountCodeForm.guardrails.marginFloor}
                            onChange={(e) => setDiscountCodeForm(prev => ({
                              ...prev,
                              guardrails: { ...prev.guardrails, marginFloor: parseFloat(e.target.value) || 0 }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="0 = no floor"
                            title="Minimum margin percentage"
                          />
                        </div>
                      </div>

                      {/* Forecast Preview */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Forecast Preview</h4>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-sm space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Exposure today:</span>
                              <span className="font-medium">$0</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Est. redemptions/day:</span>
                              <span className="font-medium">0</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Inventory alerts:</span>
                              <span className="font-medium text-green-600">None</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Instant Distribution Accordion */}
              <div className="border border-gray-200 rounded-lg mb-6">
                <button
                  onClick={() => toggleAccordion('distribution')}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-900">Share & Track</span>
                  <span className={`transform transition-transform ${expandedAccordions.distribution ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {expandedAccordions.distribution && (
                  <div className="px-4 pb-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                      {/* Auto-apply Link */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Auto-apply Link</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={`${window.location.origin}/apply/${discountCodeForm.code || 'CODE'}`}
                            readOnly
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                          />
                          <button
                            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/apply/${discountCodeForm.code || 'CODE'}`)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            title="Copy link"
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      {/* QR Code & Best Code */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">QR Code</span>
                          <div className="w-16 h-16 bg-gray-200 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <span className="text-xs text-gray-500">QR</span>
                          </div>
                        </div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={discountCodeForm.distribution.participateInBestCode}
                            onChange={(e) => setDiscountCodeForm(prev => ({
                              ...prev,
                              distribution: { ...prev.distribution, participateInBestCode: e.target.checked }
                            }))}
                            className="mr-2"
                            title="Participate in best code resolver"
                          />
                          <span className="text-sm text-gray-600">Auto-apply best code</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Rule Summary & Footer */}
            <div className="border-t border-gray-200 bg-gray-50 p-4 flex-shrink-0">
              <div className="mb-4">
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-sm font-mono text-gray-700">
                    {generateRuleSummary()}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      resetDiscountCodeForm();
                      setShowDiscountCodeModal(false);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Preview eligibility rules"
                  >
                    Preview Eligibility
                  </button>
                </div>
                
                <div className="flex gap-3">
                  <button
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Save as draft"
                  >
                    Save as Draft
                  </button>
                  <button
                    onClick={handleDiscountCodeCreate}
                    disabled={isCreatingDiscountCode}
                    className={`px-6 py-2 rounded-lg transition-colors ${
                      isCreatingDiscountCode
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                    title="Create advanced discount code"
                  >
                    {isCreatingDiscountCode ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Creating...
                      </div>
                    ) : (
                      'Create Discount Code'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </VendorDashboardLayout>
  );
};

export default VendorPromotionsPage;
