import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, RefreshCw, Tag, Calendar, Users, Hash } from 'lucide-react';
import { PromoEditor, PromoFormData } from '../../components/admin/revenue/PromoEditor';
import { toast } from 'react-hot-toast';

interface Promo {
  id: string;
  code: string;
  appliesTo: string;
  percentOffBps: number | null;
  amountOffCents: number | null;
  startsAt: string;
  endsAt: string | null;
  audienceTag: string | null;
  maxRedemptions: number | null;
  currentUses: number;
}

export const PromoManager: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();

  // Fetch promos
  const { data: promos, isLoading, error, refetch } = useQuery({
    queryKey: ['platform-promos'],
    queryFn: async () => {
      const response = await axios.get('/api/admin/revenue/promos', {
        withCredentials: true,
      });
      return response.data.promos as Promo[];
    },
  });

  // Create promo mutation
  const createPromo = useMutation({
    mutationFn: async (data: PromoFormData) => {
      const response = await axios.post(
        '/api/admin/revenue/promos',
        data,
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-promos'] });
      toast.success('Promo code created successfully!');
      setShowCreateForm(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create promo code');
    },
  });

  const handleCreateSubmit = (data: PromoFormData) => {
    createPromo.mutate(data);
  };

  const formatCurrency = (cents: number | null) => {
    if (cents === null) return 'N/A';
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatPercent = (bps: number | null) => {
    if (bps === null) return 'N/A';
    return `${(bps / 100).toFixed(2)}%`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No expiration';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (promo: Promo) => {
    const now = new Date();
    const start = new Date(promo.startsAt);
    const end = promo.endsAt ? new Date(promo.endsAt) : null;

    if (now < start) return 'bg-gray-100 text-gray-800';
    if (end && now > end) return 'bg-red-100 text-red-800';
    if (promo.maxRedemptions && promo.currentUses >= promo.maxRedemptions) {
      return 'bg-orange-100 text-orange-800';
    }
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (promo: Promo) => {
    const now = new Date();
    const start = new Date(promo.startsAt);
    const end = promo.endsAt ? new Date(promo.endsAt) : null;

    if (now < start) return 'Scheduled';
    if (end && now > end) return 'Expired';
    if (promo.maxRedemptions && promo.currentUses >= promo.maxRedemptions) {
      return 'Max Uses Reached';
    }
    return 'Active';
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
        <p className="text-red-800">Failed to load promo codes. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promo Codes</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage promotional codes and platform credits
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={() => refetch()}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="Refresh promo codes"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>

          {/* Create Button */}
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Promo
          </button>
        </div>
      </div>

      {/* Promo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promos?.map((promo) => (
          <div
            key={promo.id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-red-600" />
                <div className="font-mono font-bold text-lg text-gray-900">
                  {promo.code}
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(promo)}`}
              >
                {getStatusText(promo)}
              </span>
            </div>

            {/* Discount */}
            <div className="mb-4">
              <div className="text-3xl font-bold text-red-600">
                {promo.percentOffBps !== null
                  ? formatPercent(promo.percentOffBps)
                  : formatCurrency(promo.amountOffCents)}
              </div>
              <div className="text-sm text-gray-500">
                {promo.percentOffBps !== null ? 'Percentage Off' : 'Fixed Discount'}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(promo.startsAt)} - {formatDate(promo.endsAt)}</span>
              </div>
              {promo.maxRedemptions && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Hash className="w-4 h-4" />
                  <span>
                    {promo.currentUses} / {promo.maxRedemptions} uses
                  </span>
                </div>
              )}
              {promo.audienceTag && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{promo.audienceTag}</span>
                </div>
              )}
            </div>

            {/* Applies To */}
            <div className="mt-4 pt-4 border-t">
              <div className="text-xs text-gray-500">Applies to</div>
              <div className="text-sm font-medium text-gray-900">
                {promo.appliesTo.replace(/_/g, ' ')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {promos?.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Promo Codes Yet</h3>
          <p className="text-gray-600 mb-4">Create your first promotional code to get started</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create First Promo
          </button>
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <PromoEditor
          onSubmit={handleCreateSubmit}
          onCancel={() => setShowCreateForm(false)}
          isLoading={createPromo.isPending}
        />
      )}
    </div>
  );
};

export default PromoManager;

