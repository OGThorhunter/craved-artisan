import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Percent, RefreshCw } from 'lucide-react';
import { SettingsCard } from './SettingsCard';
import { ReasonModal } from './ReasonModal';
import Button from '../../ui/Button';

interface PaymentsFeesSettingsProps {
  settings: any[];
}

export const PaymentsFeesSettings: React.FC<PaymentsFeesSettingsProps> = ({ settings }) => {
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{ key: string; value: any } | null>(null);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ key, value, reason }: { key: string; value: any; reason: string }) => {
      const response = await fetch(`/api/admin/settings/${key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ value, reason })
      });
      if (!response.ok) throw new Error('Failed to update setting');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    }
  });

  const getSetting = (key: string) => {
    const setting = settings?.find((s) => s.key === key);
    return setting?.value;
  };

  const handleUpdate = (key: string, value: any) => {
    setPendingUpdate({ key, value });
    setShowReasonModal(true);
  };

  const confirmUpdate = (reason: string) => {
    if (pendingUpdate) {
      updateMutation.mutate({
        key: pendingUpdate.key,
        value: pendingUpdate.value,
        reason
      });
    }
    setPendingUpdate(null);
  };

  return (
    <div className="space-y-6">
      {/* Platform Fee */}
      <SettingsCard
        title="Platform Fee"
        description="Configure global platform fee and limits"
        icon={<Percent className="h-5 w-5 text-[#7F232E]" />}
      >
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="platform-fee-percent" className="text-sm font-medium text-[#2b2b2b] mb-1 block">
              Platform Fee (%)
            </label>
            <input
              id="platform-fee-percent"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={getSetting('payments.platform_fee_percent') || 2.0}
              onChange={(e) => handleUpdate('payments.platform_fee_percent', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
            />
          </div>

          <div>
            <label htmlFor="fee-min-cents" className="text-sm font-medium text-[#2b2b2b] mb-1 block">
              Minimum Fee (cents)
            </label>
            <input
              id="fee-min-cents"
              type="number"
              min="0"
              max="10000"
              value={getSetting('payments.platform_fee_min_cents') || 50}
              onChange={(e) => handleUpdate('payments.platform_fee_min_cents', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
            />
            <p className="text-xs text-[#4b4b4b] mt-1">${(getSetting('payments.platform_fee_min_cents') || 50) / 100}</p>
          </div>

          <div>
            <label htmlFor="fee-max-cents" className="text-sm font-medium text-[#2b2b2b] mb-1 block">
              Maximum Fee (cents)
            </label>
            <input
              id="fee-max-cents"
              type="number"
              min="0"
              max="100000"
              value={getSetting('payments.platform_fee_max_cents') || 10000}
              onChange={(e) => handleUpdate('payments.platform_fee_max_cents', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
            />
            <p className="text-xs text-[#4b4b4b] mt-1">${(getSetting('payments.platform_fee_max_cents') || 10000) / 100}</p>
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="fee-rounding" className="text-sm font-medium text-[#2b2b2b] mb-1 block">
            Fee Rounding Rule
          </label>
          <select
            id="fee-rounding"
            value={getSetting('payments.fee_rounding') || 'up'}
            onChange={(e) => handleUpdate('payments.fee_rounding', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
          >
            <option value="up">Round Up</option>
            <option value="down">Round Down</option>
            <option value="nearest">Round to Nearest</option>
          </select>
        </div>
      </SettingsCard>

      {/* Tax Settings */}
      <SettingsCard
        title="Tax Configuration"
        description="Configure tax calculation and TaxJar integration"
        icon={<DollarSign className="h-5 w-5 text-[#7F232E]" />}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-[#2b2b2b]">Enable TaxJar Integration</label>
              <p className="text-xs text-[#4b4b4b]">Use TaxJar for automated tax calculation</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={getSetting('payments.tax_jar_enabled') || false}
                onChange={(e) => handleUpdate('payments.tax_jar_enabled', e.target.checked)}
                className="sr-only peer"
                aria-label="Enable TaxJar Integration"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7F232E]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7F232E]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-[#2b2b2b]">Tax Inclusive Pricing</label>
              <p className="text-xs text-[#4b4b4b]">Display prices with tax included</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={getSetting('payments.tax_inclusive') || false}
                onChange={(e) => handleUpdate('payments.tax_inclusive', e.target.checked)}
                className="sr-only peer"
                aria-label="Tax Inclusive Pricing"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7F232E]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7F232E]"></div>
            </label>
          </div>

          {getSetting('payments.tax_jar_enabled') && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> TaxJar API key should be configured in environment variables (TAXJAR_API_KEY).
              </p>
            </div>
          )}
        </div>
      </SettingsCard>

      {/* Refund Policy */}
      <SettingsCard
        title="Refund Policy"
        description="Configure refund behavior for fees"
        icon={<RefreshCw className="h-5 w-5 text-[#7F232E]" />}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-[#2b2b2b]">Refund Platform Fee</label>
              <p className="text-xs text-[#4b4b4b]">Return platform fee to customer on refund</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={getSetting('payments.refund_platform_fee') || false}
                onChange={(e) => handleUpdate('payments.refund_platform_fee', e.target.checked)}
                className="sr-only peer"
                aria-label="Refund Platform Fee"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7F232E]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7F232E]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-[#2b2b2b]">Refund Processing Fee</label>
              <p className="text-xs text-[#4b4b4b]">Return Stripe processing fee on refund</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={getSetting('payments.refund_processing_fee') || false}
                onChange={(e) => handleUpdate('payments.refund_processing_fee', e.target.checked)}
                className="sr-only peer"
                aria-label="Refund Processing Fee"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7F232E]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7F232E]"></div>
            </label>
          </div>
        </div>
      </SettingsCard>

      {/* Vacation Mode */}
      <SettingsCard
        title="Vacation Mode"
        description="Configure vendor vacation mode limits"
        icon={<DollarSign className="h-5 w-5 text-[#7F232E]" />}
      >
        <div>
          <label htmlFor="vacation-max-days" className="text-sm font-medium text-[#2b2b2b] mb-1 block">
            Maximum Vacation Duration (days)
          </label>
          <input
            id="vacation-max-days"
            type="number"
            min="1"
            max="365"
            value={getSetting('payments.vacation_mode_max_days') || 90}
            onChange={(e) => handleUpdate('payments.vacation_mode_max_days', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
          />
          <p className="text-xs text-[#4b4b4b] mt-1">Maximum number of days a vendor can be in vacation mode</p>
        </div>
      </SettingsCard>

      {/* Reason Modal */}
      <ReasonModal
        isOpen={showReasonModal}
        onClose={() => {
          setShowReasonModal(false);
          setPendingUpdate(null);
        }}
        onConfirm={confirmUpdate}
        title="Confirm Payment Setting Change"
        description="Please provide a reason for this payment configuration change. This will be logged in the audit trail."
        actionLabel="Update Setting"
      />
    </div>
  );
};

