import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Settings, 
  Tag, 
  AlertCircle, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import type { ProductVariant } from '../../types/products';
import { ProductLabelProfileSelector } from './ProductLabelProfileSelector';

interface VariantLabelOverridesProps {
  variants: ProductVariant[];
  onVariantUpdate: (variants: ProductVariant[]) => void;
  defaultLabelProfileId?: string;
  disabled?: boolean;
  className?: string;
}

export const VariantLabelOverrides: React.FC<VariantLabelOverridesProps> = ({
  variants,
  onVariantUpdate,
  defaultLabelProfileId,
  disabled = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingVariant, setEditingVariant] = useState<string | null>(null);

  // Count variants with overrides
  const overrideCount = variants.filter(v => v.labelProfileId).length;
  const hasOverrides = overrideCount > 0;

  const handleVariantLabelChange = (variantId: string, labelProfileId?: string) => {
    const updatedVariants = variants.map(variant => {
      if (variant.id === variantId) {
        return {
          ...variant,
          labelProfileId
        };
      }
      return variant;
    });
    
    onVariantUpdate(updatedVariants);
    setEditingVariant(null);
  };

  const clearAllOverrides = () => {
    const updatedVariants = variants.map(variant => ({
      ...variant,
      labelProfileId: undefined
    }));
    onVariantUpdate(updatedVariants);
  };

  const getInheritanceInfo = (variant: ProductVariant) => {
    if (variant.labelProfileId) {
      return {
        type: 'override' as const,
        message: 'Using custom label profile'
      };
    } else if (defaultLabelProfileId) {
      return {
        type: 'inherited' as const,
        message: 'Inheriting from product default'
      };
    } else {
      return {
        type: 'none' as const,
        message: 'No label profile (will use system default)'
      };
    }
  };

  if (variants.length === 0) {
    return (
      <div className={`p-4 border border-gray-200 rounded-lg bg-gray-50 ${className}`}>
        <div className="flex items-center space-x-2 text-gray-500">
          <Package className="w-4 h-4" />
          <span className="text-sm">No variants available for label overrides</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h4 className="font-medium text-gray-900">Variant Label Overrides</h4>
          {hasOverrides && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {overrideCount} override{overrideCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {hasOverrides && (
            <button
              type="button"
              onClick={clearAllOverrides}
              disabled={disabled}
              className="text-xs text-red-600 hover:text-red-800 disabled:text-red-400"
            >
              Clear all
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
          >
            <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="flex items-start space-x-2 text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
        <Info className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
        <div>
          <p className="font-medium text-blue-900 mb-1">Variant Label Inheritance</p>
          <p>
            Each variant can have its own label profile. If not specified, variants inherit the product's default label profile. 
            This is useful when different sizes, colors, or configurations need different label formats.
          </p>
        </div>
      </div>

      {/* Variant List */}
      {isExpanded && (
        <div className="space-y-3 border border-gray-200 rounded-lg p-4">
          {variants.map((variant, index) => {
            const inheritanceInfo = getInheritanceInfo(variant);
            const isEditing = editingVariant === variant.id;

            return (
              <div
                key={variant.id}
                className={`border border-gray-200 rounded-lg p-3 ${
                  variant.labelProfileId ? 'bg-blue-50 border-blue-200' : 'bg-white'
                }`}
              >
                {/* Variant Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-gray-100 rounded text-gray-600">
                      <Package className="w-3 h-3" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">{variant.name}</h5>
                      {Object.keys(variant.attributes).length > 0 && (
                        <div className="flex space-x-2 mt-1">
                          {Object.entries(variant.attributes).map(([key, value]) => (
                            <span
                              key={key}
                              className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded"
                            >
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Inheritance Status */}
                    <div className="flex items-center space-x-1 text-xs">
                      {inheritanceInfo.type === 'override' && (
                        <span className="text-blue-600 font-medium">Custom</span>
                      )}
                      {inheritanceInfo.type === 'inherited' && (
                        <span className="text-gray-600">Inherited</span>
                      )}
                      {inheritanceInfo.type === 'none' && (
                        <span className="text-orange-600">None</span>
                      )}
                    </div>

                    {/* Edit Button */}
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => setEditingVariant(variant.id)}
                        disabled={disabled}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                        title={`Edit label profile for ${variant.name}`}
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Edit Mode */}
                {isEditing && (
                  <div className="space-y-3 border-t border-gray-200 pt-3">
                    <ProductLabelProfileSelector
                      selectedProfileId={variant.labelProfileId}
                      onProfileSelect={(profileId) => {
                        handleVariantLabelChange(variant.id, profileId);
                      }}
                      disabled={disabled}
                      showPreview={false}
                      className="mb-0"
                    />
                    
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setEditingVariant(null)}
                        className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Current Status (when not editing) */}
                {!isEditing && (
                  <div className="text-xs text-gray-600 mt-2">
                    {inheritanceInfo.message}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary when collapsed */}
      {!isExpanded && variants.length > 0 && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span>
              {variants.length} variant{variants.length !== 1 ? 's' : ''} • 
              {hasOverrides ? (
                <span className="text-blue-600 font-medium ml-1">
                  {overrideCount} with custom labels
                </span>
              ) : (
                <span className="ml-1">All inheriting default</span>
              )}
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="text-brand-green hover:text-brand-green/80 font-medium"
            >
              Manage overrides
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
