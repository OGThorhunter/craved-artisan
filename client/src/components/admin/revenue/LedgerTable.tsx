import React from 'react';
import { Eye, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
}

interface LedgerTableProps {
  entries: LedgerEntry[];
  onViewDetails?: (entry: LedgerEntry) => void;
  isLoading?: boolean;
}

export const LedgerTable: React.FC<LedgerTableProps> = ({
  entries,
  onViewDetails,
  isLoading = false,
}) => {
  const formatCurrency = (cents: number) => {
    const isNegative = cents < 0;
    const abs = Math.abs(cents);
    return `${isNegative ? '-' : '+'}$${(abs / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAmountColor = (cents: number) => {
    return cents >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded"></div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No ledger entries found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date & Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Related To
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User ID
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {entries.map((entry) => (
            <tr key={entry.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(entry.occurredAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <LedgerTypeBadge type={entry.type} size="sm" />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-1">
                  {entry.amountCents >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`font-mono font-semibold ${getAmountColor(entry.amountCents)}`}>
                    {formatCurrency(entry.amountCents)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 uppercase">
                  {entry.currency}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {entry.orderId && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">Order:</span>
                    <span className="font-mono text-xs">{entry.orderId.substring(0, 8)}...</span>
                  </div>
                )}
                {entry.eventId && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">Event:</span>
                    <span className="font-mono text-xs">{entry.eventId.substring(0, 8)}...</span>
                  </div>
                )}
                {entry.payoutId && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">Payout:</span>
                    <span className="font-mono text-xs">{entry.payoutId.substring(0, 8)}...</span>
                  </div>
                )}
                {entry.stripeChargeId && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">Stripe:</span>
                    <span className="font-mono text-xs">{entry.stripeChargeId.substring(0, 12)}...</span>
                  </div>
                )}
                {!entry.orderId && !entry.eventId && !entry.payoutId && !entry.stripeChargeId && (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {entry.userId ? (
                  <span className="font-mono text-xs">{entry.userId.substring(0, 8)}...</span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {onViewDetails && (
                  <button
                    onClick={() => onViewDetails(entry)}
                    className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                    aria-label="View entry details"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Details</span>
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

