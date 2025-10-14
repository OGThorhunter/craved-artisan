import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Package, 
  Layers, 
  ShoppingCart, 
  CheckCircle, 
  Circle, 
  AlertTriangle, 
  Info, 
  ChevronRight,
  Eye,
  Edit3
} from 'lucide-react';
import type { Product, ProductVariant } from '../../types/products';
import type { 
  LabelProfileResolution, 
  OrderLineItem,
  LabelProfileReference
} from '../../services/labelProfileHierarchy';
import { 
  resolveLabelProfile, 
  getInheritanceExplanation,
  labelProfileHierarchy
} from '../../services/labelProfileHierarchy';

interface LabelProfileHierarchyViewerProps {
  product?: Product;
  variant?: ProductVariant;
  orderLineItem?: OrderLineItem;
  onEditProfile?: (level: 'system' | 'product' | 'variant' | 'order', profileId?: string) => void;
  showActions?: boolean;
  className?: string;
}

const levelIcons = {
  order: ShoppingCart,
  variant: Layers,
  product: Package,
  system: Settings
};

const levelLabels = {
  order: 'Order Override',
  variant: 'Variant Override',
  product: 'Product Default', 
  system: 'System Default'
};

const levelColors = {
  order: 'bg-purple-100 text-purple-800 border-purple-200',
  variant: 'bg-blue-100 text-blue-800 border-blue-200',
  product: 'bg-green-100 text-green-800 border-green-200',
  system: 'bg-gray-100 text-gray-800 border-gray-200'
};

const levelActiveColors = {
  order: 'bg-purple-500 text-white border-purple-600',
  variant: 'bg-blue-500 text-white border-blue-600',
  product: 'bg-green-500 text-white border-green-600',
  system: 'bg-gray-500 text-white border-gray-600'
};

export const LabelProfileHierarchyViewer: React.FC<LabelProfileHierarchyViewerProps> = ({
  product,
  variant,
  orderLineItem,
  onEditProfile,
  showActions = false,
  className = ''
}) => {
  const [resolution, setResolution] = useState<LabelProfileResolution | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const resolved = resolveLabelProfile(product, variant, orderLineItem);
    setResolution(resolved);
  }, [product, variant, orderLineItem]);

  if (!resolution) {
    return (
      <div className={`animate-pulse bg-gray-200 h-32 rounded-lg ${className}`}>
        <div className="p-4 text-center text-gray-500">Loading hierarchy...</div>
      </div>
    );
  }

  const activeLevel = resolution.hierarchy.find(h => h.isActive);
  const hasResolution = resolution.profileId !== null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h4 className="font-medium text-gray-900">Label Profile Inheritance</h4>
          {hasResolution && (
            <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              <CheckCircle className="w-3 h-3" />
              <span>Resolved</span>
            </div>
          )}
        </div>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
        >
          <span>{showDetails ? 'Hide' : 'Show'} details</span>
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Current Resolution Summary */}
      <div className={`p-4 rounded-lg border-2 ${
        hasResolution 
          ? 'bg-green-50 border-green-200' 
          : 'bg-orange-50 border-orange-200'
      }`}>
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${
            hasResolution ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
          }`}>
            {hasResolution ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="font-medium text-gray-900">
              {hasResolution ? (
                resolution.profile?.name || 'Unknown Profile'
              ) : (
                'No Label Profile'
              )}
            </div>
            
            <div className="text-sm text-gray-600 mt-1">
              {getInheritanceExplanation(resolution)}
            </div>

            {hasResolution && resolution.profile && (
              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                <span>Engine: {resolution.profile.engine}</span>
                {resolution.profile.description && (
                  <span>• {resolution.profile.description}</span>
                )}
              </div>
            )}
          </div>

          {hasResolution && activeLevel && (
            <div className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
              levelActiveColors[activeLevel.level]
            }`}>
              {levelLabels[activeLevel.level]}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Hierarchy View */}
      {showDetails && (
        <div className="space-y-3">
          <div className="text-sm text-gray-600 flex items-center space-x-2">
            <Info className="w-4 h-4 text-blue-500" />
            <span>Hierarchy is evaluated from top to bottom. First match wins.</span>
          </div>

          <div className="space-y-2">
            {resolution.hierarchy.map((level, index) => {
              const Icon = levelIcons[level.level];
              const isActive = level.isActive;
              const hasProfile = level.profileId !== null;
              
              return (
                <div
                  key={level.level}
                  className={`flex items-center space-x-3 p-3 rounded-lg border ${
                    isActive 
                      ? levelActiveColors[level.level]
                      : hasProfile
                        ? levelColors[level.level]
                        : 'bg-gray-50 text-gray-400 border-gray-200'
                  }`}
                >
                  {/* Priority Indicator */}
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                      isActive 
                        ? 'border-white bg-white/20 text-white' 
                        : 'border-current bg-white/50'
                    }`}>
                      {index + 1}
                    </div>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Level Info */}
                  <div className="flex-1">
                    <div className="font-medium">
                      {levelLabels[level.level]}
                    </div>
                    {hasProfile ? (
                      <div className="text-sm opacity-90">
                        Profile ID: {level.profileId}
                      </div>
                    ) : (
                      <div className="text-sm opacity-60">
                        Not configured
                      </div>
                    )}
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center space-x-2">
                    {isActive && (
                      <div className="flex items-center space-x-1 text-xs bg-white/20 px-2 py-1 rounded">
                        <CheckCircle className="w-3 h-3" />
                        <span>Active</span>
                      </div>
                    )}
                    
                    {showActions && onEditProfile && (
                      <button
                        onClick={() => onEditProfile(level.level, level.profileId || undefined)}
                        className="p-1.5 rounded hover:bg-white/20 transition-colors"
                        title={`Edit ${levelLabels[level.level]}`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Flow Indicator */}
                  {!isActive && index < resolution.hierarchy.length - 1 && (
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Fallback Chain */}
          {resolution.fallbackChain.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="font-medium text-blue-900 mb-2">Fallback Chain</div>
              <div className="text-sm text-blue-800">
                If the active profile fails, the system will try: {' '}
                {resolution.fallbackChain.join(' → ')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
