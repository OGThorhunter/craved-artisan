import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

interface FeeScheduleFormProps {
  onSubmit: (data: FeeScheduleFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface FeeScheduleFormData {
  name: string;
  scope: 'GLOBAL' | 'ROLE' | 'VENDOR' | 'EVENT' | 'CATEGORY' | 'ORDER';
  scopeRefId?: string;
  takeRateBps?: number;
  feeFloorCents?: number;
  feeCapCents?: number;
  activeFrom: string;
  activeTo?: string;
}

export const FeeScheduleForm: React.FC<FeeScheduleFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<FeeScheduleFormData>({
    name: '',
    scope: 'GLOBAL',
    takeRateBps: 1000, // 10% default
    feeFloorCents: 50, // $0.50 default
    activeFrom: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.activeFrom) {
      newErrors.activeFrom = 'Active from date is required';
    }
    
    if (formData.takeRateBps !== undefined && formData.takeRateBps < 0) {
      newErrors.takeRateBps = 'Take rate cannot be negative';
    }
    
    if (formData.feeFloorCents !== undefined && formData.feeFloorCents < 0) {
      newErrors.feeFloorCents = 'Floor cannot be negative';
    }
    
    if (formData.feeCapCents !== undefined && formData.feeCapCents < 0) {
      newErrors.feeCapCents = 'Cap cannot be negative';
    }

    if (formData.scope !== 'GLOBAL' && !formData.scopeRefId?.trim()) {
      newErrors.scopeRefId = 'Reference ID is required for non-global scopes';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
  };

  const handleChange = (field: keyof FeeScheduleFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Create New Fee Schedule
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close form"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Premium Vendor Rate"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Scope */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scope *
            </label>
            <select
              value={formData.scope}
              onChange={(e) => handleChange('scope', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Fee schedule scope"
            >
              <option value="GLOBAL">Global (All transactions)</option>
              <option value="ROLE">Role (e.g., All vendors)</option>
              <option value="VENDOR">Vendor (Specific vendor)</option>
              <option value="EVENT">Event (Specific event)</option>
              <option value="CATEGORY">Category (Product category)</option>
              <option value="ORDER">Order (Specific order)</option>
            </select>
          </div>

          {/* Scope Reference ID (if not global) */}
          {formData.scope !== 'GLOBAL' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference ID *
              </label>
              <input
                type="text"
                value={formData.scopeRefId || ''}
                onChange={(e) => handleChange('scopeRefId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.scopeRefId ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={`Enter ${formData.scope.toLowerCase()} ID`}
              />
              {errors.scopeRefId && (
                <p className="mt-1 text-sm text-red-600">{errors.scopeRefId}</p>
              )}
            </div>
          )}

          {/* Take Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Take Rate (%)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.takeRateBps !== undefined ? formData.takeRateBps / 100 : ''}
                onChange={(e) =>
                  handleChange(
                    'takeRateBps',
                    e.target.value ? parseFloat(e.target.value) * 100 : undefined
                  )
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.takeRateBps ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="10.00"
              />
              <span className="text-gray-500">%</span>
            </div>
            {errors.takeRateBps && (
              <p className="mt-1 text-sm text-red-600">{errors.takeRateBps}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Percentage of transaction amount (e.g., 10% = 10.00)
            </p>
          </div>

          {/* Fee Floor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Fee ($)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.feeFloorCents !== undefined ? formData.feeFloorCents / 100 : ''}
                onChange={(e) =>
                  handleChange(
                    'feeFloorCents',
                    e.target.value ? Math.round(parseFloat(e.target.value) * 100) : undefined
                  )
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.feeFloorCents ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.50"
              />
            </div>
            {errors.feeFloorCents && (
              <p className="mt-1 text-sm text-red-600">{errors.feeFloorCents}</p>
            )}
          </div>

          {/* Fee Cap */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Fee ($) <span className="text-gray-400">(Optional)</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.feeCapCents !== undefined ? formData.feeCapCents / 100 : ''}
                onChange={(e) =>
                  handleChange(
                    'feeCapCents',
                    e.target.value ? Math.round(parseFloat(e.target.value) * 100) : undefined
                  )
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.feeCapCents ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Leave empty for no cap"
              />
            </div>
            {errors.feeCapCents && (
              <p className="mt-1 text-sm text-red-600">{errors.feeCapCents}</p>
            )}
          </div>

          {/* Active From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Active From *
            </label>
            <input
              type="date"
              value={formData.activeFrom}
              onChange={(e) => handleChange('activeFrom', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.activeFrom ? 'border-red-300' : 'border-gray-300'
              }`}
              aria-label="Active from date"
            />
            {errors.activeFrom && (
              <p className="mt-1 text-sm text-red-600">{errors.activeFrom}</p>
            )}
          </div>

          {/* Active To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Active To <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="date"
              value={formData.activeTo || ''}
              onChange={(e) => handleChange('activeTo', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Active to date (optional)"
            />
            <p className="mt-1 text-sm text-gray-500">
              Leave empty for no expiration
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Fee Schedule Versioning</p>
                <p>
                  Creating this schedule will automatically assign it the next version number.
                  Previous versions will remain in the database for audit purposes.
                </p>
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
              {isLoading ? 'Creating...' : 'Create Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

