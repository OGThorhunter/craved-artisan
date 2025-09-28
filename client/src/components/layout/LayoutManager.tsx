import React, { useState, useCallback } from 'react';
import { Save, Download, Grid, Image, Settings, Plus, Trash2 } from 'lucide-react';
import type { EventLayout, Zone, Stall, LayoutType } from '@/lib/api/layout';
import { GridLayoutEditor } from './GridLayoutEditor';
import { ImageOverlayEditor } from './ImageOverlayEditor';
import { ZoneManager } from './ZoneManager';
import { StallManager } from './StallManager';
import { LayoutSettings } from './LayoutSettings';

interface LayoutManagerProps {
  layout: EventLayout | null;
  loading?: boolean;
  onSave: (layout: Partial<EventLayout>) => void;
  onExport: (format: string) => void;
  onCreateZone: (zone: any) => void;
  onCreateStall: (stall: any) => void;
  onUpdateStall: (stallId: string, updates: any) => void;
  onDeleteStall: (stallId: string) => void;
}

export function LayoutManager({
  layout,
  loading = false,
  onSave,
  onExport,
  onCreateZone,
  onCreateStall,
  onUpdateStall,
  onDeleteStall
}: LayoutManagerProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'zones' | 'stalls' | 'settings'>('editor');
  const [showZoneManager, setShowZoneManager] = useState(false);
  const [showStallManager, setShowStallManager] = useState(false);
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null);

  const handleLayoutTypeChange = useCallback((layoutType: LayoutType) => {
    if (layout) {
      onSave({ layoutType });
    }
  }, [layout, onSave]);

  const handleGridConfigChange = useCallback((config: any) => {
    if (layout) {
      onSave(config);
    }
  }, [layout, onSave]);

  const handleImageConfigChange = useCallback((config: any) => {
    if (layout) {
      onSave(config);
    }
  }, [layout, onSave]);

  const handleStallClick = useCallback((stall: Stall) => {
    setSelectedStall(stall);
    setShowStallManager(true);
  }, []);

  const handleStallUpdate = useCallback((stallId: string, updates: any) => {
    onUpdateStall(stallId, updates);
    setShowStallManager(false);
    setSelectedStall(null);
  }, [onUpdateStall]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading layout...</p>
        </div>
      </div>
    );
  }

  if (!layout) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Grid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No layout configured</h3>
          <p className="text-gray-600 mb-6">Create a layout to start managing your event space</p>
          <button
            onClick={() => onCreateZone({})}
            className="bg-brand-green text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-green/90 transition-colors"
          >
            Create Layout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{layout.name}</h1>
              <p className="text-gray-600 mt-1">{layout.description}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => onExport('pdf')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
              <button
                onClick={() => onSave({})}
                className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Layout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Layout Type Selector */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Layout Type:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleLayoutTypeChange('GRID')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  layout.layoutType === 'GRID'
                    ? 'bg-brand-green text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Grid className="w-4 h-4" />
                Grid Layout
              </button>
              <button
                onClick={() => handleLayoutTypeChange('IMAGE_OVERLAY')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  layout.layoutType === 'IMAGE_OVERLAY'
                    ? 'bg-brand-green text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Image className="w-4 h-4" />
                Image Overlay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {[
              { id: 'editor', label: 'Layout Editor', icon: Grid },
              { id: 'zones', label: 'Zones', icon: Settings },
              { id: 'stalls', label: 'Stalls', icon: Plus },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-brand-green text-brand-green'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'editor' && (
          <div className="bg-white rounded-lg shadow-md border">
            {layout.layoutType === 'GRID' ? (
              <GridLayoutEditor
                layout={layout}
                onGridConfigChange={handleGridConfigChange}
                onStallClick={handleStallClick}
              />
            ) : (
              <ImageOverlayEditor
                layout={layout}
                onImageConfigChange={handleImageConfigChange}
                onStallClick={handleStallClick}
              />
            )}
          </div>
        )}

        {activeTab === 'zones' && (
          <div className="bg-white rounded-lg shadow-md border">
            <ZoneManager
              zones={layout.zones || []}
              onCreateZone={onCreateZone}
              onUpdateZone={(zoneId, updates) => {
                // TODO: Implement zone update
                console.log('Update zone:', zoneId, updates);
              }}
              onDeleteZone={(zoneId) => {
                // TODO: Implement zone delete
                console.log('Delete zone:', zoneId);
              }}
            />
          </div>
        )}

        {activeTab === 'stalls' && (
          <div className="bg-white rounded-lg shadow-md border">
            <StallManager
              stalls={layout.stalls || []}
              zones={layout.zones || []}
              onCreateStall={onCreateStall}
              onUpdateStall={onUpdateStall}
              onDeleteStall={onDeleteStall}
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-md border">
            <LayoutSettings
              layout={layout}
              onUpdateSettings={onSave}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {showZoneManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Create New Zone</h3>
            {/* Zone creation form would go here */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowZoneManager(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onCreateZone({});
                  setShowZoneManager(false);
                }}
                className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90"
              >
                Create Zone
              </button>
            </div>
          </div>
        </div>
      )}

      {showStallManager && selectedStall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Stall {selectedStall.number}</h3>
            {/* Stall editing form would go here */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowStallManager(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStallUpdate(selectedStall.id, {})}
                className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
