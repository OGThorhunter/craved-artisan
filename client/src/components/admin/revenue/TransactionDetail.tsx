import React from 'react';
import { X, Calendar, User, DollarSign, FileText, Link as LinkIcon } from 'lucide-react';
import { LedgerTypeBadge } from './LedgerTypeBadge';

interface LedgerEntry {
  id: string;
  occurredAt: string;
  type: string;
  amountCents: number;
  currency: string;
  userId?: string;
  orderId?: string;
  eventId?: string;
  payoutId?: string;
  stripeChargeId?: string;
  metadata?: any;
  createdById: string;
}

interface TransactionDetailProps {
  entry: LedgerEntry;
  onClose: () => void;
}

export const TransactionDetail: React.FC<TransactionDetailProps> = ({
  entry,
  onClose,
}) => {
  const formatCurrency = (cents: number) => {
    const isNegative = cents < 0;
    const abs = Math.abs(cents);
    return `${isNegative ? '-' : ''}$${(abs / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Transaction Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Type and Amount */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <LedgerTypeBadge type={entry.type} size="lg" />
              <div className="text-right">
                <div className={`text-3xl font-bold ${entry.amountCents >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(entry.amountCents)}
                </div>
                <div className="text-sm text-gray-500 uppercase">{entry.currency}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(entry.occurredAt)}</span>
            </div>
          </div>

          {/* Transaction ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction ID
            </label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg font-mono text-sm text-gray-900">
              <LinkIcon className="w-4 h-4 text-gray-400" />
              {entry.id}
            </div>
          </div>

          {/* Related Entities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entry.userId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-mono text-sm text-gray-900">{entry.userId}</span>
                </div>
              </div>
            )}

            {entry.createdById && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Created By
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-mono text-sm text-gray-900">{entry.createdById}</span>
                </div>
              </div>
            )}
          </div>

          {/* References */}
          {(entry.orderId || entry.eventId || entry.payoutId || entry.stripeChargeId) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                References
              </label>
              <div className="space-y-2">
                {entry.orderId && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-sm font-medium text-blue-900">Order ID</span>
                    <span className="font-mono text-sm text-blue-800">{entry.orderId}</span>
                  </div>
                )}
                {entry.eventId && (
                  <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <span className="text-sm font-medium text-purple-900">Event ID</span>
                    <span className="font-mono text-sm text-purple-800">{entry.eventId}</span>
                  </div>
                )}
                {entry.payoutId && (
                  <div className="flex items-center justify-between p-3 bg-teal-50 border border-teal-200 rounded-lg">
                    <span className="text-sm font-medium text-teal-900">Payout ID</span>
                    <span className="font-mono text-sm text-teal-800">{entry.payoutId}</span>
                  </div>
                )}
                {entry.stripeChargeId && (
                  <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <span className="text-sm font-medium text-orange-900">Stripe Charge ID</span>
                    <span className="font-mono text-sm text-orange-800">{entry.stripeChargeId}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          {entry.metadata && Object.keys(entry.metadata).length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Information
              </label>
              <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
                  {JSON.stringify(entry.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Impact */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Transaction Impact</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">Platform Ledger</div>
                <div className={`text-lg font-bold ${entry.amountCents >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {entry.amountCents >= 0 ? '+' : ''}{formatCurrency(entry.amountCents)}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">Entry Type</div>
                <div className="text-sm font-medium text-gray-900">
                  {entry.amountCents >= 0 ? 'Credit (Revenue)' : 'Debit (Expense)'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

