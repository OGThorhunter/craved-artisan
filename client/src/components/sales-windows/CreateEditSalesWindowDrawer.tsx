import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import type { SalesWindow, SalesChannel, WindowProduct } from '@/types/sales-windows';
import ProductSelectionStep from './ProductSelectionStep';

interface CreateEditSalesWindowDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  window?: SalesWindow; // If provided, we're editing; otherwise creating
  onSave: (window: Partial<SalesWindow>) => void;
  onCreateBatchOrders?: (products: Array<{product: WindowProduct, quantity: number}>) => void;
}

const CreateEditSalesWindowDrawer: React.FC<CreateEditSalesWindowDrawerProps> = ({
  isOpen,
  onClose,
  window,
  onSave,
  onCreateBatchOrders
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<SalesWindow>>({
    name: window?.name || '',
    description: window?.description || '',
    status: window?.status || 'DRAFT',
    isEvergreen: window?.isEvergreen || false,
    startDate: window?.startDate || '',
    endDate: window?.endDate || '',
    timezone: window?.timezone || 'America/New_York',
    channels: window?.channels || [],
    products: window?.products || [],
    settings: window?.settings || {
      allowPreorders: true,
      showInStorefront: true,
      autoCloseWhenSoldOut: false,
      capacity: 100,
      tags: []
    }
  });

  const totalSteps = 5;
  const isEditing = !!window;

  // Update form data when window prop changes (for editing)
  useEffect(() => {
    if (window) {
      setFormData({
        name: window.name || '',
        description: window.description || '',
        status: window.status || 'DRAFT',
        isEvergreen: window.isEvergreen || false,
        startDate: window.startDate || '',
        endDate: window.endDate || '',
        timezone: window.timezone || 'America/New_York',
        channels: window.channels || [],
        products: window.products || [],
        settings: window.settings || {
          allowPreorders: true,
          showInStorefront: true,
          autoCloseWhenSoldOut: false,
          capacity: 100,
          tags: []
        }
      });
    } else {
      // Reset form data for new window creation
      setFormData({
        name: '',
        description: '',
        status: 'DRAFT',
        isEvergreen: false,
        startDate: '',
        endDate: '',
        timezone: 'America/New_York',
        channels: [],
        products: [],
        settings: {
          allowPreorders: true,
          showInStorefront: true,
          autoCloseWhenSoldOut: false,
          capacity: 100,
          tags: []
        }
      });
    }
    // Reset to step 1 when window changes or when drawer opens
    setCurrentStep(1);
  }, [window, isOpen]);


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSettingsChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      settings: { ...prev.settings!, [field]: value }
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            i + 1 < currentStep
              ? 'bg-green-500 text-white'
              : i + 1 === currentStep
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-600'
          }`}>
            {i + 1 < currentStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div className={`w-16 h-1 mx-2 ${
              i + 1 < currentStep ? 'bg-green-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStepTitle = () => {
    const titles = [
      'About Your Sale',
      'Category & Schedule',
      'Choose Products',
      'Marketing & Tags',
      'Review & Confirm'
    ];
    return (
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {isEditing ? 'Edit' : 'Create'} Sales Window - {titles[currentStep - 1]}
      </h2>
    );
  };

  const renderStep1Basics = () => (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-900 text-base leading-relaxed">
          Welcome to the sales window wizard! This is where you come to setup your various sales and events. 
          Let's start off by telling me about your sale.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Name of Sale *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
          placeholder="e.g., Saturday Farmers Market, Holiday Bake Sale"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
          placeholder="Tell customers what makes this sale special..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) => handleInputChange('status', e.target.value)}
          className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base font-medium ${
            formData.status === 'OPEN' ? 'bg-green-50 text-green-800 border-green-300' :
            formData.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-800 border-blue-300' :
            'bg-gray-50 text-gray-800'
          }`}
          aria-label="Status"
        >
          <option value="DRAFT">Draft - Not visible to customers</option>
          <option value="SCHEDULED">Scheduled - Will open automatically</option>
          <option value="OPEN">Open - Live and accepting orders</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          What day(s) are you selling product? *
        </label>
        <input
          type="date"
          value={formData.startDate ? formData.startDate.split('T')[0] : ''}
          onChange={(e) => {
            const time = formData.startDate ? formData.startDate.split('T')[1] : '09:00';
            handleInputChange('startDate', `${e.target.value}T${time}`);
            // Auto-set end date to same day if not set
            if (!formData.endDate) {
              handleInputChange('endDate', `${e.target.value}T17:00`);
            }
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
          aria-label="Sale date"
        />
        <p className="text-sm text-gray-500 mt-1">Select the primary day of your sale or event</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          What times will you be at this location selling this product? *
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Start Time</label>
            <select
              value={formData.startDate ? formData.startDate.split('T')[1] : '09:00'}
              onChange={(e) => {
                const date = formData.startDate ? formData.startDate.split('T')[0] : new Date().toISOString().split('T')[0];
                handleInputChange('startDate', `${date}T${e.target.value}`);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              aria-label="Start time"
            >
              {Array.from({ length: 24 }, (_, i) => {
                const hour = i.toString().padStart(2, '0');
                return (
                  <option key={`${hour}:00`} value={`${hour}:00`}>
                    {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i-12}:00 PM`}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">End Time</label>
            <select
              value={formData.endDate ? formData.endDate.split('T')[1] : '17:00'}
              onChange={(e) => {
                const date = formData.endDate ? formData.endDate.split('T')[0] : formData.startDate ? formData.startDate.split('T')[0] : new Date().toISOString().split('T')[0];
                handleInputChange('endDate', `${date}T${e.target.value}`);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              aria-label="End time"
            >
              {Array.from({ length: 24 }, (_, i) => {
                const hour = i.toString().padStart(2, '0');
                return (
                  <option key={`${hour}:00`} value={`${hour}:00`}>
                    {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i-12}:00 PM`}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">When will you be available for customers to pick up or receive their orders?</p>
      </div>
    </div>
  );

  const renderStep2Channels = () => (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-900 text-base leading-relaxed">
          Now we need to give your sales window a category. This helps customers understand how they'll receive their order.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Choose a Category *
        </label>
        <div className="grid grid-cols-1 gap-3">
          {[
            { type: 'MEETUP_PICKUP', label: 'Parking Lot Pickup', desc: 'Customers meet you at a specific location', icon: '🚗' },
            { type: 'DROP_OFF_LOCATION', label: 'Kiosk', desc: 'Drop off at a partner location or kiosk', icon: '🏪' },
            { type: 'DELIVERY', label: 'Delivery', desc: 'You deliver directly to customers', icon: '🚚' },
            { type: 'MARKET', label: 'Farmers Market', desc: 'Selling at a farmers market or event', icon: '🌾' },
            { type: 'CUSTOM', label: 'Find my product at local businesses', desc: 'Partner with local stores and shops', icon: '🏢' }
          ].map((option) => (
            <button
              key={option.type}
              type="button"
              onClick={() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const newChannel: SalesChannel = { type: option.type as any, config: {} };
                setFormData(prev => ({
                  ...prev,
                  channels: [newChannel]
                }));
              }}
              className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                formData.channels?.some(c => c.type === option.type)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-300 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{option.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.desc}</div>
                </div>
                {formData.channels?.some(c => c.type === option.type) && (
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Location and Dates */}
      {/* eslint-disable @typescript-eslint/no-explicit-any */}
      {formData.channels && formData.channels.length > 0 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              What is the location of this event? *
            </label>
            <input
              type="text"
              value={(formData.channels[0]?.config as any)?.locationAddress || ''}
              onChange={(e) => {
                const updatedChannels = [...(formData.channels || [])];
                (updatedChannels[0].config as any).locationAddress = e.target.value;
                setFormData(prev => ({ ...prev, channels: updatedChannels }));
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              placeholder="123 Main St, City, State ZIP"
            />
            <p className="text-sm text-gray-500 mt-1">Enter the full address where customers will meet you or receive their order</p>
          </div>

          <div>
            <label htmlFor="salesOpenDate" className="block text-sm font-medium text-gray-900 mb-2">
              When would you like sales to open? *
            </label>
            <input
              id="salesOpenDate"
              type="datetime-local"
              value={(formData.channels[0]?.config as any)?.preorderOpenAt || ''}
              onChange={(e) => {
                const updatedChannels = [...(formData.channels || [])];
                (updatedChannels[0].config as any).preorderOpenAt = e.target.value;
                setFormData(prev => ({ ...prev, channels: updatedChannels }));
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            />
            <p className="text-sm text-gray-500 mt-1">This is when your customers can see your sale and start ordering your products</p>
          </div>

          <div>
            <label htmlFor="salesEndDate" className="block text-sm font-medium text-gray-900 mb-2">
              When would you like your sale to end? *
            </label>
            <input
              id="salesEndDate"
              type="datetime-local"
              value={(formData.channels[0]?.config as any)?.preorderCloseAt || ''}
              onChange={(e) => {
                const updatedChannels = [...(formData.channels || [])];
                (updatedChannels[0].config as any).preorderCloseAt = e.target.value;
                setFormData(prev => ({ ...prev, channels: updatedChannels }));
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            />
            <p className="text-sm text-gray-500 mt-1">This is when sales will close out and no more sales will be allowed for this window</p>
          </div>

          <div>
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="isRecurring"
                checked={(formData.channels[0]?.config as any)?.isRecurring || false}
                onChange={(e) => {
                  const updatedChannels = [...(formData.channels || [])];
                  (updatedChannels[0].config as any).isRecurring = e.target.checked;
                  setFormData(prev => ({ ...prev, channels: updatedChannels }));
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-5 w-5"
              />
              <label htmlFor="isRecurring" className="ml-3 text-base font-medium text-gray-900">
                Is this a recurring event?
              </label>
            </div>
            
            {(formData.channels[0]?.config as any)?.isRecurring && (
              <div className="ml-8 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recurrence Pattern
                  </label>
                  <select
                    value={(formData.channels[0]?.config as any)?.recurrencePattern || 'WEEKLY'}
                    onChange={(e) => {
                      const updatedChannels = [...(formData.channels || [])];
                      (updatedChannels[0].config as any).recurrencePattern = e.target.value;
                      setFormData(prev => ({ ...prev, channels: updatedChannels }));
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Recurrence pattern"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="BIWEEKLY">Bi-weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
      {/* eslint-enable @typescript-eslint/no-explicit-any */}
    </div>
  );

  const renderStep3Products = () => (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-900 text-base leading-relaxed">
          Choose products from your inventory to include in this sale. These products will be available during your pre-order window. 
          You can set a limit to how many pre-orders are allowed per product to manage your capacity.
        </p>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-900 text-sm font-medium">
          💡 Tip: Select products you have available or can prepare for this specific sale window. 
          Your customers will only see these products during this sale period.
        </p>
      </div>
      
      <ProductSelectionStep
        selectedProducts={formData.products || []}
        onProductsChange={(products) => handleInputChange('products', products)}
        onCreateBatchOrders={onCreateBatchOrders}
      />
    </div>
  );

  const renderStep4Settings = () => (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-900 text-base leading-relaxed">
          Configure your sale settings and add tags to help customers discover your products!
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Product Tags (comma-separated)
        </label>
        <input
          type="text"
          value={formData.settings?.tags?.join(', ') || ''}
          onChange={(e) => handleSettingsChange('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
          placeholder="e.g., bread, organic, local, weekend"
        />
        <p className="text-sm text-gray-500 mt-1">Add keywords to help customers find your sale (visible in search results)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="allowPreorders"
            checked={formData.settings?.allowPreorders}
            onChange={(e) => handleSettingsChange('allowPreorders', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1 h-5 w-5"
          />
          <label htmlFor="allowPreorders" className="ml-3">
            <div className="text-base font-medium text-gray-900">Allow Preorders</div>
            <div className="text-sm text-gray-500">Customers can order before the event</div>
          </label>
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            id="showInStorefront"
            checked={formData.settings?.showInStorefront}
            onChange={(e) => handleSettingsChange('showInStorefront', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1 h-5 w-5"
          />
          <label htmlFor="showInStorefront" className="ml-3">
            <div className="text-base font-medium text-gray-900">Show in Storefront</div>
            <div className="text-sm text-gray-500">Make this sale visible to customers</div>
          </label>
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            id="autoCloseWhenSoldOut"
            checked={formData.settings?.autoCloseWhenSoldOut}
            onChange={(e) => handleSettingsChange('autoCloseWhenSoldOut', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1 h-5 w-5"
          />
          <label htmlFor="autoCloseWhenSoldOut" className="ml-3">
            <div className="text-base font-medium text-gray-900">Auto-close when sold out</div>
            <div className="text-sm text-gray-500">Close sales when products run out</div>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Total Capacity
        </label>
        <input
          type="number"
          value={formData.settings?.capacity || ''}
          onChange={(e) => handleSettingsChange('capacity', Number(e.target.value))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
          placeholder="100"
        />
        <p className="text-sm text-gray-500 mt-1">Maximum number of orders or items for this sale</p>
      </div>
    </div>
  );

  const renderStep5Review = () => {
    // Generate shareable text for social media
    const generateSocialMediaText = () => {
      const saleName = formData.name || 'My Sale';
      const saleDate = formData.startDate ? new Date(formData.startDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'TBD';
      const saleTime = formData.startDate && formData.endDate 
        ? `${formData.startDate.split('T')[1].slice(0, 5)} - ${formData.endDate.split('T')[1].slice(0, 5)}`
        : 'TBD';
      const location = formData.channels?.[0] ? 
        (formData.channels[0].type === 'MEETUP_PICKUP' ? 'Parking Lot Pickup' :
         formData.channels[0].type === 'DROP_OFF_LOCATION' ? 'Kiosk' :
         formData.channels[0].type === 'DELIVERY' ? 'Delivery Available' :
         formData.channels[0].type === 'MARKET' ? 'Farmers Market' :
         'Local Business') : 'TBD';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const locationAddress = (formData.channels?.[0]?.config as any)?.locationAddress || '';
      const productCount = formData.products?.length || 0;
      
      // Create compelling social media content
      let socialText = '';
      
      // Eye-catching opening
      socialText += `🔥 DON'T MISS OUT! 🔥\n\n`;
      
      // Sale name with excitement
      socialText += `✨ ${saleName.toUpperCase()} ✨\n\n`;
      
      // Date and time with urgency
      socialText += `📅 ${saleDate}\n`;
      socialText += `⏰ ${saleTime}\n\n`;
      
      // Location info
      if (locationAddress) {
        socialText += `📍 ${location}\n`;
        socialText += `🏠 ${locationAddress}\n\n`;
      } else {
        socialText += `📍 ${location}\n\n`;
      }
      
      // Product highlights
      if (productCount > 0) {
        socialText += `🛍️ ${productCount} AMAZING PRODUCTS AVAILABLE!\n\n`;
      }
      
      // Description or compelling call-to-action
      if (formData.description) {
        socialText += `${formData.description}\n\n`;
      } else {
        socialText += `🎯 Fresh, local, artisan products made with love!\n`;
        socialText += `💯 Quality you can taste, prices you'll love!\n\n`;
      }
      
      // Urgency and call-to-action
      socialText += `⚡ LIMITED TIME OFFER ⚡\n`;
      socialText += `🚀 Pre-orders now open!\n`;
      socialText += `💝 Perfect for [your occasion/holiday/season]!\n\n`;
      
      // Social proof and community
      socialText += `👥 Join our community of food lovers!\n`;
      socialText += `❤️ Support local artisans\n\n`;
      
      // Hashtags with more variety
      socialText += `#LocalFood #SupportLocal #Artisan #Fresh #Community #FoodLovers #MadeWithLove #LocalBusiness #FarmToTable #Handmade #Quality #Sustainable #TasteTheDifference #Foodie #LocalVendor #SmallBusiness #CommunityFirst #FreshFood #ArtisanMade #LocalLove`;
      
      return socialText;
    };

    const handleShareToSocialMedia = () => {
      const text = generateSocialMediaText();
      // Copy to clipboard
      navigator.clipboard.writeText(text).then(() => {
        alert('✅ Enhanced social media post copied to clipboard!\n\n🔥 Your eye-catching sales post is ready to paste into Facebook, Instagram, Twitter, or any other platform!\n\n💡 Pro tip: Add a photo of your products for maximum engagement!');
      }).catch(() => {
        // Fallback: show text in alert
        alert(`Copy this text to share on social media:\n\n${text}`);
      });
    };

    return (
    <div className="space-y-6">
      {/* Congratulations Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-900 text-base leading-relaxed font-medium">
          🎉 Congratulations for completing this sales window! Good luck!
        </p>
        <p className="text-green-800 text-sm mt-2">
          Review all the details below to confirm before saving your sales window.
        </p>
      </div>

      {/* Customer Notification Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-900 text-sm font-medium flex items-center gap-2">
          <span className="text-lg">👥</span>
          Once created, this sale will automatically appear for all customers following your vendor profile!
        </p>
      </div>

      {/* Social Media Share Button */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-purple-900 text-sm font-medium mb-2">
              📱 Share on Social Media
            </p>
            <p className="text-purple-800 text-xs">
              Get the word out! Click to copy an eye-catching, sales-focused announcement with urgency and excitement for maximum engagement!
            </p>
          </div>
          <button
            type="button"
            onClick={handleShareToSocialMedia}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium whitespace-nowrap"
          >
            🔥 Copy Sales Post
          </button>
        </div>
      </div>

      {/* Customer-Facing Summary - PDF-Style */}
      <div className="border-2 border-gray-300 rounded-lg p-6 bg-white shadow-lg">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-200 pb-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{formData.name || 'Sale Event'}</h2>
          <div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold ${
            formData.status === 'OPEN' ? 'bg-green-100 text-green-800 border-2 border-green-300' :
            formData.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' :
            'bg-gray-100 text-gray-800 border-2 border-gray-300'
          }`}>
            {formData.status}
          </div>
        </div>

        {/* Main Info */}
        <div className="space-y-4">
          {formData.description && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-800 text-base leading-relaxed">{formData.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-2xl">📅</span>
              <div>
                <div className="text-xs font-semibold text-blue-900 uppercase">Date</div>
                <div className="text-base font-medium text-gray-900">
                  {formData.startDate ? new Date(formData.startDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'Not set'}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-2xl">⏰</span>
              <div>
                <div className="text-xs font-semibold text-green-900 uppercase">Time</div>
                <div className="text-base font-medium text-gray-900">
                  {formData.startDate && formData.endDate 
                    ? `${formData.startDate.split('T')[1].slice(0, 5)} - ${formData.endDate.split('T')[1].slice(0, 5)}`
                    : 'Not set'}
                </div>
              </div>
            </div>
          </div>

        {/* Location */}
        {/* eslint-disable @typescript-eslint/no-explicit-any */}
        {formData.channels && formData.channels.length > 0 && (
          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <span className="text-2xl">
              {formData.channels[0].type === 'MEETUP_PICKUP' && '🚗'}
              {formData.channels[0].type === 'DROP_OFF_LOCATION' && '🏪'}
              {formData.channels[0].type === 'DELIVERY' && '🚚'}
              {formData.channels[0].type === 'MARKET' && '🌾'}
              {formData.channels[0].type === 'CUSTOM' && '🏢'}
            </span>
            <div>
              <div className="text-xs font-semibold text-purple-900 uppercase">Location</div>
              <div className="text-base font-medium text-gray-900">
                {formData.channels[0].type === 'MEETUP_PICKUP' && 'Parking Lot Pickup'}
                {formData.channels[0].type === 'DROP_OFF_LOCATION' && 'Kiosk'}
                {formData.channels[0].type === 'DELIVERY' && 'Delivery'}
                {formData.channels[0].type === 'MARKET' && 'Farmers Market'}
                {formData.channels[0].type === 'CUSTOM' && 'Find at Local Businesses'}
              </div>
              {(formData.channels[0].config as any)?.locationAddress && (
                <div className="text-sm text-gray-700 mt-1">
                  📍 {(formData.channels[0].config as any)?.locationAddress}
                </div>
              )}
              {(formData.channels[0].config as any)?.isRecurring && (
                <div className="text-sm text-gray-700 mt-1">
                  🔄 Recurring: {(formData.channels[0].config as any)?.recurrencePattern || 'Weekly'}
                </div>
              )}
            </div>
          </div>
        )}
        {/* eslint-enable @typescript-eslint/no-explicit-any */}

        {/* Products */}
        {formData.products && formData.products.length > 0 && (
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🛍️</span>
              <h4 className="font-semibold text-gray-900 text-lg">Available Products</h4>
            </div>
            <div className="space-y-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {formData.products.slice(0, 5).map((product: any, index: number) => (
                <div key={index} className="flex justify-between items-center bg-white p-2 rounded border border-orange-100">
                  <span className="text-gray-900 font-medium">{product.name}</span>
                  <span className="text-green-700 font-bold">${product.priceOverride?.toFixed(2) || product.price?.toFixed(2) || 'N/A'}</span>
                </div>
              ))}
              {formData.products.length > 5 && (
                <p className="text-sm text-gray-600 text-center pt-2 border-t border-orange-200">
                  + {formData.products.length - 5} more products available
                </p>
              )}
            </div>
          </div>
        )}

        {/* Additional Details */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Capacity</div>
              <div className="text-base font-medium text-gray-900">{formData.settings?.capacity || 'Unlimited'}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Preorders</div>
              <div className="text-base font-medium text-gray-900">
                {formData.settings?.allowPreorders ? '✅ Allowed' : '❌ Not Allowed'}
              </div>
            </div>
          </div>
          {formData.settings?.tags && formData.settings.tags.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-300">
              <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Tags</div>
              <div className="flex flex-wrap gap-2">
                {formData.settings.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1Basics();
      case 2:
        return renderStep2Channels();
      case 3:
        return renderStep3Products();
      case 4:
        return renderStep4Settings();
      case 5:
        return renderStep5Review();
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            {renderStepTitle()}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close drawer"
            aria-label="Close drawer"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 pt-4">
          {renderStepIndicator()}
        </div>

        {/* Content */}
        <div className="px-6 py-4 flex-1 overflow-y-auto max-h-[60vh]">
          {renderCurrentStep()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <div className="flex items-center gap-3">
            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                {isEditing ? 'Update' : 'Create'} Sales Window
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEditSalesWindowDrawer;
