import React, { useState } from 'react';
import {
  X,
  Calendar,
  Percent,
  DollarSign,
  Gift,
  ShoppingCart,
  Star,
  Users,
  Target,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface PromotionCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promotion: any) => void;
  template?: any;
}

const PromotionCreateModal: React.FC<PromotionCreateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  template
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'percentage',
    value: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    usageLimit: 0,
    startDate: '',
    endDate: '',
    targetType: 'all_customers',
    targetSegment: '',
    productCategories: [] as string[],
    excludedProducts: [] as string[],
    abTestEnabled: false,
    abTestVariants: [] as any[],
    conditions: {
      minPurchaseAmount: 0,
      maxPurchaseAmount: 0,
      requiredProducts: [] as string[],
      excludedCategories: [] as string[],
      customerLifetimeValue: 0,
      customerOrderCount: 0,
      customerLastOrderDays: 0,
      geographicRestrictions: [] as string[],
      timeRestrictions: {
        daysOfWeek: [] as number[],
        hoursOfDay: { start: 0, end: 23 }
      }
    }
  });

  const promotionTypes = [
    { value: 'percentage', label: 'Percentage Discount', icon: Percent, description: 'X% off' },
    { value: 'fixed_amount', label: 'Fixed Amount', icon: DollarSign, description: '$X off' },
    { value: 'bogo', label: 'Buy One Get One', icon: Gift, description: 'Buy X get Y free' },
    { value: 'free_shipping', label: 'Free Shipping', icon: ShoppingCart, description: 'Free shipping on orders' },
    { value: 'loyalty_points', label: 'Loyalty Points', icon: Star, description: 'Earn X points' }
  ];

  const targetTypes = [
    { value: 'all_customers', label: 'All Customers', description: 'Apply to all customers' },
    { value: 'new_customers', label: 'New Customers', description: 'First-time customers only' },
    { value: 'returning_customers', label: 'Returning Customers', description: 'Customers with previous orders' },
    { value: 'vip_customers', label: 'VIP Customers', description: 'High-value customers' },
    { value: 'segment', label: 'Custom Segment', description: 'Target specific customer segment' }
  ];

  const productCategories = [
    'baked-goods',
    'desserts',
    'cookies',
    'pastries',
    'breads',
    'cakes',
    'seasonal',
    'gluten-free',
    'vegan',
    'keto'
  ];

  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConditionChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [field]: value
      }
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      productCategories: prev.productCategories.includes(category)
        ? prev.productCategories.filter(c => c !== category)
        : [...prev.productCategories, category]
    }));
  };

  const handleDayToggle = (day: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        timeRestrictions: {
          ...prev.conditions.timeRestrictions,
          daysOfWeek: prev.conditions.timeRestrictions.daysOfWeek.includes(day)
            ? prev.conditions.timeRestrictions.daysOfWeek.filter(d => d !== day)
            : [...prev.conditions.timeRestrictions.daysOfWeek, day]
        }
      }
    }));
  };

  const handleSave = () => {
    const promotion = {
      ...formData,
      id: Date.now().toString(),
      status: 'draft',
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      performance: {
        totalUses: 0,
        totalDiscount: 0,
        conversionRate: 0,
        revenue: 0,
        roi: 0
      }
    };
    onSave(promotion);
    onClose();
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Promotion Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., New Customer Welcome"
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
              placeholder="Describe your promotion..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Promotion Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {promotionTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => handleInputChange('type', type.value)}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      formData.type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">{type.label}</div>
                        <div className="text-sm text-gray-500">{type.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.type === 'percentage' ? 'Discount Percentage' : 
                 formData.type === 'fixed_amount' ? 'Discount Amount' :
                 formData.type === 'bogo' ? 'Free Items' :
                 formData.type === 'loyalty_points' ? 'Points to Award' : 'Value'}
              </label>
              <div className="relative">
                {formData.type === 'percentage' && <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />}
                {formData.type === 'fixed_amount' && <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />}
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
                  className={`w-full ${formData.type === 'percentage' || formData.type === 'fixed_amount' ? 'pl-10' : 'pl-3'} pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="0"
                />
                {formData.type === 'percentage' && <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>}
                {formData.type === 'fixed_amount' && <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>}
              </div>
            </div>

            {formData.type !== 'free_shipping' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Order Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => handleInputChange('minOrderAmount', parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Discount Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  value={formData.maxDiscountAmount}
                  onChange={(e) => handleInputChange('maxDiscountAmount', parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="No limit"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usage Limit
              </label>
              <input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => handleInputChange('usageLimit', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="No limit"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Targeting & Conditions</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience
            </label>
            <div className="space-y-3">
              {targetTypes.map((target) => (
                <button
                  key={target.value}
                  onClick={() => handleInputChange('targetType', target.value)}
                  className={`w-full p-4 border rounded-lg text-left transition-colors ${
                    formData.targetType === target.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">{target.label}</div>
                      <div className="text-sm text-gray-500">{target.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Categories
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {productCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryToggle(category)}
                  className={`p-2 text-sm rounded-lg border transition-colors ${
                    formData.productCategories.includes(category)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Lifetime Value (Min)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  value={formData.conditions.customerLifetimeValue}
                  onChange={(e) => handleConditionChange('customerLifetimeValue', parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  title="Minimum customer lifetime value"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Order Count
              </label>
              <input
                type="number"
                value={formData.conditions.customerOrderCount}
                onChange={(e) => handleConditionChange('customerOrderCount', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                title="Minimum number of orders"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Days Since Last Order (Max)
            </label>
            <input
              type="number"
              value={formData.conditions.customerLastOrderDays}
              onChange={(e) => handleConditionChange('customerLastOrderDays', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="No limit"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Days of Week
            </label>
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((day, index) => (
                <button
                  key={index}
                  onClick={() => handleDayToggle(index)}
                  className={`p-2 text-xs rounded-lg border transition-colors ${
                    formData.conditions.timeRestrictions.daysOfWeek.includes(index)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule & A/B Testing</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Promotion start date and time"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Promotion end date and time"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-md font-medium text-gray-900">A/B Testing</h4>
                <p className="text-sm text-gray-500">Test different versions of your promotion</p>
              </div>
              <button
                onClick={() => handleInputChange('abTestEnabled', !formData.abTestEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.abTestEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                title="Enable A/B testing"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.abTestEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {formData.abTestEnabled && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">A/B Test Configuration</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    A/B testing will be automatically configured with 50/50 traffic split between variants.
                    You can create additional variants after saving this promotion.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {template ? `Create from Template: ${template.name}` : 'Create New Promotion'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            title="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > stepNumber ? <CheckCircle className="h-4 w-4" /> : stepNumber}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step >= stepNumber ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {stepNumber === 1 ? 'Basic Info' : stepNumber === 2 ? 'Targeting' : 'Schedule'}
                </span>
                {stepNumber < 3 && (
                  <div className={`w-8 h-0.5 ml-4 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {step > 1 ? 'Previous' : 'Cancel'}
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Save as Draft
            </button>
            <button
              onClick={step < 3 ? () => setStep(step + 1) : handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {step < 3 ? 'Next' : 'Create Promotion'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionCreateModal;
