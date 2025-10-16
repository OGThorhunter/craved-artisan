import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Save, RefreshCw, AlertCircle } from 'lucide-react';
import Button from '../../ui/Button';
import Card from '../../ui/Card';
import toast from 'react-hot-toast';

export const CostOverride: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });

  const queryClient = useQueryClient();

  // Fetch costs for selected date
  const { data: costs, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'costs', selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/admin/pl/costs/${selectedDate}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch costs');
      const result = await response.json();
      return result.data;
    },
  });

  const [formData, setFormData] = useState({
    manualRenderCostCents: '',
    manualRedisCostCents: '',
    manualDatabaseCostCents: '',
    manualSendGridCostCents: '',
    manualStorageCostCents: '',
    otherCostsCents: '',
    otherCostsNote: '',
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload: any = {};
      
      if (data.manualRenderCostCents) payload.manualRenderCostCents = Math.floor(parseFloat(data.manualRenderCostCents) * 100);
      if (data.manualRedisCostCents) payload.manualRedisCostCents = Math.floor(parseFloat(data.manualRedisCostCents) * 100);
      if (data.manualDatabaseCostCents) payload.manualDatabaseCostCents = Math.floor(parseFloat(data.manualDatabaseCostCents) * 100);
      if (data.manualSendGridCostCents) payload.manualSendGridCostCents = Math.floor(parseFloat(data.manualSendGridCostCents) * 100);
      if (data.manualStorageCostCents) payload.manualStorageCostCents = Math.floor(parseFloat(data.manualStorageCostCents) * 100);
      if (data.otherCostsCents) payload.otherCostsCents = Math.floor(parseFloat(data.otherCostsCents) * 100);
      if (data.otherCostsNote) payload.otherCostsNote = data.otherCostsNote;

      const response = await fetch(`/api/admin/pl/costs/${selectedDate}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to update costs');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'costs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'pl'] });
      toast.success('Cost overrides updated successfully');
      setFormData({
        manualRenderCostCents: '',
        manualRedisCostCents: '',
        manualDatabaseCostCents: '',
        manualSendGridCostCents: '',
        manualStorageCostCents: '',
        otherCostsCents: '',
        otherCostsNote: '',
      });
      refetch();
    },
    onError: () => {
      toast.error('Failed to update cost overrides');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  };

  const CostField: React.FC<{
    label: string;
    estimated: number;
    fieldName: keyof typeof formData;
    help?: string;
  }> = ({ label, estimated, fieldName, help }) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">Estimated</div>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
              {formatCurrency(estimated)}
            </div>
          </div>
          
          <div>
            <div className="text-xs text-gray-500 mb-1">Actual (override)</div>
            <input
              type="number"
              value={formData[fieldName]}
              onChange={(e) => setFormData({ ...formData, [fieldName]: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              placeholder={formatCurrency(estimated)}
              step="0.01"
            />
          </div>
        </div>
        
        {help && <p className="text-xs text-gray-500">{help}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cost Overrides</h2>
          <p className="text-sm text-gray-600 mt-1">
            Override estimated costs with actual monthly expenses
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white"
            max={new Date().toISOString().split('T')[0]}
          />

          <Button
            variant="secondary"
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How Cost Overrides Work</p>
            <p>
              The system estimates daily costs based on usage and pricing tiers. 
              You can override these estimates with actual costs from your monthly bills. 
              Leave fields empty to use the estimated values.
            </p>
          </div>
        </div>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      )}

      {!isLoading && !costs && (
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cost Data</h3>
          <p className="text-gray-600">
            No cost snapshot found for the selected date.
          </p>
        </Card>
      )}

      {!isLoading && costs && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Infrastructure Costs
            </h3>
            
            <div className="space-y-4">
              <CostField
                label="Hosting (Render)"
                estimated={costs.renderCostCents || 0}
                fieldName="manualRenderCostCents"
                help="Web service + background workers"
              />

              <CostField
                label="Redis Cache"
                estimated={costs.redisCostCents || 0}
                fieldName="manualRedisCostCents"
                help="Redis cloud pricing based on memory"
              />

              <CostField
                label="Database (PostgreSQL)"
                estimated={costs.databaseCostCents || 0}
                fieldName="manualDatabaseCostCents"
                help="Database hosting and storage"
              />

              <CostField
                label="Email Service (SendGrid)"
                estimated={costs.sendGridCostCents || 0}
                fieldName="manualSendGridCostCents"
                help="Email delivery service"
              />

              <CostField
                label="Storage"
                estimated={costs.storageCostCents || 0}
                fieldName="manualStorageCostCents"
                help="File storage and backups"
              />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Other Costs
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Other Costs ($)
                </label>
                <input
                  type="number"
                  value={formData.otherCostsCents}
                  onChange={(e) => setFormData({ ...formData, otherCostsCents: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Additional expenses like software subscriptions, domain fees, etc.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.otherCostsNote}
                  onChange={(e) => setFormData({ ...formData, otherCostsNote: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe other costs (e.g., Stripe subscription, Figma, GitHub, etc.)"
                />
              </div>
            </div>
          </Card>

          {/* Summary */}
          <Card className="p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Total (Estimated)</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(costs.totalCostCents || 0)}
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={updateMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {updateMutation.isPending ? 'Saving...' : 'Save Overrides'}
              </Button>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
};

export default CostOverride;

