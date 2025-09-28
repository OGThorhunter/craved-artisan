import React, { useState } from 'react';
import { Plus, Calendar, Clock, Users, DollarSign, Edit, Trash2, Play, Pause } from 'lucide-react';
import type { SalesWindow } from '@/lib/api/sales';
import { formatDate, getSalesWindowStatus, formatCurrency } from '@/lib/api/sales';

interface SalesWindowsManagerProps {
  windows: SalesWindow[];
  loading?: boolean;
  onCreateWindow: (window: any) => void;
  onUpdateWindow: (windowId: string, updates: any) => void;
  onDeleteWindow: (windowId: string) => void;
  onOpenWindow: (windowId: string) => void;
  onCloseWindow: (windowId: string) => void;
}

export function SalesWindowsManager({
  windows,
  loading = false,
  onCreateWindow,
  onUpdateWindow,
  onDeleteWindow,
  onOpenWindow,
  onCloseWindow
}: SalesWindowsManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingWindow, setEditingWindow] = useState<SalesWindow | null>(null);

  const handleCreateWindow = () => {
    setShowCreateForm(true);
  };

  const handleEditWindow = (window: SalesWindow) => {
    setEditingWindow(window);
  };

  const handleDeleteWindow = (window: SalesWindow) => {
    if (confirm(`Are you sure you want to delete "${window.name}"? This will also delete all associated orders and waitlist entries.`)) {
      onDeleteWindow(window.id);
    }
  };

  const getStatusBadge = (window: SalesWindow) => {
    const status = getSalesWindowStatus(window);
    const colors = {
      upcoming: 'bg-blue-100 text-blue-600',
      open: 'bg-green-100 text-green-600',
      closed: 'bg-gray-100 text-gray-600',
    };
    
    return (
      <span className={`inline-block px-2 py-1 text-xs rounded-full ${colors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTimeRemaining = (window: SalesWindow) => {
    const status = getSalesWindowStatus(window);
    const now = new Date();
    
    if (status === 'upcoming') {
      const opensAt = new Date(window.opensAt);
      const diff = opensAt.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return `Opens in ${days} day${days !== 1 ? 's' : ''}`;
    } else if (status === 'open') {
      const closesAt = new Date(window.closesAt);
      const diff = closesAt.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return `${days} day${days !== 1 ? 's' : ''} remaining`;
    }
    return 'Closed';
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
          <h2 className="text-xl font-semibold text-gray-900">Sales Windows</h2>
          <p className="text-gray-600">Manage when stalls go on sale and pricing rules</p>
        </div>
        
        <button
          onClick={handleCreateWindow}
          className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Sales Window
        </button>
      </div>

      {/* Sales Windows Grid */}
      {windows.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No sales windows</h3>
          <p className="text-gray-600 mb-6">Create your first sales window to start selling stalls</p>
          <button
            onClick={handleCreateWindow}
            className="bg-brand-green text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-green/90 transition-colors"
          >
            Create Sales Window
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {windows.map((window) => (
            <div key={window.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900">{window.name}</h3>
                  {getStatusBadge(window)}
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditWindow(window)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit window"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  {window.isActive ? (
                    <button
                      onClick={() => onCloseWindow(window.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Close window"
                    >
                      <Pause className="w-4 h-4 text-red-600" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenWindow(window.id)}
                      className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                      title="Open window"
                    >
                      <Play className="w-4 h-4 text-green-600" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteWindow(window)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete window"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {window.description && (
                <p className="text-sm text-gray-600 mb-4">{window.description}</p>
              )}

              {/* Timing */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Opens:</span>
                  <span className="text-gray-900">{formatDate(window.opensAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Closes:</span>
                  <span className="text-gray-900">{formatDate(window.closesAt)}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {getTimeRemaining(window)}
                </div>
              </div>

              {/* Pricing Rules */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-2">Pricing Rules</div>
                <div className="space-y-1 text-sm">
                  {window.earlyBirdPrice && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Early Bird:</span>
                      <span className="text-green-600 font-medium">
                        {formatCurrency(window.earlyBirdPrice)}
                      </span>
                    </div>
                  )}
                  {window.lastMinutePrice && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Minute:</span>
                      <span className="text-red-600 font-medium">
                        {formatCurrency(window.lastMinutePrice)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Capacity & Limits */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {window.maxCapacity && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Capacity</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{window.maxCapacity}</div>
                  </div>
                )}
                {window.perCustomerLimit && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Per Customer</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{window.perCustomerLimit}</div>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Orders</div>
                    <div className="font-semibold text-gray-900">{window.orderCount || 0}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Waitlist</div>
                    <div className="font-semibold text-gray-900">{window.waitlistCount || 0}</div>
                  </div>
                </div>
              </div>

              {/* Auto-close indicator */}
              {window.autoClose && (
                <div className="mt-3 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Auto-closes when capacity reached
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Window Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create Sales Window</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              // TODO: Implement form submission
              onCreateWindow({});
              setShowCreateForm(false);
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Window Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      placeholder="e.g., Early Bird Sales"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      placeholder="Brief description"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opens At
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      required
                      aria-label="Opens at date and time"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Closes At
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      required
                      aria-label="Closes at date and time"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Capacity
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      placeholder="Leave empty for unlimited"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Per Customer Limit
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      placeholder="Max stalls per customer"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Early Bird Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Early Bird Ends
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      aria-label="Early bird pricing ends date and time"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Minute Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Minute Starts
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      aria-label="Last minute pricing starts date and time"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-brand-green border-gray-300 rounded focus:ring-brand-green"
                    />
                    <span className="text-sm text-gray-700">Auto-close when capacity reached</span>
                  </label>
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
                  Create Window
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Window Modal */}
      {editingWindow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Sales Window: {editingWindow.name}</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              // TODO: Implement form submission
              onUpdateWindow(editingWindow.id, {});
              setEditingWindow(null);
            }}>
              {/* Similar form fields as create window */}
              <div className="text-center py-8 text-gray-500">
                Edit form would go here...
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingWindow(null)}
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
