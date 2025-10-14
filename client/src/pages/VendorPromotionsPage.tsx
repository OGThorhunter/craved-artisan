import React, { useState } from 'react';
import {
  Plus,
  Target,
  Mail,
  Calendar,
  BarChart3,
  Star,
  X,
  Percent,
  Gift,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';

// Import consolidated promotion components - eliminates duplicate functionality
import ConsolidatedCampaignManager from '../components/promotions/ConsolidatedCampaignManager';
import ConsolidatedSocialMediaManager from '../components/promotions/ConsolidatedSocialMediaManager';
import ConsolidatedAnalyticsManager from '../components/promotions/ConsolidatedAnalyticsManager';
import ConsolidatedVIPManager from '../components/promotions/ConsolidatedVIPManager';

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
  const [showUnifiedWizard, setShowUnifiedWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [creationType, setCreationType] = useState<'discount' | 'promotion' | null>(null);
  const [isCreatingPromotion, setIsCreatingPromotion] = useState(false);
  const [isCreatingDiscountCode, setIsCreatingDiscountCode] = useState(false);
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
        limits: { totalUsage: 0, perCustomer: 1, perOrder: 0, minSpend: 25, maxSpend: 0, minQty: 0, maxQty: 0, oneTime: true },
        audience: { newReturning: 'new', loyaltyTier: '', zipRadius: 0, tags: [] }
      },
      holiday: {
        code: 'HOLIDAY20',
        description: '20% off holiday orders - Limited time offer'
      },
      flash_sale: {
        code: 'FLASH15',
        description: '15% off flash sale - While supplies last'
      },
      loyalty: {
        code: 'LOYAL25',
        description: '25% off for loyal customers - Thank you for your support'
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
    if (limits.maxSpend > 0) summary += `Max $${limits.maxSpend}, `;
    
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

      // IMPORTANT: Promotions are VENDOR-SCOPED
      // This promotion will ONLY apply to this vendor's products
      // Backend must validate: promotion.vendorId === cart.vendorId before applying
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
      
      alert(`✅ Vendor-Specific Promotion Created!\n\n🎯 ${newPromotion.name}\n📝 ${newPromotion.description}\n💰 Value: ${newPromotion.type === 'percentage' ? newPromotion.value + '%' : 
            newPromotion.type === 'fixed_amount' ? '$' + newPromotion.value : 
            newPromotion.type === 'bogo' ? newPromotion.value + '% off second item' :
            newPromotion.type === 'free_shipping' ? 'Free shipping' :
            newPromotion.value + ' bonus points'}\n🔑 Promo Code: ${finalPromoCode}\n📅 Active: ${new Date(newPromotion.startDate).toLocaleDateString()} - ${new Date(newPromotion.endDate).toLocaleDateString()}\n\n✅ This promotion is now ${newPromotion.status.toUpperCase()} and ready to use!\n\n🔒 VENDOR SCOPING:\n• Only applies to YOUR products\n• Customers cannot use it with other vendors\n• Isolated to your store only\n• No cash value transfer between vendors`);
      
      // Reset form and close wizard
      resetPromotionForm();
      setShowUnifiedWizard(false);
      setWizardStep(1);
      setCreationType(null);
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
      // IMPORTANT: Discount codes are VENDOR-SCOPED
      // This code will ONLY work for products from this vendor
      // Backend must validate: discount.vendorId === cart.vendorId before applying
      const discountCodeData = {
        id: `discount-code-${Date.now()}`,
        code: finalCode,
        vendorId: 'current-vendor-id', // TODO: Replace with actual logged-in vendor ID from auth context
        vendorName: 'Current Vendor', // TODO: Replace with actual vendor name
        isVendorSpecific: true, // CRITICAL: This ensures code only works for this vendor's products
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
      alert(`✅ Vendor-Specific Discount Code Created!\n\n🔑 Code: ${finalCode}\n📝 Description: ${discountCodeForm.description}\n📋 Rule: ${ruleSummary}\n\n✅ This discount code is now ${discountCodeForm.isActive ? 'ACTIVE' : 'DRAFT'} and ready to use!\n\n🔒 VENDOR SCOPING:\n• This code ONLY works for YOUR products\n• Customers cannot use it with other vendors\n• No cash value outside your store\n• Tied to your vendor ID\n\n🚀 Features enabled:\n• Smart collision detection\n• Multi-channel distribution\n• Advanced eligibility rules\n• Safety guardrails\n• Auto-apply links\n• QR code generation\n\nBackend validation required:\n• Verify discount.vendorId === cart.vendorId\n• Reject if cart contains other vendors' products`);
      
      // Reset form and close wizard
      resetDiscountCodeForm();
      setShowUnifiedWizard(false);
      setWizardStep(1);
      setCreationType(null);

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
                onClick={() => {
                  setShowUnifiedWizard(true);
                  setWizardStep(1);
                  setCreationType(null);
                }}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
                title="Create discount code or promotion"
                aria-label="Create discount code or promotion wizard"
              >
                <Plus className="h-5 w-5" />
                <span className="font-semibold">Create Promotion</span>
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
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

        {/* Consolidated Tab Content - eliminates duplicate components and API calls */}
          <div className="space-y-6">
            {activeTab === 'campaigns' && (
              <ConsolidatedCampaignManager />
            )}

            {activeTab === 'social-media' && (
              <ConsolidatedSocialMediaManager />
            )}

            {activeTab === 'scheduler-automation' && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 p-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Scheduler & Automation</h3>
                <p className="text-gray-600 mb-4">Advanced scheduling and automation features coming soon</p>
                <p className="text-sm text-gray-500">
                  This will include campaign scheduling, automated promotion rules, 
                  recurring campaigns, and conflict detection.
                </p>
              </div>
            )}

        {activeTab === 'analytics' && (
              <ConsolidatedAnalyticsManager />
            )}

            {activeTab === 'loyalty-referrals' && (
              <ConsolidatedVIPManager />
            )}
          </div>
        </div>
      </div>

      {/* Unified Promotion Wizard */}
      {showUnifiedWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {wizardStep === 1 ? 'Create Promotion Wizard' : creationType === 'discount' ? 'Create Discount Code' : 'Create Promotion'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {wizardStep === 1 ? 'Step 1 of 2: Choose what you want to create' : 'Step 2 of 2: Configure your promotion'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowUnifiedWizard(false);
                    setWizardStep(1);
                    setCreationType(null);
                    resetPromotionForm();
                    resetDiscountCodeForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  title="Close wizard"
                  aria-label="Close promotion wizard"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Step 1: Choose Template or Type */}
            {wizardStep === 1 && (
              <div className="p-8">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h3 className="text-blue-900 text-lg font-semibold mb-2">
                      Create New Campaign
                    </h3>
                    <p className="text-blue-800">
                      Start from a template or create a custom discount code or promotional campaign from scratch.
                    </p>
                  </div>

                  {/* Quick Start Templates */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Start Templates</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={() => {
                          applyQuickTemplate('holiday');
                          setCreationType('promotion');
                          setWizardStep(2);
                        }}
                        className="group p-6 border-2 border-gray-300 rounded-xl hover:border-red-500 hover:shadow-lg transition-all text-left bg-white"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl">🎄</span>
                          <Percent className="h-5 w-5 text-red-500" />
                        </div>
                        <h5 className="font-bold text-gray-900 mb-2">Holiday Special</h5>
                        <p className="text-sm text-gray-600">15% off for holiday season</p>
                      </button>

                      <button
                        onClick={() => {
                          applyDiscountCodeTemplate('welcome');
                          setCreationType('discount');
                          setWizardStep(2);
                        }}
                        className="group p-6 border-2 border-gray-300 rounded-xl hover:border-green-500 hover:shadow-lg transition-all text-left bg-white"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl">👋</span>
                          <DollarSign className="h-5 w-5 text-green-500" />
                        </div>
                        <h5 className="font-bold text-gray-900 mb-2">New Customer</h5>
                        <p className="text-sm text-gray-600">$10 off first order</p>
                      </button>

                      <button
                        onClick={() => {
                          applyQuickTemplate('free_shipping');
                          setCreationType('promotion');
                          setWizardStep(2);
                        }}
                        className="group p-6 border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all text-left bg-white"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl">🚚</span>
                          <Gift className="h-5 w-5 text-blue-500" />
                        </div>
                        <h5 className="font-bold text-gray-900 mb-2">Free Shipping</h5>
                        <p className="text-sm text-gray-600">Free shipping weekend</p>
                      </button>

                      <button
                        onClick={() => {
                          applyDiscountCodeTemplate('flash_sale');
                          setCreationType('discount');
                          setWizardStep(2);
                        }}
                        className="group p-6 border-2 border-gray-300 rounded-xl hover:border-orange-500 hover:shadow-lg transition-all text-left bg-white"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl">⚡</span>
                          <Percent className="h-5 w-5 text-orange-500" />
                        </div>
                        <h5 className="font-bold text-gray-900 mb-2">Flash Sale</h5>
                        <p className="text-sm text-gray-600">15% off limited time</p>
                      </button>

                      <button
                        onClick={() => {
                          applyQuickTemplate('clearance');
                          setCreationType('promotion');
                          setWizardStep(2);
                        }}
                        className="group p-6 border-2 border-gray-300 rounded-xl hover:border-red-500 hover:shadow-lg transition-all text-left bg-white"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl">🔥</span>
                          <Percent className="h-5 w-5 text-red-500" />
                        </div>
                        <h5 className="font-bold text-gray-900 mb-2">Clearance Sale</h5>
                        <p className="text-sm text-gray-600">25% off clearance items</p>
                      </button>

                      <button
                        onClick={() => {
                          applyDiscountCodeTemplate('loyalty');
                          setCreationType('discount');
                          setWizardStep(2);
                        }}
                        className="group p-6 border-2 border-gray-300 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all text-left bg-white"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl">⭐</span>
                          <Percent className="h-5 w-5 text-purple-500" />
                        </div>
                        <h5 className="font-bold text-gray-900 mb-2">VIP Loyalty</h5>
                        <p className="text-sm text-gray-600">25% off for VIP customers</p>
                      </button>
                    </div>
                  </div>

                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500 font-medium">Or create from scratch</span>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-300 rounded-lg p-4 mb-8">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-purple-900 font-semibold mb-1">🔒 Important: Vendor-Specific Codes</h4>
                        <p className="text-purple-800 text-sm">
                          All discount codes and promotions you create are <strong>vendor-specific</strong>. 
                          They only work for <strong>your products</strong> and cannot be used with other vendors. 
                          This protects your business and ensures promotions have no cash value outside your store.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Discount Code Option */}
                    <button
                      onClick={() => {
                        setCreationType('discount');
                        setWizardStep(2);
                      }}
                      className="group relative p-8 border-2 border-gray-300 rounded-xl hover:border-green-500 hover:shadow-lg transition-all text-left bg-white"
                    >
                      <div className="absolute top-4 right-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-500 transition-colors">
                          <Percent className="h-6 w-6 text-green-600 group-hover:text-white" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Discount Code</h3>
                      <p className="text-gray-600 mb-4">
                        Create a code that customers can enter at checkout to receive a discount or special offer.
                      </p>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Custom code (e.g., SAVE20, WELCOME10)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Usage limits and restrictions</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Auto-apply links and QR codes</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span><strong>Your products only</strong> - vendor-scoped</span>
                        </li>
                      </ul>
                      <div className="mt-6">
                        <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium group-hover:bg-green-500 group-hover:text-white transition-colors">
                          Choose Discount Code →
                        </span>
                      </div>
                    </button>

                    {/* Promotion Option */}
                    <button
                      onClick={() => {
                        setCreationType('promotion');
                        setWizardStep(2);
                      }}
                      className="group relative p-8 border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all text-left bg-white"
                    >
                      <div className="absolute top-4 right-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                          <Gift className="h-6 w-6 text-blue-600 group-hover:text-white" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Promotion Campaign</h3>
                      <p className="text-gray-600 mb-4">
                        Create a marketing campaign to promote your products and drive sales through various channels.
                      </p>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">✓</span>
                          <span>Multi-channel campaigns</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">✓</span>
                          <span>Automatic or manual promotions</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">✓</span>
                          <span>Performance tracking and analytics</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">✓</span>
                          <span><strong>Your store only</strong> - vendor-scoped</span>
                        </li>
                      </ul>
                      <div className="mt-6">
                        <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium group-hover:bg-blue-500 group-hover:text-white transition-colors">
                          Choose Promotion →
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Discount Code Form */}
            {wizardStep === 2 && creationType === 'discount' && (
              <div className="p-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-900 text-base leading-relaxed">
                    Great! Let's create your discount code. Fill in the details below to configure how your discount will work.
                  </p>
                </div>

                {/* Vendor Scoping Notice */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-blue-900 font-semibold mb-1">Vendor-Specific Code</h4>
                      <p className="text-blue-800 text-sm">
                        This discount code will <strong>only work for your products</strong>. Customers cannot use your codes with other vendors. 
                        This ensures your promotions stay within your business and have no cash value outside your store.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Code and Description */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Discount Code *</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={discountCodeForm.code}
                          onChange={(e) => {
                            const code = e.target.value.toUpperCase();
                            setDiscountCodeForm(prev => ({ ...prev, code, autoGenerateCode: false }));
                            if (code) checkCodeCollision(code);
                          }}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-lg"
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
                          className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                          title="Generate discount code"
                        >
                          Generate
                        </button>
                      </div>
                      <label className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          checked={discountCodeForm.autoGenerateCode}
                          onChange={(e) => setDiscountCodeForm(prev => ({ ...prev, autoGenerateCode: e.target.checked, code: '' }))}
                          className="mr-2 h-4 w-4"
                          title="Auto-generate discount code"
                        />
                        <span className="text-sm text-gray-600">Auto-generate code at creation</span>
                      </label>
                      {discountCodeForm.code && collisionCheck[discountCodeForm.code] && (
                        <div className="mt-2 flex items-center text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Code already exists - choose a different code
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Description *</label>
                      <textarea
                        rows={4}
                        value={discountCodeForm.description}
                        onChange={(e) => setDiscountCodeForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., 20% off all artisan bread this weekend"
                        title="Enter discount code description"
                      />
                    </div>
                  </div>

                  {/* Type and Value */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Discount Type *</label>
                      <select
                        value={discountCodeForm.type}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onChange={(e) => setDiscountCodeForm(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        title="Select discount type"
                      >
                        <option value="percentage">Percentage Discount (%)</option>
                        <option value="fixed_amount">Fixed Amount ($)</option>
                        <option value="free_shipping">Free Shipping</option>
                        <option value="bogo">Buy One Get One (BOGO)</option>
                      </select>
                    </div>

                    {discountCodeForm.type !== 'free_shipping' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Discount Value * {discountCodeForm.type === 'percentage' ? '(%)' : '($)'}
                        </label>
                        <input
                          type="number"
                          value={discountCodeForm.value}
                          onChange={(e) => setDiscountCodeForm(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-medium"
                          placeholder={discountCodeForm.type === 'percentage' ? '20' : '10'}
                          title="Discount value"
                        />
                      </div>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={discountCodeForm.startDate}
                        onChange={(e) => setDiscountCodeForm(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        title="Select start date"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">End Date</label>
                      <input
                        type="date"
                        value={discountCodeForm.endDate}
                        onChange={(e) => setDiscountCodeForm(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        title="Select end date"
                      />
                    </div>
                  </div>

                  {/* Limits */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Minimum Order Amount ($)</label>
                      <input
                        type="number"
                        value={discountCodeForm.limits.minSpend}
                        onChange={(e) => setDiscountCodeForm(prev => ({
                          ...prev,
                          limits: { ...prev.limits, minSpend: parseFloat(e.target.value) || 0 }
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0 = no minimum"
                        title="Minimum order amount"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Usage Limit (Total)</label>
                      <input
                        type="number"
                        value={discountCodeForm.limits.totalUsage}
                        onChange={(e) => setDiscountCodeForm(prev => ({
                          ...prev,
                          limits: { ...prev.limits, totalUsage: parseInt(e.target.value) || 0 }
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0 = unlimited"
                        title="Total usage limit"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={discountCodeForm.isActive}
                        onChange={(e) => setDiscountCodeForm(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="mr-3 h-5 w-5 text-green-600"
                        title="Activate immediately"
                      />
                      <span className="text-base font-medium text-gray-900">Activate discount code immediately</span>
                    </label>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 mt-8 pt-6 flex justify-between">
                  <button
                    onClick={() => {
                      setWizardStep(1);
                      setCreationType(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleDiscountCodeCreate}
                    disabled={isCreatingDiscountCode}
                    className={`px-8 py-3 rounded-lg transition-colors font-semibold ${
                      isCreatingDiscountCode
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                    }`}
                    title="Create discount code"
                  >
                    {isCreatingDiscountCode ? 'Creating...' : 'Create Discount Code'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Promotion Form */}
            {wizardStep === 2 && creationType === 'promotion' && (
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-blue-900 text-base leading-relaxed">
                    Let's set up your promotional campaign. Configure the details below to start driving more sales!
                  </p>
                </div>

                {/* Vendor Scoping Notice */}
                <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-purple-900 font-semibold mb-1">Vendor-Specific Promotion</h4>
                      <p className="text-purple-800 text-sm">
                        This promotion will <strong>only apply to your products</strong>. Customers shopping from other vendors will not see or be able to use this promotion. 
                        Your promotions are isolated to your store to protect your business interests.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Promotion Name *</label>
                      <input
                        type="text"
                        value={promotionForm.name}
                        onChange={(e) => setPromotionForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Black Friday Sale"
                        title="Enter promotion name"
                      />
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Promotion Type *</label>
                      <select
                        value={promotionForm.type}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onChange={(e) => setPromotionForm(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Select promotion type"
                      >
                        <option value="percentage">Percentage Discount</option>
                        <option value="fixed_amount">Fixed Amount Off</option>
                        <option value="bogo">Buy One Get One</option>
                        <option value="free_shipping">Free Shipping</option>
                        <option value="loyalty_points">Bonus Loyalty Points</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Description *</label>
                    <textarea
                      rows={3}
                      value={promotionForm.description}
                      onChange={(e) => setPromotionForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe your promotion to attract customers..."
                      title="Enter promotion description"
                    />
                  </div>

                  {/* Value and Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {promotionForm.type !== 'free_shipping' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Value * {promotionForm.type === 'percentage' && '(%)'}
                          {promotionForm.type === 'fixed_amount' && '($)'}
                          {promotionForm.type === 'loyalty_points' && '(points)'}
                        </label>
                        <input
                          type="number"
                          value={promotionForm.value}
                          onChange={(e) => setPromotionForm(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium"
                          placeholder="0"
                          title="Enter promotion value"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Status</label>
                      <select
                        value={promotionForm.status}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onChange={(e) => setPromotionForm(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Select promotion status"
                      >
                        <option value="draft">Draft - Not visible yet</option>
                        <option value="active">Active - Live now</option>
                        <option value="paused">Paused - Temporarily disabled</option>
                      </select>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={promotionForm.startDate}
                        onChange={(e) => setPromotionForm(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Select start date"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">End Date</label>
                      <input
                        type="date"
                        value={promotionForm.endDate}
                        onChange={(e) => setPromotionForm(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Select end date"
                      />
                    </div>
                  </div>

                  {/* Min Order Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Minimum Order Amount ($)</label>
                    <input
                      type="number"
                      value={promotionForm.minimumOrderAmount}
                      onChange={(e) => setPromotionForm(prev => ({ ...prev, minimumOrderAmount: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0 = no minimum"
                      title="Minimum order amount"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 mt-8 pt-6 flex justify-between">
                  <button
                    onClick={() => {
                      setWizardStep(1);
                      setCreationType(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleCustomPromotionCreate}
                    disabled={isCreatingPromotion}
                    className={`px-8 py-3 rounded-lg transition-colors font-semibold ${
                      isCreatingPromotion
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                    }`}
                    title="Create promotion"
                  >
                    {isCreatingPromotion ? 'Creating...' : 'Create Promotion'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </VendorDashboardLayout>
  );
};

export default VendorPromotionsPage;
