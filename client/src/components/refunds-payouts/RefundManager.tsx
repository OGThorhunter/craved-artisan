import React, { useState } from 'react';
import { Plus, Clock, AlertTriangle, CheckCircle, X, Edit, DollarSign, FileText } from 'lucide-react';
import type { RefundRequest, RefundType, RefundCategory, RefundStatus } from '@/lib/api/refunds-payouts';
import { formatCurrency, formatDate, getRefundStats, REFUND_STATUS_COLORS, REFUND_CATEGORY_COLORS, REFUND_CATEGORY_ICONS } from '@/lib/api/refunds-payouts';

interface RefundManagerProps {
  refunds: RefundRequest[];
  loading?: boolean;
  onCreateRefund: (refund: any) => void;
  onProcessRefund: (refundId: string, updates: any) => void;
  onRejectRefund: (refundId: string, reason: string) => void;
  onApproveRefund: (refundId: string, amount: number) => void;
}

export function RefundManager({
  refunds,
  loading = false,
  onCreateRefund,
  onProcessRefund,
  onRejectRefund,
  onApproveRefund
}: RefundManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRefund, setEditingRefund] = useState<RefundRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredRefunds = refunds.filter(refund => {
    const matchesStatus = statusFilter === 'all' || refund.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || refund.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  const stats = getRefundStats(refunds);

  const handleCreateRefund = () => {
    setShowCreateForm(true);
  };

  const handleEditRefund = (refund: RefundRequest) => {
    setEditingRefund(refund);
  };

  const handleProcessRefund = (refund: RefundRequest) => {
    const approvedAmount = prompt('Enter approved refund amount:', refund.requestedAmount.toString());
    if (approvedAmount && !isNaN(Number(approvedAmount))) {
      onProcessRefund(refund.id, { approvedAmount: Number(approvedAmount) });
    }
  };

  const handleRejectRefund = (refund: RefundRequest) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      onRejectRefund(refund.id, reason);
    }
  };

  const handleApproveRefund = (refund: RefundRequest) => {
    onApproveRefund(refund.id, refund.requestedAmount);
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
          <h2 className="text-xl font-semibold text-gray-900">Refund Management</h2>
          <p className="text-gray-600">Process customer refund requests and manage refund policies</p>
        </div>
        
        <button
          onClick={handleCreateRefund}
          className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Process Refund
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: 'Total', count: stats.total, color: 'gray' },
          { label: 'Pending', count: stats.pending, color: 'yellow' },
          { label: 'Approved', count: stats.approved, color: 'green' },
          { label: 'Completed', count: stats.completed, color: 'blue' },
          { label: 'Rejected', count: stats.rejected, color: 'red' },
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
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            <option value="CUSTOMER_REQUEST">Customer Request</option>
            <option value="EVENT_CANCELLATION">Event Cancellation</option>
            <option value="VENDOR_ISSUE">Vendor Issue</option>
            <option value="TECHNICAL_PROBLEM">Technical Problem</option>
            <option value="POLICY_APPLICATION">Policy Application</option>
            <option value="DISPUTE_RESOLUTION">Dispute Resolution</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Refunds List */}
      {filteredRefunds.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No refunds found</h3>
          <p className="text-gray-600">
            {refunds.length === 0 
              ? 'No refund requests have been submitted yet'
              : 'Try adjusting your filters to see more refunds'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRefunds.map((refund) => (
            <div key={refund.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">
                      {REFUND_CATEGORY_ICONS[refund.category]}
                    </span>
                    <h3 className="font-semibold text-gray-900">
                      {refund.order?.orderNumber || 'Order #' + refund.orderId}
                    </h3>
                    {getStatusBadge(refund.status, REFUND_STATUS_COLORS)}
                    {getStatusBadge(refund.category, REFUND_CATEGORY_COLORS)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Customer</div>
                      <div className="text-sm text-gray-900">{refund.customer?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{refund.customer?.email}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-700">Amount</div>
                      <div className="text-sm text-gray-900">
                        {formatCurrency(refund.requestedAmount)}
                        {refund.approvedAmount && refund.approvedAmount !== refund.requestedAmount && (
                          <span className="text-xs text-gray-500">
                            {' '}(approved: {formatCurrency(refund.approvedAmount)})
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-700">Method</div>
                      <div className="text-sm text-gray-900">{refund.refundMethod.replace('_', ' ')}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-700">Requested</div>
                      <div className="text-sm text-gray-900">{formatDate(refund.requestedAt)}</div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700">Reason</div>
                    <div className="text-sm text-gray-900">{refund.reason}</div>
                    {refund.description && (
                      <div className="text-sm text-gray-600 mt-1">{refund.description}</div>
                    )}
                  </div>
                  
                  {refund.supportingDocs.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700">Supporting Documents</div>
                      <div className="flex items-center gap-2 mt-1">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {refund.supportingDocs.length} document{refund.supportingDocs.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {refund.notes && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700">Internal Notes</div>
                      <div className="text-sm text-gray-900">{refund.notes}</div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {refund.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleEditRefund(refund)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit refund"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleApproveRefund(refund)}
                        className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                        title="Approve refund"
                      >
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </button>
                      <button
                        onClick={() => handleRejectRefund(refund)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Reject refund"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </>
                  )}
                  
                  {refund.status === 'APPROVED' && (
                    <button
                      onClick={() => handleProcessRefund(refund)}
                      className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Process refund"
                    >
                      <DollarSign className="w-4 h-4 text-blue-600" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Refund Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Process Refund</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const refundData = {
                eventId: 'evt_1', // TODO: Get from context
                orderId: formData.get('orderId'),
                customerId: formData.get('customerId'),
                refundType: formData.get('refundType'),
                requestedAmount: Number(formData.get('requestedAmount')),
                reason: formData.get('reason'),
                category: formData.get('category'),
                description: formData.get('description'),
                refundMethod: formData.get('refundMethod'),
                refundTo: formData.get('refundTo'),
              };
              onCreateRefund(refundData);
              setShowCreateForm(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order ID
                  </label>
                  <input
                    type="text"
                    name="orderId"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    placeholder="Enter order ID"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer ID
                  </label>
                  <input
                    type="text"
                    name="customerId"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    placeholder="Enter customer ID"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Type
                  </label>
                  <select
                    name="refundType"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    required
                    aria-label="Select refund type"
                  >
                    <option value="FULL">Full Refund</option>
                    <option value="PARTIAL">Partial Refund</option>
                    <option value="CREDIT">Credit to Account</option>
                    <option value="EXCHANGE">Exchange</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="requestedAmount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <input
                    type="text"
                    name="reason"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    placeholder="Reason for refund"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    required
                    aria-label="Select category"
                  >
                    <option value="CUSTOMER_REQUEST">Customer Request</option>
                    <option value="EVENT_CANCELLATION">Event Cancellation</option>
                    <option value="VENDOR_ISSUE">Vendor Issue</option>
                    <option value="TECHNICAL_PROBLEM">Technical Problem</option>
                    <option value="POLICY_APPLICATION">Policy Application</option>
                    <option value="DISPUTE_RESOLUTION">Dispute Resolution</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    placeholder="Additional details"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Method
                  </label>
                  <select
                    name="refundMethod"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    required
                    aria-label="Select refund method"
                  >
                    <option value="ORIGINAL_PAYMENT">Original Payment Method</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CHECK">Check</option>
                    <option value="CREDIT_ACCOUNT">Credit to Account</option>
                    <option value="PAYPAL">PayPal</option>
                    <option value="OTHER">Other</option>
                  </select>
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
                  Process Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
