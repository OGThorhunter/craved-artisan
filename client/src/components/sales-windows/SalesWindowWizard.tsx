import React, { useState } from 'react';
import { X, Calendar, ShoppingCart, CheckCircle, MapPin, Truck, Package, Store, Settings, Users, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import CravendorWizard from '../ui/CravendorWizard';

interface SalesWindowWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: {
    name: string;
    description: string;
    preorderStartDate: string;
    preorderEndDate: string;
    eventStartDate: string;
    eventEndDate: string;
    recurrence: {
      type: string;
      interval: number;
      daysOfWeek: number[];
      endDate: string;
      occurrences: number;
    };
    channels: Array<{
      type: string;
      config: Record<string, unknown>;
    }>;
    products: Array<{
      productId: string;
      preorderQuantity: number;
      holdQuantity: number;
    }>;
    settings: {
      allowPreorders: boolean;
      showInStorefront: boolean;
      autoCloseWhenSoldOut: boolean;
      capacity: number;
      tags: string[];
    };
  }) => void;
}

const SalesWindowWizard: React.FC<SalesWindowWizardProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showCustomChannelWarning, setShowCustomChannelWarning] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    preorderStartDate: '',
    preorderEndDate: '',
    eventStartDate: '',
    eventEndDate: '',
    recurrence: {
      type: 'none', // 'none', 'daily', 'weekly', 'monthly'
      interval: 1,
      daysOfWeek: [] as number[], // 0-6 for Sunday-Saturday
      endDate: '',
      occurrences: 0
    },
    channels: [] as Array<{
      type: string;
      config: Record<string, unknown>;
    }>,
    products: [] as Array<{
      productId: string;
      preorderQuantity: number;
      holdQuantity: number;
    }>,
    settings: {
      allowPreorders: false,
      showInStorefront: true,
      autoCloseWhenSoldOut: false,
      capacity: 100,
      tags: [] as string[]
    }
  });

  const steps = [
    {
      id: 1,
      title: "Welcome",
      icon: <Calendar className="w-6 h-6" />,
    },
    {
      id: 2,
      title: "Channels",
      icon: <ShoppingCart className="w-6 h-6" />,
    },
    {
      id: 3,
      title: "Products",
      icon: <Package className="w-6 h-6" />,
    },
    {
      id: 4,
      title: "Review",
      icon: <CheckCircle className="w-6 h-6" />,
    },
  ];


  const channelTypes = [
    {
      id: 'MEETUP_PICKUP',
      title: 'Parking Lot Pickup',
      description: 'Customers pick up at your location',
      icon: <MapPin className="w-5 h-5" />,
      color: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'DELIVERY',
      title: 'Delivery',
      description: 'Deliver directly to customers',
      icon: <Truck className="w-5 h-5" />,
      color: 'bg-green-100 text-green-700'
    },
    {
      id: 'DROP_OFF_LOCATION',
      title: 'Partner Trade Posts',
      description: 'Designated drop-off locations',
      icon: <Package className="w-5 h-5" />,
      color: 'bg-yellow-100 text-yellow-700'
    },
    {
      id: 'MARKET',
      title: 'Market Event',
      description: 'Sell at farmers market or event',
      icon: <Store className="w-5 h-5" />,
      color: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'TRAINING_SOCIAL',
      title: 'Training & Social Gatherings',
      description: 'Purchase seats and potential products for sale',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-orange-100 text-orange-700'
    },
    {
      id: 'CUSTOM',
      title: 'Custom Channel',
      description: 'Create your own fulfillment method',
      icon: <Settings className="w-5 h-5" />,
      color: 'bg-gray-100 text-gray-700'
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete(formData);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setCurrentStep(1);
    setFormData({
      name: '',
      description: '',
      preorderStartDate: '',
      preorderEndDate: '',
      eventStartDate: '',
      eventEndDate: '',
      recurrence: {
        type: 'none',
        interval: 1,
        daysOfWeek: [],
        endDate: '',
        occurrences: 0
      },
      channels: [],
      products: [],
      settings: {
        allowPreorders: false,
        showInStorefront: true,
        autoCloseWhenSoldOut: false,
        capacity: 100,
        tags: []
      }
    });
  };

  const addChannel = (channelType: string) => {
    // Show warning for custom channel
    if (channelType === 'CUSTOM') {
      setShowCustomChannelWarning(true);
      return;
    }
    
    const newChannel = {
      type: channelType,
      config: channelType === 'DELIVERY' ? { serviceRadius: 10, baseFee: 0 } : {}
    };
    setFormData({
      ...formData,
      channels: [...formData.channels, newChannel]
    });
  };

  const confirmCustomChannel = () => {
    const newChannel = {
      type: 'CUSTOM',
      config: {}
    };
    setFormData({
      ...formData,
      channels: [...formData.channels, newChannel]
    });
    setShowCustomChannelWarning(false);
  };

  const cancelCustomChannel = () => {
    setShowCustomChannelWarning(false);
  };

  const removeChannel = (index: number) => {
    setFormData({
      ...formData,
      channels: formData.channels.filter((_, i) => i !== index)
    });
  };


  if (!isOpen) return null;

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Sales Window Wizard</h2>
                <p className="text-blue-100">Let's create your perfect sales window</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="Close wizard"
              aria-label="Close wizard"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`p-2 rounded-lg ${currentStep >= step.id ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    {step.icon}
                  </div>
                  <span className="font-medium">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-center"
            >
              <CravendorWizard title="Hail, merchant of craft and commerce!">
                <div className="text-center space-y-6">
                  <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
                    I am <strong>Cravendor</strong>, steward of the marketplace and guardian of fair trade. 
                    You have arrived at the <strong>Sales Window Wizard</strong>, where the rhythm of buying and selling is shaped.
                  </p>
                  
                  <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
                    Here, you shall decide <strong>when your goods may be offered</strong>, 
                    <strong> where your patrons shall claim them</strong>, and <strong>how your markets shall flow</strong>. 
                    These choices are the lifeblood of thriving trade, the very balance between maker and buyer.
                  </p>

                  <p className="text-xl text-gray-800 font-semibold mt-8">
                    Now then, merchant of merit, shall we set your sales window?
                  </p>

                  <button
                    onClick={nextStep}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-10 py-3 rounded-lg inline-flex items-center gap-2 whitespace-nowrap transition-colors mt-6"
                  >
                    Let's Begin
                    <Calendar className="h-5 w-5" />
                  </button>
                </div>
              </CravendorWizard>
            </motion.div>
          )}


          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-8">Sales Window Configuration</h3>
              
              {/* Basic Information Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sales Window Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Weekend Bakery Sale"
                      title="Enter sales window name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe your sales window..."
                      rows={3}
                      title="Enter sales window description"
                    />
                  </div>
                </div>
              </div>

              {/* Settings Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Settings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.settings.allowPreorders}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          settings: { ...formData.settings, allowPreorders: e.target.checked }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Allow Preorders</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.settings.showInStorefront}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          settings: { ...formData.settings, showInStorefront: e.target.checked }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Show in Storefront</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.settings.autoCloseWhenSoldOut}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          settings: { ...formData.settings, autoCloseWhenSoldOut: e.target.checked }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Auto-close when sold out</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Pre-order Window Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Pre-order Window
                </h4>
                <p className="text-sm text-gray-600 mb-4">Set when customers can place pre-orders for your sales window</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pre-order Opens *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={formData.preorderStartDate ? formData.preorderStartDate.split('T')[0] : ''}
                        onChange={(e) => {
                          const date = e.target.value;
                          const time = formData.preorderStartDate ? formData.preorderStartDate.split('T')[1] : '00:00';
                          setFormData({ ...formData, preorderStartDate: `${date}T${time}` });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Select pre-order start date"
                      />
                      <input
                        type="time"
                        value={formData.preorderStartDate ? formData.preorderStartDate.split('T')[1] : '00:00'}
                        onChange={(e) => {
                          const time = e.target.value;
                          const date = formData.preorderStartDate ? formData.preorderStartDate.split('T')[0] : new Date().toISOString().split('T')[0];
                          setFormData({ ...formData, preorderStartDate: `${date}T${time}` });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Select pre-order start time"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pre-order Closes *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={formData.preorderEndDate ? formData.preorderEndDate.split('T')[0] : ''}
                        onChange={(e) => {
                          const date = e.target.value;
                          const time = formData.preorderEndDate ? formData.preorderEndDate.split('T')[1] : '23:59';
                          setFormData({ ...formData, preorderEndDate: `${date}T${time}` });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Select pre-order end date"
                      />
                      <input
                        type="time"
                        value={formData.preorderEndDate ? formData.preorderEndDate.split('T')[1] : '23:59'}
                        onChange={(e) => {
                          const time = e.target.value;
                          const date = formData.preorderEndDate ? formData.preorderEndDate.split('T')[0] : new Date().toISOString().split('T')[0];
                          setFormData({ ...formData, preorderEndDate: `${date}T${time}` });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Select pre-order end time"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sales Window Event Date Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Sales Window Event Date
                </h4>
                <p className="text-sm text-gray-600 mb-4">This is when your sales window is actually open for pickup and sales</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Start *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={formData.eventStartDate ? formData.eventStartDate.split('T')[0] : ''}
                        onChange={(e) => {
                          const date = e.target.value;
                          const time = formData.eventStartDate ? formData.eventStartDate.split('T')[1] : '09:00';
                          setFormData({ ...formData, eventStartDate: `${date}T${time}` });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Select event start date"
                      />
                      <input
                        type="time"
                        value={formData.eventStartDate ? formData.eventStartDate.split('T')[1] : '09:00'}
                        onChange={(e) => {
                          const time = e.target.value;
                          const date = formData.eventStartDate ? formData.eventStartDate.split('T')[0] : new Date().toISOString().split('T')[0];
                          setFormData({ ...formData, eventStartDate: `${date}T${time}` });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Select event start time"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event End *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={formData.eventEndDate ? formData.eventEndDate.split('T')[0] : ''}
                        onChange={(e) => {
                          const date = e.target.value;
                          const time = formData.eventEndDate ? formData.eventEndDate.split('T')[1] : '17:00';
                          setFormData({ ...formData, eventEndDate: `${date}T${time}` });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Select event end date"
                      />
                      <input
                        type="time"
                        value={formData.eventEndDate ? formData.eventEndDate.split('T')[1] : '17:00'}
                        onChange={(e) => {
                          const time = e.target.value;
                          const date = formData.eventEndDate ? formData.eventEndDate.split('T')[0] : new Date().toISOString().split('T')[0];
                          setFormData({ ...formData, eventEndDate: `${date}T${time}` });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Select event end time"
                      />
                    </div>
                  </div>
                </div>

                {/* Recurrence Options */}
                <div className="border-t border-gray-200 pt-6">
                  <h5 className="text-md font-semibold text-gray-900 mb-4">Recurrence (Optional)</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Repeat
                      </label>
                      <select
                        value={formData.recurrence.type}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          recurrence: { ...formData.recurrence, type: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Select recurrence type"
                      >
                        <option value="none">No repeat</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    {formData.recurrence.type !== 'none' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Every
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.recurrence.interval}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            recurrence: { ...formData.recurrence, interval: parseInt(e.target.value) || 1 }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="1"
                          title="Enter interval"
                        />
                      </div>
                    )}

                    {formData.recurrence.type === 'weekly' && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Days of the week
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                            <label key={day} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={formData.recurrence.daysOfWeek.includes(index)}
                                onChange={(e) => {
                                  const days = e.target.checked
                                    ? [...formData.recurrence.daysOfWeek, index]
                                    : formData.recurrence.daysOfWeek.filter(d => d !== index);
                                  setFormData({ 
                                    ...formData, 
                                    recurrence: { ...formData.recurrence, daysOfWeek: days }
                                  });
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{day}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.recurrence.type !== 'none' && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End date (optional)
                        </label>
                        <input
                          type="date"
                          value={formData.recurrence.endDate}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            recurrence: { ...formData.recurrence, endDate: e.target.value }
                          })}
                          className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          title="Select end date for recurrence"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fulfillment Channels Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  Fulfillment Channels
                </h4>
                <p className="text-sm text-gray-600 mb-4">Choose how customers can receive their orders</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  {channelTypes.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => addChannel(channel.id)}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <span className={channel.color}>
                        {channel.icon}
                      </span>
                      <div className="text-left">
                        <div className="font-medium text-sm">{channel.title}</div>
                        <div className="text-xs text-gray-600">{channel.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
                
                {formData.channels.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-900">Selected Channels:</h5>
                    {formData.channels.map((channel, index) => {
                      const channelInfo = channelTypes.find(c => c.id === channel.type);
                      return (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className={channelInfo?.color}>
                              {channelInfo?.icon}
                            </span>
                            <span className="font-medium">{channelInfo?.title}</span>
                          </div>
                          <button
                            onClick={() => removeChannel(index)}
                            className="text-red-600 hover:text-red-800"
                            title="Remove channel"
                            aria-label="Remove channel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Custom Channel Warning Modal */}
                {showCustomChannelWarning && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <div className="flex-shrink-0">
                          <AlertCircle className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Custom Channel Reporting Notice
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            All reporting and metrics around a custom channel will simply display as <strong>"Custom Channel"</strong> on reports.
                          </p>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <p className="text-sm text-blue-900">
                              <strong>💡 Recommendation:</strong> It's advised to use the existing channels (Parking Lot Pickup, Delivery, Partner Trade Posts, etc.) to effectively manage and understand the channels you're working through. This provides better analytics and insights.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={cancelCustomChannel}
                          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={confirmCustomChannel}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                          I Understand, Continue
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>

            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-8">Product Selection</h3>
              
              {/* Product Selection Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Available Products
                </h4>
                <p className="text-sm text-gray-600 mb-4">Select products to offer at this sales window and set quantities</p>
                
                {/* Mock products - in real app, this would come from API */}
                <div className="space-y-4">
                  {[
                    { id: '1', name: 'Sourdough Loaf', price: 8.50, category: 'Bread' },
                    { id: '2', name: 'Chocolate Chip Cookies', price: 3.00, category: 'Desserts' },
                    { id: '3', name: 'Artisan Pizza', price: 15.00, category: 'Meals' },
                    { id: '4', name: 'Fresh Croissants', price: 4.50, category: 'Pastries' }
                  ].map((product) => {
                    const existingProduct = formData.products.find(p => p.productId === product.id);
                    const isSelected = !!existingProduct;
                    
                    return (
                      <div key={product.id} className={`border rounded-lg p-4 ${isSelected ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h5 className="font-medium text-gray-900">{product.name}</h5>
                            <p className="text-sm text-gray-600">{product.category} • ${product.price}</p>
                          </div>
                          <button
                            onClick={() => {
                              if (isSelected) {
                                setFormData({
                                  ...formData,
                                  products: formData.products.filter(p => p.productId !== product.id)
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  products: [...formData.products, {
                                    productId: product.id,
                                    preorderQuantity: 0,
                                    holdQuantity: 0
                                  }]
                                });
                              }
                            }}
                            className={`px-3 py-1 rounded text-sm font-medium ${
                              isSelected 
                                ? 'bg-green-600 text-white hover:bg-green-700' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </button>
                        </div>
                        
                        {isSelected && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pre-order Quantity
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={existingProduct.preorderQuantity}
                                onChange={(e) => {
                                  const newProducts = formData.products.map(p => 
                                    p.productId === product.id 
                                      ? { ...p, preorderQuantity: parseInt(e.target.value) || 0 }
                                      : p
                                  );
                                  setFormData({ ...formData, products: newProducts });
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0"
                                disabled={!formData.settings.allowPreorders}
                              />
                              {!formData.settings.allowPreorders && (
                                <p className="text-xs text-gray-500 mt-1">Enable preorders in settings</p>
                              )}
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Hold for Sale Quantity
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={existingProduct.holdQuantity}
                                onChange={(e) => {
                                  const newProducts = formData.products.map(p => 
                                    p.productId === product.id 
                                      ? { ...p, holdQuantity: parseInt(e.target.value) || 0 }
                                      : p
                                  );
                                  setFormData({ ...formData, products: newProducts });
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {formData.products.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No products selected. Choose products above to offer at this sales window.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Review Your Sales Window</h3>
              
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Basic Information</h4>
                  <p><strong>Name:</strong> {formData.name || 'Not specified'}</p>
                  <p><strong>Description:</strong> {formData.description || 'Not specified'}</p>
                  <p><strong>Pre-order Opens:</strong> {formData.preorderStartDate ? new Date(formData.preorderStartDate).toLocaleString() : 'Not specified'}</p>
                  <p><strong>Pre-order Closes:</strong> {formData.preorderEndDate ? new Date(formData.preorderEndDate).toLocaleString() : 'Not specified'}</p>
                  <p><strong>Event Start:</strong> {formData.eventStartDate ? new Date(formData.eventStartDate).toLocaleString() : 'Not specified'}</p>
                  <p><strong>Event End:</strong> {formData.eventEndDate ? new Date(formData.eventEndDate).toLocaleString() : 'Not specified'}</p>
                  <p><strong>Recurrence:</strong> {formData.recurrence.type === 'none' ? 'No repeat' : `${formData.recurrence.type} (every ${formData.recurrence.interval})`}</p>
                  {formData.recurrence.type === 'weekly' && formData.recurrence.daysOfWeek.length > 0 && (
                    <p><strong>Days:</strong> {formData.recurrence.daysOfWeek.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}</p>
                  )}
                  {formData.recurrence.endDate && (
                    <p><strong>Recurrence End:</strong> {new Date(formData.recurrence.endDate).toLocaleDateString()}</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Channels</h4>
                  {formData.channels.length > 0 ? (
                    <ul className="space-y-1">
                      {formData.channels.map((channel, index) => {
                        const channelInfo = channelTypes.find(c => c.id === channel.type);
                        return (
                          <li key={index} className="flex items-center gap-2">
                            <span className={channelInfo?.color}>
                              {channelInfo?.icon}
                            </span>
                            {channelInfo?.title}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-gray-600">No channels selected</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Selected Products</h4>
                  {formData.products.length > 0 ? (
                    <div className="space-y-2">
                      {formData.products.map((product, index) => {
                        const productInfo = [
                          { id: '1', name: 'Sourdough Loaf', price: 8.50, category: 'Bread' },
                          { id: '2', name: 'Chocolate Chip Cookies', price: 3.00, category: 'Desserts' },
                          { id: '3', name: 'Artisan Pizza', price: 15.00, category: 'Meals' },
                          { id: '4', name: 'Fresh Croissants', price: 4.50, category: 'Pastries' }
                        ].find(p => p.id === product.productId);
                        
                        return (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div>
                              <span className="font-medium">{productInfo?.name}</span>
                              <span className="text-sm text-gray-600 ml-2">${productInfo?.price}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              Pre-order: {product.preorderQuantity} | Hold: {product.holdQuantity}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-600">No products selected</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Settings</h4>
                  <p><strong>Allow Preorders:</strong> {formData.settings.allowPreorders ? 'Yes' : 'No'}</p>
                  <p><strong>Show in Storefront:</strong> {formData.settings.showInStorefront ? 'Yes' : 'No'}</p>
                  <p><strong>Auto-close when sold out:</strong> {formData.settings.autoCloseWhenSoldOut ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer - Hide on first step (welcome) */}
        {currentStep !== 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              
              {currentStep < steps.length ? (
                <button
                  onClick={nextStep}
                  disabled={
                    (currentStep === 2 && (!formData.name || !formData.preorderStartDate || !formData.preorderEndDate || !formData.eventStartDate || !formData.eventEndDate || formData.channels.length === 0)) ||
                    (currentStep === 3 && formData.products.length === 0)
                  }
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Create Sales Window
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SalesWindowWizard;
