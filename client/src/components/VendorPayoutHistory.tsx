import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  DollarSign,
  ExternalLink,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Wallet,
  RefreshCw,
  AlertCircle,
  BarChart3,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'canceled';
  type: string;
  method: string;
  arrival_date: number;
  created: number;
  description: string;
  failure_code?: string;
  failure_message?: string;
  metadata: any;
}

interface PayoutSummary {
  totalPayouts: number;
  successfulPayouts: number;
  pendingPayouts: number;
  failedPayouts: number;
  successRate: number;
  totalAmount: number;
  pendingAmount: number;
  availableBalance: number;
  pendingBalance: number;
}

interface VendorPayoutData {
  vendorId: string;
  vendorName: string;
  stripeAccountId: string;
  payouts: Payout[];
  hasMore: boolean;
  totalCount: number;
  stripeDashboardUrl: string;
}

interface VendorSummaryData {
  vendorId: string;
  vendorName: string;
  stripeAccountId: string;
  summary: PayoutSummary;
  stripeDashboardUrl: string;
}

const VendorPayoutHistory: React.FC<{ vendorId: string }> = ({ vendorId }) => {
  const { user } = useAuth();
  const [payoutData, setPayoutData] = useState<VendorPayoutData | null>(null);
  const [summaryData, setSummaryData] = useState<VendorSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [limit, setLimit] = useState(10);

  // Fetch payout history
  const fetchPayoutHistory = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/vendor-payouts/history/${vendorId}?limit=${limit}`, {
        withCredentials: true
      });
      setPayoutData(response.data);
    } catch (error: any) {
      console.error('Error fetching payout history:', error);
      const message = error.response?.data?.message || 'Failed to fetch payout history';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch payout summary
  const fetchPayoutSummary = async () => {
    try {
      setIsLoadingSummary(true);
      const response = await axios.get(`/api/vendor-payouts/summary/${vendorId}`, {
        withCredentials: true
      });
      setSummaryData(response.data);
    } catch (error: any) {
      console.error('Error fetching payout summary:', error);
      const message = error.response?.data?.message || 'Failed to fetch payout summary';
      toast.error(message);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  useEffect(() => {
    if (vendorId) {
      fetchPayoutHistory();
      fetchPayoutSummary();
    }
  }, [vendorId, limit]);

  const formatAmount = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (!user) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-800">Please log in to view payout history</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payout History</h2>
          <p className="text-gray-600">
            {summaryData?.vendorName && `Viewing payouts for ${summaryData.vendorName}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchPayoutHistory();
              fetchPayoutSummary();
            }}
            disabled={isLoading || isLoadingSummary}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {payoutData?.stripeDashboardUrl && (
            <a
              href={payoutData.stripeDashboardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Stripe Dashboard
            </a>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {summaryData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Available Balance</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {formatAmount(summaryData.summary.availableBalance)}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold text-gray-900">Pending Balance</h3>
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              {formatAmount(summaryData.summary.pendingBalance)}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Success Rate</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {summaryData.summary.successRate.toFixed(1)}%
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Total Payouts</h3>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {summaryData.summary.totalPayouts}
            </p>
          </div>
        </div>
      )}

      {/* Payout Statistics */}
      {summaryData && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payout Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Successful Payouts</p>
              <p className="text-lg font-bold text-green-600">{summaryData.summary.successfulPayouts}</p>
              <p className="text-sm text-gray-500">
                {formatAmount(summaryData.summary.totalAmount)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Pending Payouts</p>
              <p className="text-lg font-bold text-yellow-600">{summaryData.summary.pendingPayouts}</p>
              <p className="text-sm text-gray-500">
                {formatAmount(summaryData.summary.pendingAmount)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Failed Payouts</p>
              <p className="text-lg font-bold text-red-600">{summaryData.summary.failedPayouts}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payout History Table */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Payouts</h3>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Show:</label>
              <select
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
                aria-label="Number of payouts to display"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading payout history...</span>
          </div>
        ) : payoutData?.payouts && payoutData.payouts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payout
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Arrival
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payoutData.payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payout.id}
                      </div>
                      {payout.description && (
                        <div className="text-sm text-gray-500">{payout.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatAmount(payout.amount, payout.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payout.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payout.status)}`}>
                          {payout.status}
                        </span>
                      </div>
                      {payout.failure_message && (
                        <div className="text-xs text-red-600 mt-1">{payout.failure_message}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payout.method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(payout.created)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payout.arrival_date ? formatDate(payout.arrival_date) : 'Pending'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No payouts found</p>
            <p className="text-sm text-gray-400">Payouts will appear here once they are processed</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {payoutData?.stripeDashboardUrl && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            <a
              href={`${payoutData.stripeDashboardUrl}/payouts`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <DollarSign className="h-4 w-4" />
              View All Payouts
            </a>
            <a
              href={`${payoutData.stripeDashboardUrl}/transactions`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <BarChart3 className="h-4 w-4" />
              View Transactions
            </a>
            <a
              href={`${payoutData.stripeDashboardUrl}/settings`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              <Settings className="h-4 w-4" />
              Account Settings
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorPayoutHistory; 