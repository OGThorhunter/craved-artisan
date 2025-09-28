import React, { useState } from 'react';
import { Play, Pause, CheckCircle, X, AlertTriangle, RefreshCw } from 'lucide-react';
import type { BulkOperation, BulkOperationType, OperationStatus } from '@/lib/api/inventory';
import { OPERATION_STATUS_COLORS, getOperationProgress } from '@/lib/api/inventory';

interface BulkOperationsManagerProps {
  operations: BulkOperation[];
  loading?: boolean;
  onStartOperation: (operation: any) => void;
  onCancelOperation: (operationId: string) => void;
  onRetryOperation: (operationId: string) => void;
}

export function BulkOperationsManager({
  operations,
  loading = false,
  onStartOperation,
  onCancelOperation,
  onRetryOperation
}: BulkOperationsManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredOperations = operations.filter(operation => {
    const matchesStatus = statusFilter === 'all' || operation.status === statusFilter;
    const matchesType = typeFilter === 'all' || operation.operationType === typeFilter;
    return matchesStatus && matchesType;
  });

  const getOperationStats = () => {
    const stats = {
      total: operations.length,
      pending: operations.filter(o => o.status === 'PENDING').length,
      running: operations.filter(o => o.status === 'RUNNING').length,
      completed: operations.filter(o => o.status === 'COMPLETED').length,
      failed: operations.filter(o => o.status === 'FAILED').length,
    };
    return stats;
  };

  const stats = getOperationStats();

  const handleStartOperation = () => {
    setShowCreateForm(true);
  };

  const handleCancelOperation = (operation: BulkOperation) => {
    if (confirm(`Are you sure you want to cancel this operation? This may leave some items in an inconsistent state.`)) {
      onCancelOperation(operation.id);
    }
  };

  const handleRetryOperation = (operation: BulkOperation) => {
    if (confirm(`Are you sure you want to retry this failed operation?`)) {
      onRetryOperation(operation.id);
    }
  };

  const getStatusIcon = (status: OperationStatus) => {
    switch (status) {
      case 'PENDING':
        return <Pause className="w-4 h-4 text-yellow-600" />;
      case 'RUNNING':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'FAILED':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'CANCELLED':
        return <X className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const formatOperationType = (type: BulkOperationType) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const formatDuration = (startedAt: string, completedAt?: string) => {
    const start = new Date(startedAt);
    const end = completedAt ? new Date(completedAt) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return '< 1 min';
    if (diffMins < 60) return `${diffMins} min`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
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
          <h2 className="text-xl font-semibold text-gray-900">Bulk Operations</h2>
          <p className="text-gray-600">Manage bulk operations on stalls, zones, and assignments</p>
        </div>
        
        <button
          onClick={handleStartOperation}
          className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors"
        >
          <Play className="w-4 h-4" />
          Start Operation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', count: stats.total, color: 'gray' },
          { label: 'Pending', count: stats.pending, color: 'yellow' },
          { label: 'Running', count: stats.running, color: 'blue' },
          { label: 'Completed', count: stats.completed, color: 'green' },
          { label: 'Failed', count: stats.failed, color: 'red' },
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
            <option value="PENDING">Pending</option>
            <option value="RUNNING">Running</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
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
            <option value="PRICE_UPDATE">Price Update</option>
            <option value="STATUS_CHANGE">Status Change</option>
            <option value="ZONE_ASSIGNMENT">Zone Assignment</option>
            <option value="HOLD_PLACEMENT">Hold Placement</option>
            <option value="HOLD_RELEASE">Hold Release</option>
          </select>
        </div>
      </div>

      {/* Operations List */}
      {filteredOperations.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No operations found</h3>
          <p className="text-gray-600">
            {operations.length === 0 
              ? 'No bulk operations have been performed yet'
              : 'Try adjusting your filters to see more operations'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOperations.map((operation) => (
            <div key={operation.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{operation.description}</h3>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(operation.status)}
                      <span
                        className="inline-block px-2 py-1 text-xs rounded-full font-medium"
                        style={{ 
                          backgroundColor: OPERATION_STATUS_COLORS[operation.status] + '20',
                          color: OPERATION_STATUS_COLORS[operation.status]
                        }}
                      >
                        {operation.status}
                      </span>
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                        {formatOperationType(operation.operationType)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Targets</div>
                      <div className="text-sm text-gray-900">{operation.totalCount} items</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-700">Success</div>
                      <div className="text-sm text-green-600">{operation.successCount}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-700">Failed</div>
                      <div className="text-sm text-red-600">{operation.failureCount}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-700">Duration</div>
                      <div className="text-sm text-gray-900">
                        {formatDuration(operation.startedAt, operation.completedAt)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  {(operation.status === 'RUNNING' || operation.status === 'COMPLETED') && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{getOperationProgress(operation)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-brand-green h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getOperationProgress(operation)}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {operation.errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-sm font-medium text-red-800">Error:</div>
                      <div className="text-sm text-red-700">{operation.errorMessage}</div>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Started: {new Date(operation.startedAt).toLocaleString()}
                    {operation.completedAt && (
                      <span> • Completed: {new Date(operation.completedAt).toLocaleString()}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {operation.status === 'PENDING' && (
                    <button
                      onClick={() => onStartOperation(operation)}
                      className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                      title="Start operation"
                    >
                      <Play className="w-4 h-4 text-green-600" />
                    </button>
                  )}
                  
                  {(operation.status === 'PENDING' || operation.status === 'RUNNING') && (
                    <button
                      onClick={() => handleCancelOperation(operation)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Cancel operation"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  )}
                  
                  {operation.status === 'FAILED' && (
                    <button
                      onClick={() => handleRetryOperation(operation)}
                      className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Retry operation"
                    >
                      <RefreshCw className="w-4 h-4 text-blue-600" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Operation Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Start Bulk Operation</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              // TODO: Implement form submission
              onStartOperation({});
              setShowCreateForm(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operation Type
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    required
                    aria-label="Select operation type"
                  >
                    <option value="">Select operation type</option>
                    <option value="PRICE_UPDATE">Price Update</option>
                    <option value="STATUS_CHANGE">Status Change</option>
                    <option value="ZONE_ASSIGNMENT">Zone Assignment</option>
                    <option value="HOLD_PLACEMENT">Hold Placement</option>
                    <option value="HOLD_RELEASE">Hold Release</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    placeholder="Describe this operation"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Items
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    placeholder="Enter item IDs (one per line)"
                    required
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
                  Start Operation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
