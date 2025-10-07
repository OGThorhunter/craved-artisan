import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  ShoppingCart,
  MapPin,
  Package,
  Settings,
  CheckCircle,
  ArrowRight, 
  ArrowLeft,
  Clock,
  X,
  Truck,
  Store,
  Users
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import type { SalesWindow, SalesChannel, WindowProduct } from '@/types/sales-windows';

interface CreateSalesWindowWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (salesWindowData: Partial<SalesWindow>) => void;
}

type WizardStep = 'welcome' | 'basics' | 'schedule' | 'channels' | 'products' | 'review';

interface SalesWindowWizardData {
  name?: string;
  description?: string;
  isEvergreen?: boolean;
  startDate?: string;
  endDate?: string;
  timezone?: string;
  channels?: SalesChannel[];
  products?: WindowProduct[];
  settings?: {
    allowPreorders?: boolean;
    showInStorefront?: boolean;
    autoCloseWhenSoldOut?: boolean;
    capacity?: number;
    tags?: string[];
  };
}

const CreateSalesWindowWizard: React.FC<CreateSalesWindowWizardProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome');
  const [salesWindowData, setSalesWindowData] = useState<SalesWindowWizardData>({
    isEvergreen: false,
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

  const handleStepNext = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('basics');
        break;
      case 'basics':
        setCurrentStep('schedule');
        break;
      case 'schedule':
        setCurrentStep('channels');
        break;
      case 'channels':
        setCurrentStep('products');
        break;
      case 'products':
        setCurrentStep('review');
        break;
    }
  };

  const handleStepBack = () => {
    switch (currentStep) {
      case 'basics':
        setCurrentStep('welcome');
        break;
      case 'schedule':
        setCurrentStep('basics');
        break;
      case 'channels':
        setCurrentStep('schedule');
        break;
      case 'products':
        setCurrentStep('channels');
        break;
      case 'review':
        setCurrentStep('products');
        break;
    }
  };

  const handleComplete = () => {
    // Ensure settings has all required properties
    const completeSalesWindowData = {
      ...salesWindowData,
      settings: {
        allowPreorders: salesWindowData.settings?.allowPreorders ?? true,
        showInStorefront: salesWindowData.settings?.showInStorefront ?? true,
        autoCloseWhenSoldOut: salesWindowData.settings?.autoCloseWhenSoldOut ?? false,
        capacity: salesWindowData.settings?.capacity ?? 100,
        tags: salesWindowData.settings?.tags ?? []
      }
    };
    onComplete(completeSalesWindowData);
    onClose();
    // Reset wizard state
    setCurrentStep('welcome');
    setSalesWindowData({
      isEvergreen: false,
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
  };

  const updateSalesWindowData = (field: keyof SalesWindowWizardData, value: string | number | boolean | SalesChannel[] | WindowProduct[]) => {
    setSalesWindowData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateSettings = (field: keyof NonNullable<SalesWindowWizardData['settings']>, value: any) => {
    setSalesWindowData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value
      }
    }));
  };

  const addChannel = (type: SalesChannel['type']) => {
    const newChannel: SalesChannel = {
      type,
      config: {}
    };
    setSalesWindowData(prev => ({
      ...prev,
      channels: [...(prev.channels || []), newChannel]
    }));
  };

  const removeChannel = (index: number) => {
    setSalesWindowData(prev => ({
      ...prev,
      channels: prev.channels?.filter((_, i) => i !== index) || []
    }));
  };

  // Tag functions removed as they're not used in current implementation

  const steps = [
    { id: 'welcome', title: 'Welcome', icon: <ShoppingCart className="w-5 h-5" /> },
    { id: 'basics', title: 'Basics', icon: <Settings className="w-5 h-5" /> },
    { id: 'schedule', title: 'Schedule', icon: <Calendar className="w-5 h-5" /> },
    { id: 'channels', title: 'Channels', icon: <MapPin className="w-5 h-5" /> },
    { id: 'products', title: 'Products', icon: <Package className="w-5 h-5" /> },
    { id: 'review', title: 'Review', icon: <CheckCircle className="w-5 h-5" /> }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Create Sales Window Wizard</h2>
              <p className="text-white/90 mt-1">Let's set up your sales opportunity</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
              title="Close wizard"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Step Progress */}
          <div className="flex items-center justify-center mt-6 space-x-2 overflow-x-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                  currentStep === step.id 
                    ? 'bg-white text-green-600 border-white' 
                    : steps.findIndex(s => s.id === currentStep) > index
                      ? 'bg-green-500 text-white border-green-500'
                      : 'border-white/30 text-white/70'
                }`}>
                  {steps.findIndex(s => s.id === currentStep) > index ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span className="ml-1 text-xs font-medium hidden sm:block">{step.title}</span>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-3 h-3 mx-2 text-white/50" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Welcome */}
              {currentStep === 'welcome' && (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <ShoppingCart className="w-10 h-10 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Welcome to Sales Window Creation!
                    </h3>
                    <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                      Sales windows are your opportunity to showcase your products to customers! 
                      Whether it's a farmer's market, online store, or special event, we'll help you 
                      set up the perfect sales opportunity.
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      Let's create a sales window that converts browsers into buyers!
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Basics */}
              {currentStep === 'basics' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Tell us about your sales window
                    </h3>
                    <p className="text-gray-600">
                      What are you calling this sales opportunity?
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sales Window Name *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="e.g., Spring Market, Holiday Sale, Weekly Pickup"
                        value={salesWindowData.name || ''}
                        onChange={(e) => updateSalesWindowData('name', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        rows={3}
                        placeholder="Describe your sales window, special offers, or anything customers should know..."
                        value={salesWindowData.description || ''}
                        onChange={(e) => updateSalesWindowData('description', e.target.value)}
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          checked={salesWindowData.isEvergreen || false}
                          onChange={(e) => updateSalesWindowData('isEvergreen', e.target.checked)}
                        />
                        <span className="ml-2 text-sm text-gray-700">Evergreen Window</span>
                      </label>
                      <span className="text-xs text-gray-500">(No end date, always available)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Schedule */}
              {currentStep === 'schedule' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      When will this sales window be active?
                    </h3>
                    <p className="text-gray-600">
                      Set the dates and times when customers can place orders
                    </p>
                  </div>

                  {!salesWindowData.isEvergreen && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          value={salesWindowData.startDate || ''}
                          onChange={(e) => updateSalesWindowData('startDate', e.target.value)}
                          title="Start Date"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date *
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          value={salesWindowData.endDate || ''}
                          onChange={(e) => updateSalesWindowData('endDate', e.target.value)}
                          title="End Date"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={salesWindowData.timezone || 'America/New_York'}
                      onChange={(e) => updateSalesWindowData('timezone', e.target.value)}
                      title="Timezone"
                    >
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>

                  {salesWindowData.isEvergreen && (
                    <Card className="p-4 bg-blue-50 border-blue-200">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="text-blue-800 font-medium">Evergreen Window</span>
                      </div>
                      <p className="text-blue-700 text-sm mt-1">
                        This sales window will be available continuously without an end date.
                      </p>
                    </Card>
                  )}
                </div>
              )}

              {/* Step 4: Channels */}
              {currentStep === 'channels' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      How will customers get their orders?
                    </h3>
                    <p className="text-gray-600">
                      Choose the delivery methods for your sales window
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Channel Options */}
                    <Card 
                      className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                        salesWindowData.channels?.some(c => c.type === 'MEETUP_PICKUP') ? 'ring-2 ring-green-500 bg-green-50' : ''
                      }`}
                      onClick={() => addChannel('MEETUP_PICKUP')}
                    >
                      <div className="text-center space-y-2">
                        <Store className="w-8 h-8 text-green-600 mx-auto" />
                        <h4 className="font-semibold">Pickup Location</h4>
                        <p className="text-sm text-gray-600">Customers pick up at a specific location</p>
                      </div>
                    </Card>

                    <Card 
                      className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                        salesWindowData.channels?.some(c => c.type === 'DELIVERY') ? 'ring-2 ring-green-500 bg-green-50' : ''
                      }`}
                      onClick={() => addChannel('DELIVERY')}
                    >
                      <div className="text-center space-y-2">
                        <Truck className="w-8 h-8 text-green-600 mx-auto" />
                        <h4 className="font-semibold">Delivery</h4>
                        <p className="text-sm text-gray-600">You deliver directly to customers</p>
                      </div>
                    </Card>

                    <Card 
                      className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                        salesWindowData.channels?.some(c => c.type === 'DROP_OFF_LOCATION') ? 'ring-2 ring-green-500 bg-green-50' : ''
                      }`}
                      onClick={() => addChannel('DROP_OFF_LOCATION')}
                    >
                      <div className="text-center space-y-2">
                        <MapPin className="w-8 h-8 text-green-600 mx-auto" />
                        <h4 className="font-semibold">Drop-off Location</h4>
                        <p className="text-sm text-gray-600">Drop off at a partner location</p>
                      </div>
                    </Card>

                    <Card 
                      className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                        salesWindowData.channels?.some(c => c.type === 'MARKET') ? 'ring-2 ring-green-500 bg-green-50' : ''
                      }`}
                      onClick={() => addChannel('MARKET')}
                    >
                      <div className="text-center space-y-2">
                        <Users className="w-8 h-8 text-green-600 mx-auto" />
                        <h4 className="font-semibold">Market Event</h4>
                        <p className="text-sm text-gray-600">Sell at a farmers market or event</p>
                      </div>
                    </Card>
                  </div>

                  {/* Selected Channels */}
                  {salesWindowData.channels && salesWindowData.channels.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">Selected Channels:</h4>
                      {salesWindowData.channels.map((channel, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <span className="font-medium">{channel.type.replace('_', ' ')}</span>
                          <button
                            onClick={() => removeChannel(index)}
                            className="text-red-600 hover:text-red-800"
                            title="Remove channel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 5: Products */}
              {currentStep === 'products' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      What products will you sell?
                    </h3>
                    <p className="text-gray-600">
                      You can add products later, but let's set up your sales window first
                    </p>
                  </div>

                  <Card className="p-6 bg-blue-50 border-blue-200">
                    <div className="text-center space-y-4">
                      <Package className="w-12 h-12 text-blue-600 mx-auto" />
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-2">
                          Products will be added after creation
                        </h4>
                        <p className="text-blue-700">
                          Once your sales window is created, you can easily add products, 
                          set quantities, and manage your inventory from the sales window dashboard.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sales Window Capacity
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="100"
                        value={salesWindowData.settings?.capacity || 100}
                        onChange={(e) => updateSettings('capacity', parseInt(e.target.value) || 100)}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Maximum number of orders you can handle
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          checked={salesWindowData.settings?.allowPreorders || false}
                          onChange={(e) => updateSettings('allowPreorders', e.target.checked)}
                        />
                        <span className="ml-2 text-sm text-gray-700">Allow Preorders</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          checked={salesWindowData.settings?.showInStorefront || false}
                          onChange={(e) => updateSettings('showInStorefront', e.target.checked)}
                        />
                        <span className="ml-2 text-sm text-gray-700">Show in Storefront</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Review */}
              {currentStep === 'review' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Perfect! Your sales window is ready to go!
                    </h3>
                    <p className="text-lg text-gray-600 mb-6">
                      Take a quick look at your sales window details below. Once you're happy with everything, 
                      click "Create Sales Window" to launch your sales opportunity!
                    </p>
                  </div>

                  <Card className="p-6 bg-gray-50">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Sales Window Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Name:</span>
                          <div className="text-gray-900 font-medium">{salesWindowData.name || 'Not specified'}</div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Description:</span>
                          <div className="text-gray-900">{salesWindowData.description || 'Not specified'}</div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Type:</span>
                          <div className="text-gray-900">{salesWindowData.isEvergreen ? 'Evergreen' : 'Scheduled'}</div>
                        </div>
                        {!salesWindowData.isEvergreen && (
                          <>
                            <div>
                              <span className="text-sm font-medium text-gray-600">Start Date:</span>
                              <div className="text-gray-900">{salesWindowData.startDate || 'Not specified'}</div>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">End Date:</span>
                              <div className="text-gray-900">{salesWindowData.endDate || 'Not specified'}</div>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Timezone:</span>
                          <div className="text-gray-900">{salesWindowData.timezone || 'Not specified'}</div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Channels:</span>
                          <div className="text-gray-900">
                            {salesWindowData.channels?.length ? 
                              salesWindowData.channels.map(c => c.type.replace('_', ' ')).join(', ') : 
                              'No channels selected'
                            }
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Capacity:</span>
                          <div className="text-gray-900">{salesWindowData.settings?.capacity || 100} orders</div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Settings:</span>
                          <div className="text-gray-900 text-sm">
                            {salesWindowData.settings?.allowPreorders && 'Preorders • '}
                            {salesWindowData.settings?.showInStorefront && 'Storefront • '}
                            Auto-close when sold out
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              onClick={currentStep === 'welcome' ? onClose : handleStepBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {currentStep === 'welcome' ? 'Cancel' : 'Back'}
            </Button>
            
            {currentStep !== 'review' && (
              <Button
                onClick={handleStepNext}
                disabled={currentStep === 'basics' && !salesWindowData.name}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            
            {currentStep === 'review' && (
              <Button
                onClick={handleComplete}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4" />
                Create Sales Window
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateSalesWindowWizard;
