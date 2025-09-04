import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Package,
  Truck,
  Store,
  Settings,
  Tag,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import type { SalesWindow, SalesChannel, WindowProduct, WindowSettings } from '@/types/sales-windows';
import ProductSelectionStep from './ProductSelectionStep';

interface CreateEditSalesWindowDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  window?: SalesWindow; // If provided, we're editing; otherwise creating
  onSave: (window: Partial<SalesWindow>) => void;
}

const CreateEditSalesWindowDrawer: React.FC<CreateEditSalesWindowDrawerProps> = ({
  isOpen,
  onClose,
  window,
  onSave
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
    // Reset to step 1 when window changes
    setCurrentStep(1);
  }, [window]);


  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
      'Basic Information',
      'Sales Channels',
      'Products',
      'Settings',
      'Review & Create'
    ];
    return (
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {isEditing ? 'Edit' : 'Create'} Sales Window - {titles[currentStep - 1]}
      </h2>
    );
  };

  const renderStep1Basics = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Window Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Weekend Market Pickup"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe your sales window..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) => handleInputChange('status', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Status"
        >
          <option value="DRAFT">Draft</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="OPEN">Open</option>
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isEvergreen"
          checked={formData.isEvergreen}
          onChange={(e) => handleInputChange('isEvergreen', e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isEvergreen" className="ml-2 text-sm text-gray-700">
          This is an evergreen window (no specific dates)
        </label>
      </div>

      {!formData.isEvergreen && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                Start Date *
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={formData.startDate ? formData.startDate.split('T')[0] : ''}
                  onChange={(e) => {
                    const time = formData.startDate ? formData.startDate.split('T')[1] : '09:00';
                    handleInputChange('startDate', `${e.target.value}T${time}`);
                  }}
                  className="w-full px-3 py-2 border border-[#E8CBAE] rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent bg-white"
                  aria-label="Start date"
                />
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#777777]" />
                  <select
                    value={formData.startDate ? formData.startDate.split('T')[1] : '09:00'}
                    onChange={(e) => {
                      const date = formData.startDate ? formData.startDate.split('T')[0] : new Date().toISOString().split('T')[0];
                      handleInputChange('startDate', `${date}T${e.target.value}`);
                    }}
                    className="px-3 py-2 border border-[#E8CBAE] rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent bg-white text-sm"
                    aria-label="Start time"
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <option key={`${hour}:00`} value={`${hour}:00`}>
                          {hour}:00
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                End Date *
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={formData.endDate ? formData.endDate.split('T')[0] : ''}
                  onChange={(e) => {
                    const time = formData.endDate ? formData.endDate.split('T')[1] : '17:00';
                    handleInputChange('endDate', `${e.target.value}T${time}`);
                  }}
                  className="w-full px-3 py-2 border border-[#E8CBAE] rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent bg-white"
                  aria-label="End date"
                />
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#777777]" />
                  <select
                    value={formData.endDate ? formData.endDate.split('T')[1] : '17:00'}
                    onChange={(e) => {
                      const date = formData.endDate ? formData.endDate.split('T')[0] : new Date().toISOString().split('T')[0];
                      handleInputChange('endDate', `${date}T${e.target.value}`);
                    }}
                    className="px-3 py-2 border border-[#E8CBAE] rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent bg-white text-sm"
                    aria-label="End time"
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <option key={`${hour}:00`} value={`${hour}:00`}>
                          {hour}:00
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Date Presets */}
          <div className="bg-[#F7F2EC] rounded-lg p-3">
            <p className="text-sm font-medium text-[#2C2C2C] mb-2">Sales Window Duration:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '1 Day', duration: 1 },
                { label: '2 Days', duration: 2 },
                { label: '3 Days', duration: 3 },
                { label: '4 Days', duration: 4 },
                { label: '5 Days', duration: 5 }
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    const startDate = new Date();
                    startDate.setHours(9, 0, 0, 0);
                    
                    const endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + preset.duration - 1);
                    endDate.setHours(17, 0, 0, 0);
                    
                    handleInputChange('startDate', startDate.toISOString().slice(0, 16));
                    handleInputChange('endDate', endDate.toISOString().slice(0, 16));
                  }}
                  className="px-3 py-1 text-xs bg-white border border-[#E8CBAE] rounded-md hover:bg-[#5B6E02] hover:text-white transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
          Timezone
        </label>
        <select
          value={formData.timezone}
          onChange={(e) => handleInputChange('timezone', e.target.value)}
          className="w-full px-3 py-2 border border-[#E8CBAE] rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent bg-white"
          aria-label="Timezone"
        >
          <option value="America/New_York">Eastern Time (ET)</option>
          <option value="America/Chicago">Central Time (CT)</option>
          <option value="America/Denver">Mountain Time (MT)</option>
          <option value="America/Los_Angeles">Pacific Time (PT)</option>
        </select>
      </div>
    </div>
  );

  const renderStep2Channels = () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        Select the sales channels for this window. You can configure specific settings for each channel.
      </p>
      
      {/* Channel Selection */}
      <div className="grid grid-cols-2 gap-4">
        {['MEETUP_PICKUP', 'DELIVERY', 'DROP_OFF_LOCATION', 'MARKET', 'CUSTOM'].map((channelType) => (
          <div key={channelType} className="flex items-center">
            <input
              type="checkbox"
              id={channelType}
              checked={formData.channels?.some(c => c.type === channelType)}
              onChange={(e) => {
                if (e.target.checked) {
                  const newChannel: SalesChannel = { type: channelType as any, config: {} };
                  setFormData(prev => ({
                    ...prev,
                    channels: [...(prev.channels || []), newChannel]
                  }));
                } else {
                  setFormData(prev => ({
                    ...prev,
                    channels: prev.channels?.filter(c => c.type !== channelType) || []
                  }));
                }
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor={channelType} className="ml-2 text-sm text-gray-700">
              {channelType === 'MEETUP_PICKUP' && 'Pickup'}
              {channelType === 'DELIVERY' && 'Delivery'}
              {channelType === 'DROP_OFF_LOCATION' && 'Drop-off'}
              {channelType === 'MARKET' && 'Market'}
              {channelType === 'CUSTOM' && 'Custom'}
            </label>
          </div>
        ))}
      </div>

      {/* Channel Configuration */}
      {formData.channels && formData.channels.length > 0 && (
        <div className="space-y-4 mt-6">
          <h4 className="font-medium text-gray-900">Channel Configuration</h4>
          {formData.channels.map((channel, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">
                {channel.type === 'MEETUP_PICKUP' && 'Pickup Configuration'}
                {channel.type === 'DELIVERY' && 'Delivery Configuration'}
                {channel.type === 'DROP_OFF_LOCATION' && 'Drop-off Configuration'}
                {channel.type === 'MARKET' && 'Market Configuration'}
                {channel.type === 'CUSTOM' && 'Custom Configuration'}
              </h5>
              
              {/* Render channel-specific config fields */}
                             {channel.type === 'MEETUP_PICKUP' && (
                 <div className="space-y-3">
                   <div className="grid grid-cols-2 gap-3">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                         Street Address
                       </label>
                       <input
                         type="text"
                         value={channel.config.streetAddress || ''}
                         onChange={(e) => {
                           const updatedChannels = [...(formData.channels || [])];
                           updatedChannels[index].config.streetAddress = e.target.value;
                           setFormData(prev => ({ ...prev, channels: updatedChannels }));
                         }}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                         placeholder="123 Main Street"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                         City
                       </label>
                       <input
                         type="text"
                         value={channel.config.city || ''}
                         onChange={(e) => {
                           const updatedChannels = [...(formData.channels || [])];
                           updatedChannels[index].config.city = e.target.value;
                           setFormData(prev => ({ ...prev, channels: updatedChannels }));
                         }}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                         placeholder="Anytown"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                         State
                       </label>
                       <input
                         type="text"
                         value={channel.config.state || ''}
                         onChange={(e) => {
                           const updatedChannels = [...(formData.channels || [])];
                           updatedChannels[index].config.state = e.target.value;
                           setFormData(prev => ({ ...prev, channels: updatedChannels }));
                         }}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                         placeholder="CA"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                         ZIP Code
                       </label>
                       <input
                         type="text"
                         value={channel.config.zipCode || ''}
                         onChange={(e) => {
                           const updatedChannels = [...(formData.channels || [])];
                           updatedChannels[index].config.zipCode = e.target.value;
                           setFormData(prev => ({ ...prev, channels: updatedChannels }));
                         }}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                         placeholder="12345"
                       />
                     </div>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Pickup Instructions
                     </label>
                     <textarea
                       value={channel.config.pickupInstructions || ''}
                       onChange={(e) => {
                         const updatedChannels = [...(formData.channels || [])];
                         updatedChannels[index].config.pickupInstructions = e.target.value;
                         setFormData(prev => ({ ...prev, channels: updatedChannels }));
                       }}
                       rows={2}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       placeholder="e.g., Meet in parking lot, call when you arrive, etc."
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Pickup Time Slots
                     </label>
                     <div className="space-y-2">
                       {['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM'].map((time) => (
                         <div key={time} className="flex items-center">
                           <input
                             type="checkbox"
                             id={`pickup-${time}-${index}`}
                             checked={channel.config.pickupTimes?.includes(time) || false}
                             onChange={(e) => {
                               const updatedChannels = [...(formData.channels || [])];
                               const currentTimes = updatedChannels[index].config.pickupTimes || [];
                               if (e.target.checked) {
                                 updatedChannels[index].config.pickupTimes = [...currentTimes, time];
                               } else {
                                 updatedChannels[index].config.pickupTimes = currentTimes.filter(t => t !== time);
                               }
                               setFormData(prev => ({ ...prev, channels: updatedChannels }));
                             }}
                             className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                           />
                           <label htmlFor={`pickup-${time}-${index}`} className="ml-2 text-sm text-gray-700">
                             {time}
                           </label>
                         </div>
                       ))}
                     </div>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Max Orders Per Time Slot
                     </label>
                     <input
                       type="number"
                       min="1"
                       value={channel.config.maxOrdersPerSlot || ''}
                       onChange={(e) => {
                         const updatedChannels = [...(formData.channels || [])];
                         updatedChannels[index].config.maxOrdersPerSlot = Number(e.target.value);
                         setFormData(prev => ({ ...prev, channels: updatedChannels }));
                       }}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       placeholder="10"
                     />
                   </div>
                 </div>
               )}

                             {channel.type === 'DELIVERY' && (
                 <div className="grid grid-cols-2 gap-3">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Service Radius (miles)
                     </label>
                     <input
                       type="number"
                       value={channel.config.serviceRadius || ''}
                       onChange={(e) => {
                         const updatedChannels = [...(formData.channels || [])];
                         updatedChannels[index].config.serviceRadius = Number(e.target.value);
                         setFormData(prev => ({ ...prev, channels: updatedChannels }));
                       }}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       placeholder="25"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Base Fee ($)
                     </label>
                     <input
                       type="number"
                       step="0.01"
                       value={channel.config.baseFee || ''}
                       onChange={(e) => {
                         const updatedChannels = [...(formData.channels || [])];
                         updatedChannels[index].config.baseFee = Number(e.target.value);
                         setFormData(prev => ({ ...prev, channels: updatedChannels }));
                       }}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       placeholder="5.99"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Per Mile Fee ($)
                     </label>
                     <input
                       type="number"
                       step="0.01"
                       value={channel.config.perDistanceFee || ''}
                       onChange={(e) => {
                         const updatedChannels = [...(formData.channels || [])];
                         updatedChannels[index].config.perDistanceFee = Number(e.target.value);
                         setFormData(prev => ({ ...prev, channels: updatedChannels }));
                       }}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       placeholder="0.50"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Cutoff Hours
                     </label>
                     <input
                       type="number"
                       value={channel.config.cutoffHours || ''}
                       onChange={(e) => {
                         const updatedChannels = [...(formData.channels || [])];
                         updatedChannels[index].config.cutoffHours = Number(e.target.value);
                         setFormData(prev => ({ ...prev, channels: updatedChannels }));
                       }}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       placeholder="24"
                     />
                   </div>
                 </div>
               )}

                             {channel.type === 'DROP_OFF_LOCATION' && (
                 <div className="space-y-3">
                   <div className="grid grid-cols-2 gap-3">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                         Street Address
                       </label>
                       <input
                         type="text"
                         value={channel.config.streetAddress || ''}
                         onChange={(e) => {
                           const updatedChannels = [...(formData.channels || [])];
                           updatedChannels[index].config.streetAddress = e.target.value;
                           setFormData(prev => ({ ...prev, channels: updatedChannels }));
                         }}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                         placeholder="123 Main Street"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                         City
                       </label>
                       <input
                         type="text"
                         value={channel.config.city || ''}
                         onChange={(e) => {
                           const updatedChannels = [...(formData.channels || [])];
                           updatedChannels[index].config.city = e.target.value;
                           setFormData(prev => ({ ...prev, channels: updatedChannels }));
                         }}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                         placeholder="Anytown"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                         State
                       </label>
                       <input
                         type="text"
                         value={channel.config.state || ''}
                         onChange={(e) => {
                           const updatedChannels = [...(formData.channels || [])];
                           updatedChannels[index].config.state = e.target.value;
                           setFormData(prev => ({ ...prev, channels: updatedChannels }));
                         }}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                         placeholder="CA"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                         ZIP Code
                       </label>
                       <input
                         type="text"
                         value={channel.config.zipCode || ''}
                         onChange={(e) => {
                           const updatedChannels = [...(formData.channels || [])];
                           updatedChannels[index].config.zipCode = e.target.value;
                           setFormData(prev => ({ ...prev, channels: updatedChannels }));
                         }}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                         placeholder="12345"
                       />
                     </div>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Business Name
                     </label>
                     <input
                       type="text"
                       value={channel.config.businessName || ''}
                       onChange={(e) => {
                         const updatedChannels = [...(formData.channels || [])];
                         updatedChannels[index].config.businessName = e.target.value;
                         setFormData(prev => ({ ...prev, channels: updatedChannels }));
                       }}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       placeholder="e.g., ABC Coffee Shop"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Pickup Window
                     </label>
                     <input
                       type="text"
                       value={channel.config.pickupWindow || ''}
                       onChange={(e) => {
                         const updatedChannels = [...(formData.channels || [])];
                         updatedChannels[index].config.pickupWindow = e.target.value;
                         setFormData(prev => ({ ...prev, channels: updatedChannels }));
                       }}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       placeholder="e.g., Mon-Fri 9AM-5PM"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Drop-off Instructions
                     </label>
                     <textarea
                       value={channel.config.dropoffInstructions || ''}
                       onChange={(e) => {
                         const updatedChannels = [...(formData.channels || [])];
                         updatedChannels[index].config.dropoffInstructions = e.target.value;
                         setFormData(prev => ({ ...prev, channels: updatedChannels }));
                       }}
                       rows={2}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       placeholder="e.g., Leave package with front desk, call business when dropping off, etc."
                     />
                   </div>
                 </div>
               )}

               {channel.type === 'MARKET' && (
                 <div className="space-y-3">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Market Selection
                     </label>
                     <select
                       value={channel.config.marketId || ''}
                       onChange={(e) => {
                         const updatedChannels = [...(formData.channels || [])];
                         updatedChannels[index].config.marketId = e.target.value;
                         setFormData(prev => ({ ...prev, channels: updatedChannels }));
                       }}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       aria-label="Market Selection"
                     >
                       <option value="">Select a market...</option>
                       <option value="market-1">Downtown Farmers Market</option>
                       <option value="market-2">Weekend Artisan Market</option>
                       <option value="market-3">Seasonal Food Festival</option>
                       <option value="market-4">Holiday Craft Market</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Booth Information
                     </label>
                     <textarea
                       value={channel.config.boothInfo || ''}
                       onChange={(e) => {
                         const updatedChannels = [...(formData.channels || [])];
                         updatedChannels[index].config.boothInfo = e.target.value;
                         setFormData(prev => ({ ...prev, channels: updatedChannels }));
                       }}
                       rows={2}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       placeholder="e.g., Booth #12, Main Hall"
                     />
                   </div>
                   <div>
                     <label htmlFor={`preorder-cutoff-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                       Preorder Cutoff
                     </label>
                     <input
                       id={`preorder-cutoff-${index}`}
                       type="datetime-local"
                       value={channel.config.preorderCutoff || ''}
                       onChange={(e) => {
                         const updatedChannels = [...(formData.channels || [])];
                         updatedChannels[index].config.preorderCutoff = e.target.value;
                         setFormData(prev => ({ ...prev, channels: updatedChannels }));
                       }}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Market Commission Rate (%)
                     </label>
                     <input
                       type="number"
                       min="0"
                       max="100"
                       step="0.1"
                       value={channel.config.commissionRate || ''}
                       onChange={(e) => {
                         const updatedChannels = [...(formData.channels || [])];
                         updatedChannels[index].config.commissionRate = Number(e.target.value);
                         setFormData(prev => ({ ...prev, channels: updatedChannels }));
                       }}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       placeholder="15.0"
                     />
                   </div>
                 </div>
               )}

               {channel.type === 'CUSTOM' && (
                 <div className="space-y-3">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Custom Label
                     </label>
                     <input
                       type="text"
                       value={channel.config.label || ''}
                       onChange={(e) => {
                         const updatedChannels = [...(formData.channels || [])];
                         updatedChannels[index].config.label = e.target.value;
                         setFormData(prev => ({ ...prev, channels: updatedChannels }));
                       }}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       placeholder="e.g., Special Event"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Details
                     </label>
                     <textarea
                       value={channel.config.details || ''}
                       onChange={(e) => {
                         const updatedChannels = [...(formData.channels || [])];
                         updatedChannels[index].config.details = e.target.value;
                         setFormData(prev => ({ ...prev, channels: updatedChannels }));
                       }}
                       rows={3}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       placeholder="Describe the custom channel..."
                     />
                   </div>
                 </div>
               )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep3Products = () => (
    <ProductSelectionStep
      selectedProducts={formData.products || []}
      onProductsChange={(products) => handleInputChange('products', products)}
    />
  );

  const renderStep4Settings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="allowPreorders"
            checked={formData.settings?.allowPreorders}
            onChange={(e) => handleSettingsChange('allowPreorders', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="allowPreorders" className="ml-2 text-sm text-gray-700">
            Allow Preorders
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="showInStorefront"
            checked={formData.settings?.showInStorefront}
            onChange={(e) => handleSettingsChange('showInStorefront', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="showInStorefront" className="ml-2 text-sm text-gray-700">
            Show in Storefront
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="autoCloseWhenSoldOut"
            checked={formData.settings?.autoCloseWhenSoldOut}
            onChange={(e) => handleSettingsChange('autoCloseWhenSoldOut', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="autoCloseWhenSoldOut" className="ml-2 text-sm text-gray-700">
            Auto-close when sold out
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Total Capacity
        </label>
        <input
          type="number"
          value={formData.settings?.capacity || ''}
          onChange={(e) => handleSettingsChange('capacity', Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={formData.settings?.tags?.join(', ') || ''}
          onChange={(e) => handleSettingsChange('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., bread, weekend, pickup"
        />
      </div>
    </div>
  );

  const renderStep5Review = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
          <span className="text-sm text-blue-700">
            Review your sales window configuration before creating.
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="ml-2 font-medium">{formData.name || 'Not set'}</span>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <span className="ml-2 font-medium">{formData.status}</span>
            </div>
            <div>
              <span className="text-gray-600">Evergreen:</span>
              <span className="ml-2 font-medium">{formData.isEvergreen ? 'Yes' : 'No'}</span>
            </div>
            {!formData.isEvergreen && (
              <>
                <div>
                  <span className="text-gray-600">Start Date:</span>
                  <span className="ml-2 font-medium">{formData.startDate || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-gray-600">End Date:</span>
                  <span className="ml-2 font-medium">{formData.endDate || 'Not set'}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Channels ({formData.channels?.length || 0})</h4>
          {formData.channels && formData.channels.length > 0 ? (
            <div className="space-y-2">
              {formData.channels.map((channel, index) => (
                <div key={index} className="text-sm">
                  <span className="text-gray-600">• {channel.type}:</span>
                  <span className="ml-2 font-medium">
                    {channel.type === 'MEETUP_PICKUP' && 'Pickup'}
                    {channel.type === 'DELIVERY' && 'Delivery'}
                    {channel.type === 'DROP_OFF_LOCATION' && 'Drop-off'}
                    {channel.type === 'MARKET' && 'Market'}
                    {channel.type === 'CUSTOM' && 'Custom'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No channels selected</p>
          )}
        </div>

                 <div className="border border-gray-200 rounded-lg p-4">
           <h4 className="font-medium text-gray-900 mb-2">Products ({formData.products?.length || 0})</h4>
           {formData.products && formData.products.length > 0 ? (
             <div className="space-y-2">
               {formData.products.map((product, index) => (
                 <div key={index} className="text-sm">
                   <span className="text-gray-600">• {product.name}:</span>
                   <span className="ml-2 font-medium">
                     ${product.priceOverride?.toFixed(2) || 'Base price'}, 
                     Limit: {product.perOrderLimit || 'No limit'}, 
                     Cap: {product.totalCap || 'No cap'}
                   </span>
                 </div>
               ))}
             </div>
           ) : (
             <p className="text-sm text-gray-500">No products selected</p>
           )}
         </div>

         <div className="border border-gray-200 rounded-lg p-4">
           <h4 className="font-medium text-gray-900 mb-2">Settings</h4>
           <div className="grid grid-cols-2 gap-4 text-sm">
             <div>
               <span className="text-gray-600">Capacity:</span>
               <span className="ml-2 font-medium">{formData.settings?.capacity || 'Not set'}</span>
             </div>
             <div>
               <span className="text-gray-600">Tags:</span>
               <span className="ml-2 font-medium">
                 {formData.settings?.tags?.length ? formData.settings.tags.join(', ') : 'None'}
               </span>
             </div>
             <div>
               <span className="text-gray-600">Preorders:</span>
               <span className="ml-2 font-medium">{formData.settings?.allowPreorders ? 'Allowed' : 'Not allowed'}</span>
             </div>
             <div>
               <span className="text-gray-600">Storefront:</span>
               <span className="ml-2 font-medium">{formData.settings?.showInStorefront ? 'Visible' : 'Hidden'}</span>
             </div>
           </div>
         </div>
      </div>
    </div>
  );

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
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-3"
              title="Close drawer"
              aria-label="Close drawer"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
            {renderStepTitle()}
          </div>
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
