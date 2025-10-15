import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { RefreshCw, Download, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { LedgerTable } from '../../components/admin/revenue/LedgerTable';
import { TransactionDetail } from '../../components/admin/revenue/TransactionDetail';
import { toast } from 'react-hot-toast';

const LEDGER_TYPES = [
  'ORDER_FEE',
  'PROCESSING_FEE',
  'EVENT_FEE',
  'SUBSCRIPTION_FEE',
  'PAYOUT',
  'REFUND',
  'DISPUTE_HOLD',
  'DISPUTE_WIN',
  'DISPUTE_LOSS',
  'ADJUSTMENT',
  'PROMO_APPLIED',
  'TAX_COLLECTED',
];

export const RevenueLedger: React.FC = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    userId: '',
    orderId: '',
    fromDate: '',
    toDate: '',
  });
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['revenue-ledger', page, filters],
    queryFn: async () => {
      const params: any = { page, limit: 50 };
      if (filters.type) params.type = filters.type;
      if (filters.userId) params.userId = filters.userId;
      if (filters.orderId) params.orderId = filters.orderId;
      if (filters.fromDate) params.fromDate = filters.fromDate;
      if (filters.toDate) params.toDate = filters.toDate;

      const response = await axios.get('/api/admin/revenue/ledger', {
        params,
        withCredentials: true,
      });
      return response.data;
    },
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = async () => {
    try {
      // TODO: Implement actual CSV export
      toast.success('CSV export coming soon!');
    } catch (error) {
      toast.error('Failed to export ledger');
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      type: '',
      userId: '',
      orderId: '',
      fromDate: '',
      toDate: '',
    });
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ledger</h1>
          <p className="text-sm text-gray-600 mt-1">
            Complete transaction history - immutable and append-only
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="Refresh ledger"
            title="Refresh ledger data"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Filter by transaction type"
            >
              <option value="">All Types</option>
              {LEDGER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* User ID Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID
            </label>
            <input
              type="text"
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              placeholder="Enter user ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Order ID Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order ID
            </label>
            <input
              type="text"
              value={filters.orderId}
              onChange={(e) => handleFilterChange('orderId', e.target.value)}
              placeholder="Enter order ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* From Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => handleFilterChange('fromDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Filter from date"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => handleFilterChange('toDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Filter to date"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {(filters.type || filters.userId || filters.orderId || filters.fromDate || filters.toDate) && (
          <div className="mt-4 pt-4 border-t">
            <button
              onClick={handleClearFilters}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
              {data?.pagination && (
                <p className="text-sm text-gray-600 mt-1">
                  {data.pagination.total.toLocaleString()} total entries
                </p>
              )}
            </div>
            {data?.pagination && (
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-6 bg-red-50 border-b border-red-200">
            <p className="text-red-800">Failed to load ledger. Please try again.</p>
          </div>
        )}

        <LedgerTable
          entries={data?.entries || []}
          onViewDetails={setSelectedEntry}
          isLoading={isLoading}
        />

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((page - 1) * 50) + 1} to {Math.min(page * 50, data.pagination.total)} of {data.pagination.total}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-900">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedEntry && (
        <TransactionDetail
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </div>
  );
};

export default RevenueLedger;

