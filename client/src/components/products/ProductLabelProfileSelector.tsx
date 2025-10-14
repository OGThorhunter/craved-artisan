import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Settings, 
  Plus, 
  Check, 
  X, 
  AlertCircle,
  Eye,
  Printer,
  Tag
} from 'lucide-react';

interface LabelProfile {
  id: string;
  name: string;
  description?: string;
  mediaWidthIn: number;
  mediaHeightIn: number;
  engine: 'PDF' | 'ZPL' | 'TSPL' | 'BrotherQL';
  isActive: boolean;
  printerProfile?: {
    id: string;
    name: string;
    driver: string;
  };
}

interface ProductLabelProfileSelectorProps {
  selectedProfileId?: string;
  onProfileSelect: (profileId: string | undefined) => void;
  disabled?: boolean;
  showPreview?: boolean;
  className?: string;
}

export const ProductLabelProfileSelector: React.FC<ProductLabelProfileSelectorProps> = ({
  selectedProfileId,
  onProfileSelect,
  disabled = false,
  showPreview = true,
  className = ''
}) => {
  const [profiles, setProfiles] = useState<LabelProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLabelProfiles();
  }, []);

  const loadLabelProfiles = async () => {
    try {
      setIsLoading(true);
      
      // Mock API call - replace with actual service
      const mockProfiles: LabelProfile[] = [
        {
          id: 'profile-1',
          name: '2×1 Product Label',
          description: 'Standard product label for retail items',
          mediaWidthIn: 2,
          mediaHeightIn: 1,
          engine: 'ZPL',
          isActive: true,
          printerProfile: {
            id: 'printer-1',
            name: 'Zebra ZT230',
            driver: 'ZPL'
          }
        },
        {
          id: 'profile-2', 
          name: '4×6 Shipping Label',
          description: 'Standard shipping label for packages',
          mediaWidthIn: 4,
          mediaHeightIn: 6,
          engine: 'ZPL',
          isActive: true,
          printerProfile: {
            id: 'printer-1',
            name: 'Zebra ZT230',
            driver: 'ZPL'
          }
        },
        {
          id: 'profile-3',
          name: '1×1 Barcode Label',
          description: 'Simple barcode label for inventory tracking',
          mediaWidthIn: 1,
          mediaHeightIn: 1,
          engine: 'ZPL',
          isActive: true,
          printerProfile: {
            id: 'printer-1',
            name: 'Zebra ZT230',
            driver: 'ZPL'
          }
        },
        {
          id: 'profile-4',
          name: '3×2 Detailed Product',
          description: 'Detailed product label with ingredients and nutrition',
          mediaWidthIn: 3,
          mediaHeightIn: 2,
          engine: 'PDF',
          isActive: true,
          printerProfile: {
            id: 'printer-2',
            name: 'Brother QL-820NWB',
            driver: 'BrotherQL'
          }
        }
      ];

      setProfiles(mockProfiles);
      setError(null);
    } catch (err) {
      setError('Failed to load label profiles');
      console.error('Error loading label profiles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProfile = profiles.find(p => p.id === selectedProfileId);

  const handleProfileSelect = (profileId: string) => {
    onProfileSelect(profileId);
    setIsOpen(false);
  };

  const handleClearSelection = () => {
    onProfileSelect(undefined);
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="block text-sm font-medium text-gray-700">
          Label Profile
        </label>
        <div className="animate-pulse bg-gray-200 h-10 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="block text-sm font-medium text-gray-700">
          Label Profile
        </label>
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Label Profile
      </label>
      
      <div className="relative">
        {/* Selected Profile Display / Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-colors ${
            disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:border-gray-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-gray-400" />
              {selectedProfile ? (
                <div>
                  <div className="font-medium text-gray-900">{selectedProfile.name}</div>
                  <div className="text-xs text-gray-500">
                    {selectedProfile.mediaWidthIn}" × {selectedProfile.mediaHeightIn}" • {selectedProfile.engine}
                  </div>
                </div>
              ) : (
                <span className="text-gray-500">Select a label profile...</span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              {selectedProfile && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearSelection();
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              <div className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {/* No Profile Option */}
            <button
              type="button"
              onClick={handleClearSelection}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 flex items-center space-x-2"
            >
              <X className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">No label profile</span>
              {!selectedProfileId && (
                <Check className="w-4 h-4 text-brand-green ml-auto" />
              )}
            </button>

            {/* Profile Options */}
            {profiles.map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => handleProfileSelect(profile.id)}
                className="w-full px-3 py-3 text-left hover:bg-gray-50 flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="p-2 bg-gray-100 rounded text-gray-600 group-hover:bg-brand-green/10 group-hover:text-brand-green transition-colors">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{profile.name}</div>
                    <div className="text-sm text-gray-500">{profile.description}</div>
                    <div className="text-xs text-gray-400 mt-1 flex items-center space-x-3">
                      <span>{profile.mediaWidthIn}" × {profile.mediaHeightIn}"</span>
                      <span>•</span>
                      <span>{profile.engine}</span>
                      {profile.printerProfile && (
                        <>
                          <span>•</span>
                          <span>{profile.printerProfile.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {showPreview && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Show preview modal
                        console.log('Preview profile:', profile.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {selectedProfileId === profile.id && (
                    <Check className="w-4 h-4 text-brand-green" />
                  )}
                </div>
              </button>
            ))}

            {/* Create New Profile Option */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                // TODO: Open label profile creation modal
                console.log('Create new label profile');
              }}
              className="w-full px-3 py-2 text-left border-t border-gray-100 hover:bg-gray-50 flex items-center space-x-2 text-brand-green"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">Create new profile</span>
            </button>
          </div>
        )}
      </div>

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        Label profiles determine how this product's labels will be printed. This can be overridden per order if needed.
      </p>
    </div>
  );
};
