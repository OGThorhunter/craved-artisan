import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, RefreshCw, Download, AlertTriangle } from 'lucide-react';
import { FeeScheduleTable } from '../../components/admin/revenue/FeeScheduleTable';
import { FeeScheduleForm, FeeScheduleFormData } from '../../components/admin/revenue/FeeScheduleForm';
import { toast } from 'react-hot-toast';

export const FeeManager: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();

  // Fetch fee schedules
  const { data: schedules, isLoading, error, refetch } = useQuery({
    queryKey: ['fee-schedules'],
    queryFn: async () => {
      const response = await axios.get('/api/admin/revenue/fees/schedules', {
        withCredentials: true,
      });
      return response.data.schedules;
    },
  });

  // Create fee schedule mutation
  const createSchedule = useMutation({
    mutationFn: async (data: FeeScheduleFormData) => {
      const response = await axios.post(
        '/api/admin/revenue/fees/schedules',
        data,
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-schedules'] });
      toast.success('Fee schedule created successfully!');
      setShowCreateForm(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create fee schedule');
    },
  });

  const handleCreateSubmit = (data: FeeScheduleFormData) => {
    createSchedule.mutate(data);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    // TODO: Implement CSV export
    toast.success('Export feature coming soon!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <div>
            <p className="text-red-800 font-medium">Failed to load fee schedules</p>
            <p className="text-red-600 text-sm mt-1">Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Manager</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage platform fee schedules and overrides
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="Refresh fee schedules"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>

          {/* Create Button */}
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Schedule
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Fee Schedule Hierarchy</p>
            <p>
              Fees are resolved in this order: <strong>ORDER → CATEGORY → EVENT → VENDOR → ROLE → GLOBAL</strong>.
              More specific scopes override broader ones.
            </p>
          </div>
        </div>
      </div>

      {/* Fee Schedules Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Active Fee Schedules</h2>
          <p className="text-sm text-gray-600 mt-1">
            {schedules?.length || 0} schedule{schedules?.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <FeeScheduleTable
          schedules={schedules || []}
          onView={(schedule) => {
            // TODO: Implement view modal
            console.log('View schedule:', schedule);
          }}
          onEdit={(schedule) => {
            // TODO: Implement edit functionality
            console.log('Edit schedule:', schedule);
          }}
        />
      </div>

      {/* Scope Legend */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Scope Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              GLOBAL
            </span>
            <p className="text-sm text-gray-600">Applies to all transactions by default</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
              ROLE
            </span>
            <p className="text-sm text-gray-600">Applies to all users of a specific role</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">
              VENDOR
            </span>
            <p className="text-sm text-gray-600">Applies to a specific vendor's transactions</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
              EVENT
            </span>
            <p className="text-sm text-gray-600">Applies to a specific event</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-pink-100 text-pink-800">
              CATEGORY
            </span>
            <p className="text-sm text-gray-600">Applies to products in a category</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-red-100 text-red-800">
              ORDER
            </span>
            <p className="text-sm text-gray-600">Applies to a single specific order</p>
          </div>
        </div>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <FeeScheduleForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setShowCreateForm(false)}
          isLoading={createSchedule.isPending}
        />
      )}
    </div>
  );
};

export default FeeManager;

