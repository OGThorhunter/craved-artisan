import React, { useState } from 'react';
import { Plus, Clock, CheckCircle, X, DollarSign, Users, TrendingUp, FileText } from 'lucide-react';
import type { Payout, PayoutType, PayoutStatus } from '@/lib/api/refunds-payouts';
import { formatCurrency, formatDate, getPayoutStats, PAYOUT_STATUS_COLORS } from '@/lib/api/refunds-payouts';

interface PayoutManagerProps {
  payouts: Payout[];
  loading?: boolean;
  onCreatePayout: (payout: any) => void;
  onApprovePayout: (payoutId: string) => void;
  onProcessPayout: (payoutId: string) => void;
  onRejectPayout: (payoutId: string, reason: string) => void;
}

export function PayoutManager({
  payouts,
  loading = false,
  onCreatePayout,
  onApprovePayout,
  onProcessPayout,
  onRejectPayout
}: PayoutManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredPayouts = payouts.filter(payout => {
    const matchesStatus = statusFilter === 'all' || payout.status === statusFilter;
    const matchesType = typeFilter === 'all' || payout.payoutType === typeFilter;
    return matchesStatus && matchesType;
  });

  const stats = getPayoutStats(payouts);

  const handleCreatePayout = () => {
    setShowCreateForm(true);
  };

  const handleApprovePayout = (payout: Payout) => {
    if (confirm(`Are you sure you want to approve this payout of ${formatCurrency(payout.netAmount)} to ${payout.vendor?.name}?`)) {
      onApprovePayout(payout.id);
    }
  };

  const handleProcessPayout = (payout: Payout) => {
    if (confirm(`Are you sure you want to process this payout of ${formatCurrency(payout.netAmount)}?`)) {
      onProcessPayout(payout.id);
    }
  };

  const handleRejectPayout = (payout: Payout) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      onRejectPayout(payout.id, reason);
    }
  };

  const getStatusBadge = (status: string, colors: Record<string, string>) => {
    return (
      <span
        className="inline-block px-2 py-1 text-xs rounded-full font-medium"
        style={{ 
          backgroundColor: colors[status] + '20',
          color: colors[status]
        }}
      >
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getPayoutTypeIcon = (type: PayoutType) => {
    const icons = {
      REVENUE_SHARE: '💰',
      COMMISSION: '📊',
      FIXED_FEE: '💵',
      BONUS: '🎁',
      ADJUSTMENT: '⚖️',
    };
    return icons[type] || '💰';
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
          <h2 className="text-xl font-semibold text-gray-900">Payout Management</h2>
          <p className="text-gray-600">Process vendor payouts and manage revenue sharing</p>
        </div>
        
        <button
          onClick={handleCreatePayout}
          className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Payout
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: 'Total', count: stats.total, color: 'gray' },
          { label: 'Pending', count: stats.pending, color: 'yellow' },
          { label: 'Approved', count: stats.approved, color: 'green' },
          { label: 'Completed', count: stats.completed, color: 'blue' },
          { label: 'Failed', count: stats.failed, color: 'red' },
          { label: 'Total Amount', count: formatCurrency(stats.totalAmount), color: 'purple', isCurrency: true },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className={`text-2xl font-bold ${
              stat.isCurrency ? 'text-purple-600' :
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
            <option value="APPROVED">Approved</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REJECTED">Rejected</option>
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
            <option value="REVENUE_SHARE">Revenue Share</option>
            <option value="COMMISSION">Commission</option>
            <option value="FIXED_FEE">Fixed Fee</option>
            <option value="BONUS">Bonus</option>
            <option value="ADJUSTMENT">Adjustment</option>
          </select>
        </div>
      </div>

      {/* Payouts List */}
      {filteredPayouts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No payouts found</h3>
          <p className="text-gray-600">
            {payouts.length === 0 
              ? 'No payouts have been created yet'
              : 'Try adjusting your filters to see more payouts'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayouts.map((payout) => (
            <div key={payout.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">
                      {getPayoutTypeIcon(payout.payoutType)}
                    </span>
                    <h3 className="font-semibold text-gray-900">
                      {payout.vendor?.name || 'Unknown Vendor'}
                    </h3>
                    {getStatusBadge(payout.status, PAYOUT_STATUS_COLORS)}
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                      {payout.payoutType.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Net Amount</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(payout.netAmount)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-700">Gross Amount</div>
                      <div className="text-sm text-gray-900">
                        {formatCurrency(payout.grossAmount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Platform: {formatCurrency(payout.platformFee)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-700">Period</div>
                      <div className="text-sm text-gray-900">
                        {formatDate(payout.periodStart)} - {formatDate(payout.periodEnd)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-700">Payment Method</div>
                      <div className="text-sm text-gray-900">
                        {payout.paymentMethod.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                  
                  {/* Breakdown */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-2">Fee Breakdown</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Processing Fee:</span>
                        <span className="ml-2 font-medium">{formatCurrency(payout.processingFee)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Tax Withheld:</span>
                        <span className="ml-2 font-medium">{formatCurrency(payout.taxWithheld)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Platform Fee:</span>
                        <span className="ml-2 font-medium">{formatCurrency(payout.platformFee)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Net Payout:</span>
                        <span className="ml-2 font-medium text-green-600">{formatCurrency(payout.netAmount)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {payout.notes && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700">Notes</div>
                      <div className="text-sm text-gray-900">{payout.notes}</div>
                    </div>
                  )}
                  
                  {payout.vendorNotes && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm font-medium text-blue-800">Vendor Notes</div>
                      <div className="text-sm text-blue-700">{payout.vendorNotes}</div>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 mt-3">
                    Created: {formatDate(payout.createdAt)}
                    {payout.processedAt && (
                      <span> • Processed: {formatDate(payout.processedAt)}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {payout.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleApprovePayout(payout)}
                        className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                        title="Approve payout"
                      >
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </button>
                      <button
                        onClick={() => handleRejectPayout(payout)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Reject payout"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </>
                  )}
                  
                  {payout.status === 'APPROVED' && (
                    <button
                      onClick={() => handleProcessPayout(payout)}
                      className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Process payout"
                    >
                      <DollarSign className="w-4 h-4 text-blue-600" />
                    </button>
                  )}
                  
                  {payout.status === 'PROCESSING' && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-blue-600">Processing...</span>
                    </div>
                  )}
                  
                  {payout.status === 'COMPLETED' && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-600">Completed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Payout Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create Payout</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const payoutData = {
                eventId: 'evt_1', // TODO: Get from context
                vendorId: formData.get('vendorId'),
                payoutType: formData.get('payoutType'),
                periodStart: formData.get('periodStart'),
                periodEnd: formData.get('periodEnd'),
                paymentMethod: formData.get('paymentMethod'),
                bankAccount: formData.get('bankAccount'),
                notes: formData.get('notes'),
              };
              onCreatePayout(payoutData);
              setShowCreateForm(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor ID
                  </label>
                  <input
                    type="text"
                    name="vendorId"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    placeholder="Enter vendor ID"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payout Type
                  </label>
                  <select
                    name="payoutType"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    required
                    aria-label="Select payout type"
                  >
                    <option value="REVENUE_SHARE">Revenue Share</option>
                    <option value="COMMISSION">Commission</option>
                    <option value="FIXED_FEE">Fixed Fee</option>
                    <option value="BONUS">Bonus</option>
                    <option value="ADJUSTMENT">Adjustment</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Period Start
                    </label>
                    <input
                      type="date"
                      name="periodStart"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      required
                      aria-label="Period start date"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Period End
                    </label>
                    <input
                      type="date"
                      name="periodEnd"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      required
                      aria-label="Period end date"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    name="paymentMethod"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    required
                    aria-label="Select payment method"
                  >
                    <option value="STRIPE_CONNECT">Stripe Connect</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="PAYPAL">PayPal</option>
                    <option value="CHECK">Check</option>
                    <option value="WIRE_TRANSFER">Wire Transfer</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Account (if applicable)
                  </label>
                  <input
                    type="text"
                    name="bankAccount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    placeholder="Bank account details"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    placeholder="Internal notes about this payout"
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
                  Create Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
