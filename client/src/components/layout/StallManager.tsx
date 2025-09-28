import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, DollarSign, MapPin } from 'lucide-react';
import type { Stall, Zone } from '@/lib/api/layout';
import { STALL_STATUS_COLORS, STALL_TYPE_ICONS } from '@/lib/api/layout';

interface StallManagerProps {
  stalls: Stall[];
  zones: Zone[];
  onCreateStall: (stall: any) => void;
  onUpdateStall: (stallId: string, updates: any) => void;
  onDeleteStall: (stallId: string) => void;
}

export function StallManager({ stalls, zones, onCreateStall, onUpdateStall, onDeleteStall }: StallManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingStall, setEditingStall] = useState<Stall | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');

  const filteredStalls = stalls.filter(stall => {
    const matchesStatus = statusFilter === 'all' || stall.status === statusFilter;
    const matchesZone = zoneFilter === 'all' || stall.zoneId === zoneFilter;
    return matchesStatus && matchesZone;
  });

  const getZoneName = (zoneId?: string) => {
    if (!zoneId) return 'No Zone';
    const zone = zones.find(z => z.id === zoneId);
    return zone ? zone.name : 'Unknown Zone';
  };

  const getStatusCounts = () => {
    const counts = {
      total: stalls.length,
      available: stalls.filter(s => s.status === 'AVAILABLE').length,
      held: stalls.filter(s => s.status === 'HELD').length,
      reserved: stalls.filter(s => s.status === 'RESERVED').length,
      sold: stalls.filter(s => s.status === 'SOLD').length,
      checked_in: stalls.filter(s => s.status === 'CHECKED_IN').length,
      blocked: stalls.filter(s => s.status === 'BLOCKED').length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  const handleCreateStall = () => {
    setShowCreateForm(true);
  };

  const handleEditStall = (stall: Stall) => {
    setEditingStall(stall);
  };

  const handleDeleteStall = (stall: Stall) => {
    if (confirm(`Are you sure you want to delete stall "${stall.number}"?`)) {
      onDeleteStall(stall.id);
    }
  };

  const handleStatusChange = (stall: Stall, newStatus: string) => {
    onUpdateStall(stall.id, { status: newStatus });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Stalls</h2>
          <p className="text-gray-600">Manage individual stalls and their assignments</p>
        </div>
        
        <button
          onClick={handleCreateStall}
          className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Stall
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        {[
          { label: 'Total', count: statusCounts.total, color: 'gray' },
          { label: 'Available', count: statusCounts.available, color: 'green' },
          { label: 'Held', count: statusCounts.held, color: 'yellow' },
          { label: 'Reserved', count: statusCounts.reserved, color: 'blue' },
          { label: 'Sold', count: statusCounts.sold, color: 'red' },
          { label: 'Checked In', count: statusCounts.checked_in, color: 'purple' },
          { label: 'Blocked', count: statusCounts.blocked, color: 'gray' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.count}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="HELD">Held</option>
            <option value="RESERVED">Reserved</option>
            <option value="SOLD">Sold</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Zone:</label>
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
            aria-label="Filter by zone"
          >
            <option value="all">All Zones</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>{zone.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stalls Table */}
      {filteredStalls.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No stalls found</h3>
          <p className="text-gray-600 mb-6">
            {stalls.length === 0 
              ? 'Create your first stall to start building your layout'
              : 'Try adjusting your filters to see more stalls'
            }
          </p>
          {stalls.length === 0 && (
            <button
              onClick={handleCreateStall}
              className="bg-brand-green text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-green/90 transition-colors"
            >
              Create First Stall
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stall
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Features
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStalls.map((stall) => (
                  <tr key={stall.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{STALL_TYPE_ICONS[stall.stallType]}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{stall.number}</div>
                          {stall.customLabel && (
                            <div className="text-sm text-gray-500">{stall.customLabel}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {stall.zone && (
                          <div
                            className="w-3 h-3 rounded mr-2"
                            style={{ backgroundColor: stall.zone.color }}
                          />
                        )}
                        <span className="text-sm text-gray-900">{getZoneName(stall.zoneId)}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-4 h-4 mr-1" />
                        {stall.row && stall.column ? `${stall.row}-${stall.column}` : 'N/A'}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">
                        {stall.stallType.toLowerCase().replace('_', ' ')}
                      </span>
                      {stall.size && (
                        <div className="text-xs text-gray-500">{stall.size}</div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {stall.totalPrice.toFixed(2)}
                        {stall.priceOverride && (
                          <span className="text-xs text-gray-500 ml-1">(override)</span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={stall.status}
                        onChange={(e) => handleStatusChange(stall, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-brand-green`}
                        style={{ 
                          backgroundColor: STALL_STATUS_COLORS[stall.status] + '20',
                          color: STALL_STATUS_COLORS[stall.status]
                        }}
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="HELD">Held</option>
                        <option value="RESERVED">Reserved</option>
                        <option value="SOLD">Sold</option>
                        <option value="CHECKED_IN">Checked In</option>
                        <option value="BLOCKED">Blocked</option>
                      </select>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {stall.features.slice(0, 2).map((feature) => (
                          <span
                            key={feature}
                            className="px-2 py-1 bg-brand-green/10 text-brand-green text-xs rounded"
                          >
                            {feature}
                          </span>
                        ))}
                        {stall.features.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{stall.features.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditStall(stall)}
                          className="text-brand-green hover:text-brand-green/80"
                          title="Edit stall"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStall(stall)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete stall"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Stall Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Create New Stall</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              // TODO: Implement form submission
              onCreateStall({});
              setShowCreateForm(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stall Number
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    placeholder="e.g., A1, B12"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zone
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green" aria-label="Select zone">
                    <option value="">Select Zone</option>
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>{zone.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Row
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      placeholder="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Column
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      placeholder="1"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stall Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green" aria-label="Select stall type">
                    <option value="STALL">Standard Stall</option>
                    <option value="CORNER_STALL">Corner Stall</option>
                    <option value="FOOD_TRUCK">Food Truck Pad</option>
                    <option value="TABLE_SEAT">Table Seat</option>
                    <option value="VIP_SEAT">VIP Seat</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    placeholder="0.00"
                  />
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
                  Create Stall
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Stall Modal */}
      {editingStall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Stall: {editingStall.number}</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              // TODO: Implement form submission
              onUpdateStall(editingStall.id, {});
              setEditingStall(null);
            }}>
              {/* Similar form fields as create stall */}
              <div className="text-center py-8 text-gray-500">
                Edit form would go here...
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingStall(null)}
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
