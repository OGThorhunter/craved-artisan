import React, { useState } from 'react';
import { X, Save, Tag, AlertCircle } from 'lucide-react';

interface PromoEditorProps {
  onSubmit: (data: PromoFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface PromoFormData {
  code: string;
  appliesTo: 'PLATFORM_FEE' | 'SUBSCRIPTION' | 'EVENT';
  percentOffBps?: number;
  amountOffCents?: number;
  startsAt: string;
  endsAt?: string;
  audienceTag?: string;
  maxRedemptions?: number;
}

export const PromoEditor: React.FC<PromoEditorProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<PromoFormData>({
    code: '',
    appliesTo: 'PLATFORM_FEE',
    startsAt: new Date().toISOString().split('T')[0],
  });

  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.code.trim()) {
      newErrors.code = 'Promo code is required';
    }
    
    if (discountType === 'percentage' && !formData.percentOffBps) {
      newErrors.discount = 'Percentage discount is required';
    }
    
    if (discountType === 'fixed' && !formData.amountOffCents) {
      newErrors.discount = 'Fixed amount is required';
    }
    
    if (!formData.startsAt) {
      newErrors.startsAt = 'Start date is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
  };

  const handleChange = (field: keyof PromoFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleDiscountTypeChange = (type: 'percentage' | 'fixed') => {
    setDiscountType(type);
    if (type === 'percentage') {
      setFormData((prev) => ({ ...prev, amountOffCents: undefined }));
    } else {
      setFormData((prev) => ({ ...prev, percentOffBps: undefined }));
    }
    setErrors((prev) => ({ ...prev, discount: '' }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Tag className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Create Promotional Code
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close form"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Promo Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Promo Code *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 uppercase ${
                errors.code ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., SAVE10"
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code}</p>
            )}
          </div>

          {/* Applies To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Applies To *
            </label>
            <select
              value={formData.appliesTo}
              onChange={(e) => handleChange('appliesTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Promo applies to"
            >
              <option value="PLATFORM_FEE">Platform Fees</option>
              <option value="SUBSCRIPTION">Subscriptions</option>
              <option value="EVENT">Events</option>
            </select>
          </div>

          {/* Discount Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Type *
            </label>
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => handleDiscountTypeChange('percentage')}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  discountType === 'percentage'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Percentage
              </button>
              <button
                type="button"
                onClick={() => handleDiscountTypeChange('fixed')}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  discountType === 'fixed'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Fixed Amount
              </button>
            </div>
          </div>

          {/* Discount Value */}
          {discountType === 'percentage' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Percentage Off (%) *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.percentOffBps !== undefined ? formData.percentOffBps / 100 : ''}
                  onChange={(e) =>
                    handleChange(
                      'percentOffBps',
                      e.target.value ? Math.round(parseFloat(e.target.value) * 100) : undefined
                    )
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.discount ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="10.00"
                />
                <span className="text-gray-500">%</span>
              </div>
              {errors.discount && (
                <p className="mt-1 text-sm text-red-600">{errors.discount}</p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fixed Amount Off ($) *
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amountOffCents !== undefined ? formData.amountOffCents / 100 : ''}
                  onChange={(e) =>
                    handleChange(
                      'amountOffCents',
                      e.target.value ? Math.round(parseFloat(e.target.value) * 100) : undefined
                    )
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.discount ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="5.00"
                />
              </div>
              {errors.discount && (
                <p className="mt-1 text-sm text-red-600">{errors.discount}</p>
              )}
            </div>
          )}

          {/* Starts At */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Starts At *
            </label>
            <input
              type="date"
              value={formData.startsAt}
              onChange={(e) => handleChange('startsAt', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.startsAt ? 'border-red-300' : 'border-gray-300'
              }`}
              aria-label="Promo start date"
            />
            {errors.startsAt && (
              <p className="mt-1 text-sm text-red-600">{errors.startsAt}</p>
            )}
          </div>

          {/* Ends At */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ends At <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="date"
              value={formData.endsAt || ''}
              onChange={(e) => handleChange('endsAt', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Promo end date (optional)"
            />
            <p className="mt-1 text-sm text-gray-500">
              Leave empty for no expiration
            </p>
          </div>

          {/* Max Redemptions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Redemptions <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.maxRedemptions || ''}
              onChange={(e) =>
                handleChange('maxRedemptions', e.target.value ? parseInt(e.target.value) : undefined)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Unlimited"
            />
            <p className="mt-1 text-sm text-gray-500">
              Leave empty for unlimited redemptions
            </p>
          </div>

          {/* Audience Tag */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audience Tag <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.audienceTag || ''}
              onChange={(e) => handleChange('audienceTag', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="e.g., vip, new-users"
            />
            <p className="mt-1 text-sm text-gray-500">
              Segment targeting (comma-separated tags)
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Promo Code Best Practices</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Use uppercase, memorable codes (e.g., WELCOME10, SAVE5)</li>
                  <li>Set reasonable expiration dates to create urgency</li>
                  <li>Limit redemptions to prevent abuse</li>
                  <li>Track performance and adjust as needed</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Creating...' : 'Create Promo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

