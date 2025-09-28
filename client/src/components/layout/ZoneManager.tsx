import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import type { Zone } from '@/lib/api/layout';
import { ZONE_COLORS } from '@/lib/api/layout';

interface ZoneManagerProps {
  zones: Zone[];
  onCreateZone: (zone: any) => void;
  onUpdateZone: (zoneId: string, updates: any) => void;
  onDeleteZone: (zoneId: string) => void;
}

export function ZoneManager({ zones, onCreateZone, onUpdateZone, onDeleteZone }: ZoneManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);

  const handleCreateZone = () => {
    setShowCreateForm(true);
  };

  const handleEditZone = (zone: Zone) => {
    setEditingZone(zone);
  };

  const handleDeleteZone = (zone: Zone) => {
    if (confirm(`Are you sure you want to delete "${zone.name}"? This will also delete all stalls in this zone.`)) {
      onDeleteZone(zone.id);
    }
  };

  const getZoneStats = (zone: Zone) => {
    // Mock stats - in real implementation, calculate from stalls
    return {
      totalStalls: 24,
      availableStalls: 18,
      reservedStalls: 4,
      soldStalls: 2,
      revenue: zone.basePrice * 2,
    };
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Zones</h2>
          <p className="text-gray-600">Manage pricing zones and their configurations</p>
        </div>
        
        <button
          onClick={handleCreateZone}
          className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Zone
        </button>
      </div>

      {/* Zones Grid */}
      {zones.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No zones created</h3>
          <p className="text-gray-600 mb-6">Create your first zone to start organizing your layout</p>
          <button
            onClick={handleCreateZone}
            className="bg-brand-green text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-green/90 transition-colors"
          >
            Create First Zone
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zones.map((zone) => {
            const stats = getZoneStats(zone);
            return (
              <div key={zone.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                {/* Zone Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: zone.color }}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                      {zone.numberingPrefix && (
                        <p className="text-sm text-gray-500">Prefix: {zone.numberingPrefix}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditZone(zone)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit zone"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteZone(zone)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete zone"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Zone Description */}
                {zone.description && (
                  <p className="text-sm text-gray-600 mb-4">{zone.description}</p>
                )}

                {/* Pricing */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Base Price</span>
                    <span className="text-lg font-semibold text-gray-900">${zone.basePrice}</span>
                  </div>
                  <div className="text-xs text-gray-500">Per {zone.priceUnit}</div>
                </div>

                {/* Grid Position */}
                {zone.startRow && zone.endRow && zone.startColumn && zone.endColumn && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-2">Grid Position</div>
                    <div className="text-sm text-gray-600">
                      Rows: {zone.startRow}-{zone.endRow} | Columns: {zone.startColumn}-{zone.endColumn}
                    </div>
                  </div>
                )}

                {/* Features */}
                {zone.features.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Features</div>
                    <div className="flex flex-wrap gap-1">
                      {zone.features.map((feature) => (
                        <span
                          key={feature}
                          className="px-2 py-1 bg-brand-green/10 text-brand-green text-xs rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Total Stalls</div>
                      <div className="font-semibold text-gray-900">{stats.totalStalls}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Available</div>
                      <div className="font-semibold text-green-600">{stats.availableStalls}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Reserved</div>
                      <div className="font-semibold text-yellow-600">{stats.reservedStalls}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Sold</div>
                      <div className="font-semibold text-red-600">{stats.soldStalls}</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Revenue</span>
                      <span className="font-semibold text-gray-900">${stats.revenue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="mt-4 flex items-center justify-between">
                  <div className={`flex items-center gap-2 ${
                    zone.isActive ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {zone.isActive ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">
                      {zone.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {zone.autoNumbering && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                      Auto-numbering
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Zone Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Create New Zone</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              // TODO: Implement form submission
              onCreateZone({});
              setShowCreateForm(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zone Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    placeholder="e.g., Zone A - Food Court"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    placeholder="Describe this zone..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Unit
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green" aria-label="Price unit">
                      <option value="stall">Per Stall</option>
                      <option value="sqft">Per Sq Ft</option>
                      <option value="per_day">Per Day</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zone Color
                  </label>
                  <div className="flex gap-2">
                    {ZONE_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400"
                        title={`Select ${color} color`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90"
                >
                  Create Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Zone Modal */}
      {editingZone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Zone: {editingZone.name}</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              // TODO: Implement form submission
              onUpdateZone(editingZone.id, {});
              setEditingZone(null);
            }}>
              {/* Similar form fields as create zone */}
              <div className="text-center py-8 text-gray-500">
                Edit form would go here...
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingZone(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
