import React, { useState } from 'react';
import { Plus, Clock, AlertTriangle, CheckCircle, X, Edit, Trash2 } from 'lucide-react';
import type { Hold, HoldType, HoldStatus } from '@/lib/api/inventory';
import { HOLD_STATUS_COLORS, HOLD_TYPE_COLORS, getHoldExpiryStatus } from '@/lib/api/inventory';

interface HoldManagerProps {
  holds: Hold[];
  loading?: boolean;
  onCreateHold: (hold: any) => void;
  onUpdateHold: (holdId: string, updates: any) => void;
  onReleaseHold: (holdId: string) => void;
  onDeleteHold: (holdId: string) => void;
}

export function HoldManager({
  holds,
  loading = false,
  onCreateHold,
  onUpdateHold,
  onReleaseHold,
  onDeleteHold
}: HoldManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingHold, setEditingHold] = useState<Hold | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredHolds = holds.filter(hold => {
    const matchesStatus = statusFilter === 'all' || hold.status === statusFilter;
    const matchesType = typeFilter === 'all' || hold.holdType === typeFilter;
    return matchesStatus && matchesType;
  });

  const getHoldStats = () => {
    const stats = {
      total: holds.length,
      active: holds.filter(h => h.status === 'ACTIVE').length,
      expired: holds.filter(h => h.status === 'EXPIRED').length,
      released: holds.filter(h => h.status === 'RELEASED').length,
      expiringSoon: holds.filter(h => {
        if (h.status !== 'ACTIVE') return false;
        return getHoldExpiryStatus(h.expiresAt) === 'expiring-soon';
      }).length,
    };
    return stats;
  };

  const stats = getHoldStats();

  const handleCreateHold = () => {
    setShowCreateForm(true);
  };

  const handleEditHold = (hold: Hold) => {
    setEditingHold(hold);
  };

  const handleReleaseHold = (hold: Hold) => {
    if (confirm(`Are you sure you want to release the hold on stall ${hold.stall?.number}?`)) {
      onReleaseHold(hold.id);
    }
  };

  const handleDeleteHold = (hold: Hold) => {
    if (confirm(`Are you sure you want to delete this hold? This action cannot be undone.`)) {
      onDeleteHold(hold.id);
    }
  };

  const getExpiryBadge = (expiresAt: string) => {
    const status = getHoldExpiryStatus(expiresAt);
    const colors = {
      expired: 'bg-red-100 text-red-600',
      'expiring-soon': 'bg-yellow-100 text-yellow-600',
      active: 'bg-green-100 text-green-600',
    };
    
    return (
      <span className={`inline-block px-2 py-1 text-xs rounded-full ${colors[status]}`}>
        {status === 'expired' ? 'Expired' :
         status === 'expiring-soon' ? 'Expiring Soon' :
         'Active'}
      </span>
    );
  };

  const formatExpiryTime = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffHours = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 0) return 'Expired';
    if (diffHours < 24) return `${diffHours}h remaining`;
    const diffDays = Math.ceil(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-md border animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Hold Management</h2>
          <p className="text-gray-600">Manage temporary and manual holds on stalls</p>
        </div>
        
        <button
          onClick={handleCreateHold}
          className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Hold
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Holds', count: stats.total, color: 'gray' },
          { label: 'Active', count: stats.active, color: 'green' },
          { label: 'Expiring Soon', count: stats.expiringSoon, color: 'yellow' },
          { label: 'Expired', count: stats.expired, color: 'red' },
          { label: 'Released', count: stats.released, color: 'blue' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className={`text-2xl font-bold ${
              stat.color === 'green' ? 'text-green-600' :
              stat.color === 'yellow' ? 'text-yellow-600' :
              stat.color === 'red' ? 'text-red-600' :
              stat.color === 'blue' ? 'text-blue-600' :
              'text-gray-600'
            }`}>
              {stat.count}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="RELEASED">Released</option>
            <option value="CONVERTED">Converted</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Type:</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
            aria-label="Filter by type"
          >
            <option value="all">All Types</option>
            <option value="TEMPORARY">Temporary</option>
            <option value="MANUAL">Manual</option>
            <option value="PAYMENT">Payment</option>
            <option value="REVIEW">Review</option>
          </select>
        </div>
      </div>

      {/* Holds List */}
      {filteredHolds.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No holds found</h3>
          <p className="text-gray-600">
            {holds.length === 0 
              ? 'No holds have been placed yet'
              : 'Try adjusting your filters to see more holds'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHolds.map((hold) => (
            <div key={hold.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      Stall {hold.stall?.number}
                    </h3>
                    <span
                      className="inline-block px-2 py-1 text-xs rounded-full font-medium"
                      style={{ 
                        backgroundColor: HOLD_STATUS_COLORS[hold.status] + '20',
                        color: HOLD_STATUS_COLORS[hold.status]
                      }}
                    >
                      {hold.status.replace('_', ' ')}
                    </span>
                    <span
                      className="inline-block px-2 py-1 text-xs rounded-full font-medium"
                      style={{ 
                        backgroundColor: HOLD_TYPE_COLORS[hold.holdType] + '20',
                        color: HOLD_TYPE_COLORS[hold.holdType]
                      }}
                    >
                      {hold.holdType}
                    </span>
                    {getExpiryBadge(hold.expiresAt)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Customer</div>
                      <div className="text-sm text-gray-900">{hold.user?.name}</div>
                      <div className="text-xs text-gray-500">{hold.user?.email}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-700">Zone</div>
                      <div className="flex items-center gap-2">
                        {hold.stall?.zone && (
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: hold.stall.zone.color }}
                          />
                        )}
                        <div className="text-sm text-gray-900">{hold.stall?.zone?.name}</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-700">Expires</div>
                      <div className="text-sm text-gray-900">{formatExpiryTime(hold.expiresAt)}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(hold.expiresAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {hold.reason && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700">Reason</div>
                      <div className="text-sm text-gray-900">{hold.reason}</div>
                    </div>
                  )}
                  
                  {hold.notes && (
                    <div>
                      <div className="text-sm font-medium text-gray-700">Notes</div>
                      <div className="text-sm text-gray-900">{hold.notes}</div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {hold.status === 'ACTIVE' && (
                    <>
                      <button
                        onClick={() => handleEditHold(hold)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit hold"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleReleaseHold(hold)}
                        className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                        title="Release hold"
                      >
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDeleteHold(hold)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete hold"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Hold Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Create New Hold</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              // TODO: Implement form submission
              onCreateHold({});
              setShowCreateForm(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stall
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    required
                    aria-label="Select stall"
                  >
                    <option value="">Select a stall</option>
                    <option value="stall_a1">A1 - Zone A</option>
                    <option value="stall_a2">A2 - Zone A</option>
                    <option value="stall_b1">B1 - Zone B</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    required
                    aria-label="Select customer"
                  >
                    <option value="">Select a customer</option>
                    <option value="user_1">Sarah Johnson</option>
                    <option value="user_2">Mike Wilson</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hold Type
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    required
                    aria-label="Select hold type"
                  >
                    <option value="TEMPORARY">Temporary</option>
                    <option value="MANUAL">Manual</option>
                    <option value="PAYMENT">Payment</option>
                    <option value="REVIEW">Review</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expires At
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    required
                    aria-label="Hold expiration date and time"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    placeholder="Reason for hold"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    placeholder="Additional notes"
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
                  Create Hold
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Hold Modal */}
      {editingHold && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Hold: {editingHold.stall?.number}</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              // TODO: Implement form submission
              onUpdateHold(editingHold.id, {});
              setEditingHold(null);
            }}>
              {/* Similar form fields as create hold */}
              <div className="text-center py-8 text-gray-500">
                Edit form would go here...
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingHold(null)}
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
