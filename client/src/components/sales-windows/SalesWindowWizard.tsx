import React, { useState } from 'react';
import { X, Calendar, ShoppingCart, CheckCircle, Plus, Upload, FileText, MapPin, Truck, Package, Store, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface SalesWindowWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    method: string;
    channels: Array<{
      type: string;
      config: Record<string, unknown>;
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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    method: '',
    channels: [] as Array<{
      type: string;
      config: Record<string, unknown>;
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
      title: "Add Method",
      icon: <Plus className="w-6 h-6" />,
    },
    {
      id: 3,
      title: "Channels",
      icon: <ShoppingCart className="w-6 h-6" />,
    },
    {
      id: 4,
      title: "Review",
      icon: <CheckCircle className="w-6 h-6" />,
    },
  ];

  const methods = [
    {
      id: 'manual',
      title: 'Manual Entry',
      description: 'Create your sales window step by step',
      icon: <Plus className="w-8 h-8" />,
      color: 'bg-blue-500'
    },
    {
      id: 'ai-parse',
      title: 'AI Parse Document',
      description: 'Upload an image or receipt to auto-populate',
      icon: <Upload className="w-8 h-8" />,
      color: 'bg-green-500'
    },
    {
      id: 'csv-import',
      title: 'CSV Import',
      description: 'Import from spreadsheet or other document',
      icon: <FileText className="w-8 h-8" />,
      color: 'bg-purple-500'
    }
  ];

  const channelTypes = [
    {
      id: 'MEETUP_PICKUP',
      title: 'Pickup Location',
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
      title: 'Drop-off Point',
      description: 'Designated drop-off locations',
      icon: <Package className="w-5 h-5" />,
      color: 'bg-yellow-100 text-yellow-700'
    },
    {
      id: 'MARKET',
      title: 'Market Booth',
      description: 'Sell at farmers market or event',
      icon: <Store className="w-5 h-5" />,
      color: 'bg-purple-100 text-purple-700'
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
    onClose();
  };

  const addChannel = (channelType: string) => {
    const newChannel = {
      type: channelType,
      config: channelType === 'DELIVERY' ? { serviceRadius: 10, baseFee: 0 } : {}
    };
    setFormData({
      ...formData,
      channels: [...formData.channels, newChannel]
    });
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
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome to the AI Assisted Sales Window Management System!
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  Managing your sales windows is one of the most critical steps to get the full benefit of the CravedArtisan tools. 
                  My goal is to make this task easy peasy and enjoyable, if that is possible to say at the same time as "sales windows" 😊
                </p>
                <p className="text-lg font-semibold text-gray-800 mb-8">
                  Let's start off by telling me how would you like to create this new sales window?
                </p>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Choose Your Creation Method</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {methods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => {
                      setFormData({ ...formData, method: method.id });
                      nextStep();
                    }}
                    className={`p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                      formData.method === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-12 h-12 ${method.color} rounded-lg flex items-center justify-center text-white mb-4 mx-auto shadow-sm`}>
                      {method.icon}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{method.title}</h4>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select start date and time"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select end date and time"
                  />
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Fulfillment Channels</h4>
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
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity
                </label>
                  <input
                    type="number"
                    value={formData.settings.capacity}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      settings: { ...formData.settings, capacity: parseInt(e.target.value) || 100 }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="100"
                    title="Enter maximum capacity"
                  />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <p><strong>Start Date:</strong> {formData.startDate ? new Date(formData.startDate).toLocaleString() : 'Not specified'}</p>
                  <p><strong>End Date:</strong> {formData.endDate ? new Date(formData.endDate).toLocaleString() : 'Not specified'}</p>
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
                  <h4 className="font-semibold text-gray-900 mb-2">Settings</h4>
                  <p><strong>Capacity:</strong> {formData.settings.capacity}</p>
                  <p><strong>Allow Preorders:</strong> {formData.settings.allowPreorders ? 'Yes' : 'No'}</p>
                  <p><strong>Show in Storefront:</strong> {formData.settings.showInStorefront ? 'Yes' : 'No'}</p>
                  <p><strong>Auto-close when sold out:</strong> {formData.settings.autoCloseWhenSoldOut ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
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
                  (currentStep === 2 && !formData.method) ||
                  (currentStep === 3 && (!formData.name || !formData.startDate || !formData.endDate || formData.channels.length === 0))
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
      </motion.div>
    </div>
  );
};

export default SalesWindowWizard;
