import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { RefreshCw, Download, Filter, User, Calendar, DollarSign } from 'lucide-react';
import { PayoutStatusChip } from '../../components/admin/revenue/PayoutStatusChip';
import { toast } from 'react-hot-toast';

interface Payout {
  id: string;
  userId: string;
  grossCents: number;
  feeCents: number;
  netCents: number;
  status: 'PENDING' | 'IN_TRANSIT' | 'PAID' | 'CANCELED' | 'FAILED';
  expectedDate: string | null;
  completedAt: string | null;
  stripePayoutId: string | null;
  createdAt: string;
}

export const PayoutsManager: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [userIdFilter, setUserIdFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Fetch payouts
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['revenue-payouts', statusFilter, userIdFilter, page],
    queryFn: async () => {
      const params: any = { page, limit: 50 };
      if (statusFilter) params.status = statusFilter;
      if (userIdFilter) params.userId = userIdFilter;

      const response = await axios.get('/api/admin/revenue/payouts', {
        params,
        withCredentials: true,
      });
      return response.data;
    },
  });

  // Stripe sync mutation
  const syncStripe = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        '/api/admin/revenue/payouts/sync',
        {},
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['revenue-payouts'] });
      toast.success(`Synced ${data.synced.payouts} payouts from Stripe`);
    },
    onError: () => {
      toast.error('Failed to sync with Stripe');
    },
  });

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleExport = () => {
    toast.success('CSV export coming soon!');
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setUserIdFilter('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage vendor and coordinator payouts
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sync Stripe Button */}
          <button
            onClick={() => syncStripe.mutate()}
            disabled={syncStripe.isPending}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncStripe.isPending ? 'animate-spin' : ''}`} />
            {syncStripe.isPending ? 'Syncing...' : 'Sync Stripe'}
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Filter by payout status"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="PAID">Paid</option>
              <option value="CANCELED">Canceled</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {/* User ID Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID
            </label>
            <input
              type="text"
              value={userIdFilter}
              onChange={(e) => {
                setUserIdFilter(e.target.value);
                setPage(1);
              }}
              placeholder="Enter user ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Payout History</h2>
              {data?.pagination && (
                <p className="text-sm text-gray-600 mt-1">
                  {data.pagination.total.toLocaleString()} total payouts
                </p>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-6 bg-red-50 border-b border-red-200">
            <p className="text-red-800">Failed to load payouts. Please try again.</p>
          </div>
        )}

        {isLoading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gross
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stripe ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.payouts?.map((payout: Payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-mono text-xs text-gray-900">
                          {payout.userId.substring(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PayoutStatusChip status={payout.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-sm text-gray-900">
                      {formatCurrency(payout.grossCents)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-sm text-gray-500">
                      {formatCurrency(payout.feeCents)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-sm font-semibold text-green-600">
                      {formatCurrency(payout.netCents)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payout.expectedDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payout.completedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payout.stripePayoutId ? (
                        <span className="font-mono text-xs">{payout.stripePayoutId.substring(0, 12)}...</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {data?.payouts?.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No payouts found</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {page} of {data.pagination.totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= data.pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm font-medium text-yellow-800 mb-1">Pending</div>
          <div className="text-2xl font-bold text-yellow-900">
            {data?.payouts?.filter((p: Payout) => p.status === 'PENDING').length || 0}
          </div>
          <div className="text-xs text-yellow-700 mt-1">
            {formatCurrency(
              data?.payouts
                ?.filter((p: Payout) => p.status === 'PENDING')
                .reduce((sum: number, p: Payout) => sum + p.netCents, 0) || 0
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-800 mb-1">In Transit</div>
          <div className="text-2xl font-bold text-blue-900">
            {data?.payouts?.filter((p: Payout) => p.status === 'IN_TRANSIT').length || 0}
          </div>
          <div className="text-xs text-blue-700 mt-1">
            {formatCurrency(
              data?.payouts
                ?.filter((p: Payout) => p.status === 'IN_TRANSIT')
                .reduce((sum: number, p: Payout) => sum + p.netCents, 0) || 0
            )}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm font-medium text-green-800 mb-1">Completed</div>
          <div className="text-2xl font-bold text-green-900">
            {data?.payouts?.filter((p: Payout) => p.status === 'PAID').length || 0}
          </div>
          <div className="text-xs text-green-700 mt-1">
            {formatCurrency(
              data?.payouts
                ?.filter((p: Payout) => p.status === 'PAID')
                .reduce((sum: number, p: Payout) => sum + p.netCents, 0) || 0
            )}
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm font-medium text-red-800 mb-1">Failed</div>
          <div className="text-2xl font-bold text-red-900">
            {data?.payouts?.filter((p: Payout) => p.status === 'FAILED').length || 0}
          </div>
          <div className="text-xs text-red-700 mt-1">
            {formatCurrency(
              data?.payouts
                ?.filter((p: Payout) => p.status === 'FAILED')
                .reduce((sum: number, p: Payout) => sum + p.netCents, 0) || 0
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayoutsManager;

