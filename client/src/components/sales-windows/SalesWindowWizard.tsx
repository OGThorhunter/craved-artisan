import React, { useState } from 'react';
import {
  Wand2,
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Package,
  Calendar,
  MapPin,
  Truck,
  Store,
  Users,
  Building
} from 'lucide-react';
import Button from '../ui/Button';
import type { SalesWindow, SalesChannel } from '@/types/sales-windows';

interface SalesWindowWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (salesWindowData: Partial<SalesWindow>) => void;
}

type WizardStep = 'welcome' | 'eventType' | 'products' | 'summary';
type EventType = 'MEETUP_PICKUP' | 'DROP_OFF_LOCATION' | 'DELIVERY' | 'MARKET' | 'CUSTOM' | null;

const SalesWindowWizard: React.FC<SalesWindowWizardProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome');
  const [selectedEventType, setSelectedEventType] = useState<EventType>(null);
  const [formData, setFormData] = useState<Partial<SalesWindow>>({
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
  const [selectedProducts, setSelectedProducts] = useState<Array<{
    id: string;
    name: string;
    price: number;
    productId: string;
    priceOverride: number;
    perOrderLimit: number;
    totalCap: number;
    stock: number;
  }>>([]);

  // Mock products data
  const mockProducts = [
    { id: '1', name: 'Sourdough Bread', price: 6.99, imageUrl: '/images/sourdough.jpg' },
    { id: '2', name: 'Croissants (6-pack)', price: 8.99, imageUrl: '/images/croissants.jpg' },
    { id: '3', name: 'Artisan Cookies', price: 12.99, imageUrl: '/images/cookies.jpg' },
    { id: '4', name: 'Cinnamon Rolls', price: 14.99, imageUrl: '/images/cinnamon-rolls.jpg' },
    { id: '5', name: 'Baguette', price: 4.99, imageUrl: '/images/baguette.jpg' },
  ];

  const handleEventTypeSelect = (eventType: EventType) => {
    setSelectedEventType(eventType);
    
    // Create channel based on selection
    const channel: SalesChannel = {
      type: eventType as 'MEETUP_PICKUP' | 'DROP_OFF_LOCATION' | 'DELIVERY' | 'MARKET' | 'CUSTOM',
      config: {}
    };

    setFormData(prev => ({
      ...prev,
      channels: [channel]
    }));
    
    // Auto-advance to next step
    setTimeout(() => setCurrentStep('products'), 300);
  };

  const handleProductToggle = (product: { id: string; name: string; price: number }) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, {
          ...product,
          productId: product.id,
          priceOverride: product.price,
          perOrderLimit: 10,
          totalCap: 100,
          stock: 50
        }];
      }
    });
  };

  const handleFinish = () => {
    const finalData = {
      ...formData,
      products: selectedProducts as any,
      name: formData.name || getDefaultSaleName(),
      description: formData.description || getDefaultDescription()
    };
    
    onComplete(finalData);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setCurrentStep('welcome');
    setSelectedEventType(null);
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
    setSelectedProducts([]);
  };

  const handleBack = () => {
    if (currentStep === 'eventType') {
      setCurrentStep('welcome');
    } else if (currentStep === 'products') {
      setCurrentStep('eventType');
    } else if (currentStep === 'summary') {
      setCurrentStep('products');
    }
  };

  const getEventTypeInfo = () => {
    switch (selectedEventType) {
      case 'MEETUP_PICKUP':
        return { icon: '🚗', label: 'Parking Lot Pickup', desc: 'Customers meet you at a specific location' };
      case 'DROP_OFF_LOCATION':
        return { icon: '🏪', label: 'Kiosk', desc: 'Drop off at a partner location or kiosk' };
      case 'DELIVERY':
        return { icon: '🚚', label: 'Delivery', desc: 'You deliver directly to customers' };
      case 'MARKET':
        return { icon: '🌾', label: 'Farmers Market', desc: 'Selling at a farmers market or event' };
      case 'CUSTOM':
        return { icon: '🏢', label: 'Local Businesses', desc: 'Partner with local stores and shops' };
      default:
        return { icon: '', label: '', desc: '' };
    }
  };

  const getDefaultSaleName = () => {
    const eventInfo = getEventTypeInfo();
    return `${eventInfo.label} Sale - ${new Date().toLocaleDateString()}`;
  };

  const getDefaultDescription = () => {
    return 'Fresh, locally-made artisan products available for pickup/delivery!';
  };

  const generateSocialMediaText = () => {
    const eventInfo = getEventTypeInfo();
    const productCount = selectedProducts.length;
    
    let socialText = '';
    
    // Eye-catching opening
    socialText += `🔥 DON'T MISS OUT! 🔥\n\n`;
    
    // Event name
    socialText += `✨ ${(formData.name || getDefaultSaleName()).toUpperCase()} ✨\n\n`;
    
    // Event type
    socialText += `${eventInfo.icon} ${eventInfo.label}\n\n`;
    
    // Products
    if (productCount > 0) {
      socialText += `🛍️ ${productCount} AMAZING PRODUCTS AVAILABLE!\n`;
      socialText += selectedProducts.slice(0, 3).map(p => `   • ${p.name}`).join('\n') + '\n';
      if (productCount > 3) {
        socialText += `   ...and ${productCount - 3} more!\n`;
      }
      socialText += `\n`;
    }
    
    // Description
    if (formData.description) {
      socialText += `${formData.description}\n\n`;
    }
    
    // Urgency and CTA
    socialText += `⚡ LIMITED TIME OFFER ⚡\n`;
    if (formData.settings?.allowPreorders) {
      socialText += `🚀 Pre-orders now open!\n`;
    }
    socialText += `💝 Support local artisans!\n\n`;
    
    // Community
    socialText += `👥 Join our community of food lovers!\n`;
    socialText += `❤️ #SupportLocal #Artisan\n\n`;
    
    // Hashtags
    socialText += `#LocalFood #SupportLocal #Artisan #Fresh #Community #FoodLovers #MadeWithLove #LocalBusiness #FarmToTable #Handmade #Quality`;
    
    return socialText;
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center gap-3">
            <Wand2 className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">🎯 Sales Window Wizard 🎯</h2>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            title="Close wizard"
            aria-label="Close wizard"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {['Welcome', 'Event Type', 'Products', 'Summary'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center gap-2 ${
                  index === 0 && currentStep === 'welcome' ? 'text-blue-600 font-semibold' :
                  index === 1 && currentStep === 'eventType' ? 'text-blue-600 font-semibold' :
                  index === 2 && currentStep === 'products' ? 'text-blue-600 font-semibold' :
                  index === 3 && currentStep === 'summary' ? 'text-blue-600 font-semibold' :
                  'text-gray-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index === 0 && currentStep === 'welcome' ? 'bg-blue-500 text-white' :
                    index === 1 && currentStep === 'eventType' ? 'bg-blue-500 text-white' :
                    index === 2 && currentStep === 'products' ? 'bg-blue-500 text-white' :
                    index === 3 && currentStep === 'summary' ? 'bg-blue-500 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="hidden sm:inline text-sm">{step}</span>
                </div>
                {index < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    (index === 0 && ['eventType', 'products', 'summary'].includes(currentStep)) ||
                    (index === 1 && ['products', 'summary'].includes(currentStep)) ||
                    (index === 2 && currentStep === 'summary')
                      ? 'bg-blue-500'
                      : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Step 1: Welcome */}
          {currentStep === 'welcome' && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full">
                <Sparkles className="h-10 w-10 text-blue-600" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Welcome to the Sales Window System!
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  This is where you setup the times, places, or events you wish to sell products at. 
                  This can be a parking lot pickup, delivery, farmers market, or curbside kiosk. 
                  <span className="font-semibold text-blue-600"> This tool puts you in complete control!</span>
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 max-w-xl mx-auto">
                <p className="text-purple-900 text-sm">
                  💡 <strong>Pro Tip:</strong> Create multiple sales windows for different events and locations 
                  to maximize your reach and sales opportunities!
                </p>
              </div>

              <Button 
                onClick={() => setCurrentStep('eventType')}
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
              >
                Let's Get Started!
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Event Type Selection */}
          {currentStep === 'eventType' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  What type of sale event will this be?
                </h3>
                <p className="text-gray-600">Choose the category that best describes your sales channel</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Parking Lot Pickup */}
                <button
                  onClick={() => handleEventTypeSelect('MEETUP_PICKUP')}
                  className={`group relative bg-white border-2 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all text-left ${
                    selectedEventType === 'MEETUP_PICKUP' ? 'border-blue-500 shadow-lg' : 'border-gray-300'
                  }`}
                >
                  {selectedEventType === 'MEETUP_PICKUP' && (
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="text-5xl">🚗</div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Parking Lot Pickup</h4>
                      <p className="text-sm text-gray-600">
                        Customers meet you at a specific location for quick pickup
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">Quick & Easy</Badge>
                  </div>
                </button>

                {/* Kiosk */}
                <button
                  onClick={() => handleEventTypeSelect('DROP_OFF_LOCATION')}
                  className={`group relative bg-white border-2 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all text-left ${
                    selectedEventType === 'DROP_OFF_LOCATION' ? 'border-blue-500 shadow-lg' : 'border-gray-300'
                  }`}
                >
                  {selectedEventType === 'DROP_OFF_LOCATION' && (
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="text-5xl">🏪</div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Kiosk</h4>
                      <p className="text-sm text-gray-600">
                        Drop off at a partner location or curbside kiosk
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 text-xs">24/7 Access</Badge>
                  </div>
                </button>

                {/* Delivery */}
                <button
                  onClick={() => handleEventTypeSelect('DELIVERY')}
                  className={`group relative bg-white border-2 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all text-left ${
                    selectedEventType === 'DELIVERY' ? 'border-blue-500 shadow-lg' : 'border-gray-300'
                  }`}
                >
                  {selectedEventType === 'DELIVERY' && (
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="text-5xl">🚚</div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Delivery</h4>
                      <p className="text-sm text-gray-600">
                        You deliver directly to customers' doors
                      </p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800 text-xs">Premium Service</Badge>
                  </div>
                </button>

                {/* Farmers Market */}
                <button
                  onClick={() => handleEventTypeSelect('MARKET')}
                  className={`group relative bg-white border-2 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all text-left ${
                    selectedEventType === 'MARKET' ? 'border-blue-500 shadow-lg' : 'border-gray-300'
                  }`}
                >
                  {selectedEventType === 'MARKET' && (
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="text-5xl">🌾</div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Farmers Market</h4>
                      <p className="text-sm text-gray-600">
                        Selling at a farmers market or community event
                      </p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800 text-xs">Community Focus</Badge>
                  </div>
                </button>

                {/* Local Businesses */}
                <button
                  onClick={() => handleEventTypeSelect('CUSTOM')}
                  className={`group relative bg-white border-2 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all text-left ${
                    selectedEventType === 'CUSTOM' ? 'border-blue-500 shadow-lg' : 'border-gray-300'
                  }`}
                >
                  {selectedEventType === 'CUSTOM' && (
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="text-5xl">🏢</div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Local Businesses</h4>
                      <p className="text-sm text-gray-600">
                        Partner with local stores and shops
                      </p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">Wholesale</Badge>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Product Selection */}
          {currentStep === 'products' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Now you get to choose what products you want to have for sale at this event
                </h3>
                <p className="text-gray-600">
                  You can allow for customers to pre order as well if you want to bolster sales a bit
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-900 text-sm">
                  💡 <strong>Tip:</strong> Pre-orders help you estimate demand and reduce waste. 
                  Select all products you'll have available at this event!
                </p>
              </div>

              {/* Pre-order Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <h4 className="font-semibold text-gray-900">Allow Pre-orders</h4>
                  <p className="text-sm text-gray-600">Let customers order ahead of time</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.settings?.allowPreorders || false}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings!, allowPreorders: e.target.checked }
                    }))}
                    className="sr-only peer"
                    title="Toggle pre-orders"
                    aria-label="Allow pre-orders toggle"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockProducts.map(product => {
                  const isSelected = selectedProducts.some(p => p.id === product.id);
                  
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleProductToggle(product)}
                      className={`relative bg-white border-2 rounded-lg p-4 hover:shadow-lg transition-all text-left ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                      )}
                      
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-1">{product.name}</h4>
                          <p className="text-lg font-semibold text-green-600">${product.price.toFixed(2)}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedProducts.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-900 text-sm font-medium">
                    ✓ {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected for this event
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  onClick={() => setCurrentStep('summary')}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={selectedProducts.length === 0}
                >
                  Continue to Summary
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Summary */}
          {currentStep === 'summary' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Well Done! You Have a New Sales Window! 🎉
                </h3>
                <p className="text-gray-600">
                  Review your sales window details below and get ready to share with your customers!
                </p>
              </div>

              {/* Summary Card */}
              <div className="border-2 border-gray-300 rounded-lg p-6 bg-white shadow-lg">
                <div className="text-center border-b-2 border-gray-200 pb-4 mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {formData.name || getDefaultSaleName()}
                  </h2>
                  <div className="inline-flex px-4 py-2 rounded-full text-sm font-bold bg-blue-100 text-blue-800 border-2 border-blue-300">
                    {getEventTypeInfo().icon} {getEventTypeInfo().label}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Event Type Details */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-800 text-base leading-relaxed">
                      {formData.description || getDefaultDescription()}
                    </p>
                  </div>

                  {/* Products Section */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                      Products Available ({selectedProducts.length})
                    </h4>
                    {selectedProducts.length > 0 ? (
                      <div className="space-y-2">
                        {selectedProducts.slice(0, 5).map((product) => (
                          <div key={product.id} className="text-sm flex justify-between">
                            <span className="text-gray-900">• {product.name}</span>
                            <span className="text-gray-600">${product.price?.toFixed(2)}</span>
                          </div>
                        ))}
                        {selectedProducts.length > 5 && (
                          <p className="text-sm text-gray-500">...and {selectedProducts.length - 5} more</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No products selected</p>
                    )}
                  </div>

                  {/* Settings */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-3 text-lg">Settings</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Preorders:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {formData.settings?.allowPreorders ? '✓ Allowed' : '✗ Not allowed'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Storefront:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {formData.settings?.showInStorefront ? '✓ Visible' : '✗ Hidden'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Share Section */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h4 className="text-purple-900 text-lg font-bold mb-2 flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Ready-to-Share Social Media Post!
                    </h4>
                    <p className="text-purple-800 text-sm">
                      Your eye-catching sales announcement is ready! Copy and paste to Facebook, Instagram, Twitter, and more.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const text = generateSocialMediaText();
                      navigator.clipboard.writeText(text).then(() => {
                        alert('✅ Enhanced social media post copied to clipboard!\n\n🔥 Your eye-catching sales post is ready to paste!\n\n💡 Pro tip: Add a photo of your products for maximum engagement!');
                      }).catch(() => {
                        alert(`Copy this text to share:\n\n${text}`);
                      });
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    🔥 Copy Sales Post
                  </button>
                </div>

                {/* Preview of social media text */}
                <div className="bg-white border border-purple-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">
                    {generateSocialMediaText()}
                  </pre>
                </div>
              </div>

              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-900 text-sm">
                  <strong>🎉 Congratulations!</strong> Your sales window is ready. Click "Create Sales Window" below to make it live, 
                  or go back to make any changes.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={currentStep === 'welcome'}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {currentStep === 'summary' && (
            <Button 
              onClick={handleFinish}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Create Sales Window
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Badge component
const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

export default SalesWindowWizard;
