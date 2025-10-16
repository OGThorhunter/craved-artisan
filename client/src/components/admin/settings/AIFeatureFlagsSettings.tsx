import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Cpu, Zap, Flag } from 'lucide-react';
import { SettingsCard } from './SettingsCard';
import { ReasonModal } from './ReasonModal';
import { Badge } from '../../ui/Badge';

interface AIFeatureFlagsSettingsProps {
  settings: any[];
}

export const AIFeatureFlagsSettings: React.FC<AIFeatureFlagsSettingsProps> = ({ settings }) => {
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{ key: string; value: any } | null>(null);
  const queryClient = useQueryClient();

  // Fetch feature flags
  const { data: featureFlags } = useQuery({
    queryKey: ['admin', 'ops', 'feature-flags'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ops/feature-flags', {
        credentials: 'include'
      });
      if (!response.ok) return [];
      const result = await response.json();
      return result.data;
    }
  });

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
      {/* Master AI Toggle */}
      <SettingsCard
        title="AI Master Control"
        description="Enable or disable all AI features platform-wide"
        icon={<Cpu className="h-5 w-5 text-[#7F232E]" />}
      >
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-[#2b2b2b]">Master AI Enable/Disable</label>
            <p className="text-xs text-[#4b4b4b]">Turn all AI features on or off globally</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={getSetting('ai.master_enabled') !== false}
              onChange={(e) => handleUpdate('ai.master_enabled', e.target.checked)}
              className="sr-only peer"
              aria-label="Master AI Enable/Disable"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7F232E]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7F232E]"></div>
          </label>
        </div>
      </SettingsCard>

      {/* AI Module Toggles */}
      <SettingsCard
        title="AI Modules"
        description="Enable or disable individual AI features"
        icon={<Zap className="h-5 w-5 text-[#7F232E]" />}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-[#2b2b2b]">AI Inventory Wizard</label>
              <p className="text-xs text-[#4b4b4b]">Smart inventory management and reorder suggestions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={getSetting('ai.inventory_wizard_enabled') !== false}
                onChange={(e) => handleUpdate('ai.inventory_wizard_enabled', e.target.checked)}
                disabled={!getSetting('ai.master_enabled')}
                className="sr-only peer"
                aria-label="AI Inventory Wizard"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7F232E]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7F232E] peer-disabled:opacity-50"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-[#2b2b2b]">AI Label Generator</label>
              <p className="text-xs text-[#4b4b4b]">Automated label generation and compliance checking</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={getSetting('ai.label_generator_enabled') !== false}
                onChange={(e) => handleUpdate('ai.label_generator_enabled', e.target.checked)}
                disabled={!getSetting('ai.master_enabled')}
                className="sr-only peer"
                aria-label="AI Label Generator"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7F232E]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7F232E] peer-disabled:opacity-50"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-[#2b2b2b]">AI Support Sage</label>
              <p className="text-xs text-[#4b4b4b]">Intelligent customer support assistance</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={getSetting('ai.support_sage_enabled') !== false}
                onChange={(e) => handleUpdate('ai.support_sage_enabled', e.target.checked)}
                disabled={!getSetting('ai.master_enabled')}
                className="sr-only peer"
                aria-label="AI Support Sage"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7F232E]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7F232E] peer-disabled:opacity-50"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-[#2b2b2b]">AI Recipe Import/Scaling</label>
              <p className="text-xs text-[#4b4b4b]">Smart recipe parsing and ingredient scaling</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={getSetting('ai.recipe_import_enabled') !== false}
                onChange={(e) => handleUpdate('ai.recipe_import_enabled', e.target.checked)}
                disabled={!getSetting('ai.master_enabled')}
                className="sr-only peer"
                aria-label="AI Recipe Import/Scaling"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7F232E]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7F232E] peer-disabled:opacity-50"></div>
            </label>
          </div>
        </div>
      </SettingsCard>

      {/* Rate Limits */}
      <SettingsCard
        title="AI Rate Limits"
        description="Configure AI API usage limits"
        icon={<Zap className="h-5 w-5 text-[#7F232E]" />}
      >
        <div>
          <label htmlFor="ai-rate-limit" className="text-sm font-medium text-[#2b2b2b] mb-1 block">
            Rate Limit (calls per minute per user)
          </label>
          <input
            id="ai-rate-limit"
            type="number"
            min="1"
            max="100"
            value={getSetting('ai.rate_limit_calls_per_minute') || 10}
            onChange={(e) => handleUpdate('ai.rate_limit_calls_per_minute', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
          />
          <p className="text-xs text-[#4b4b4b] mt-1">Maximum AI API calls per user per minute</p>
        </div>
      </SettingsCard>

      {/* Feature Flags */}
      {featureFlags && featureFlags.length > 0 && (
        <SettingsCard
          title="Feature Flags"
          description="System-wide feature flags from database"
          icon={<Flag className="h-5 w-5 text-[#7F232E]" />}
        >
          <div className="space-y-3">
            {featureFlags.map((flag: any) => (
              <div key={flag.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#2b2b2b]">{flag.key}</span>
                    <Badge variant={flag.enabled ? 'success' : 'secondary'}>
                      {flag.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  {flag.description && (
                    <p className="text-xs text-[#4b4b4b] mt-1">{flag.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-[#4b4b4b]">
              Feature flags are managed via the Ops tab. Visit{' '}
              <a href="/dashboard/admin" className="text-[#7F232E] hover:underline">
                Admin Dashboard → Ops
              </a>{' '}
              to manage flags.
            </p>
          </div>
        </SettingsCard>
      )}

      {/* Reason Modal */}
      <ReasonModal
        isOpen={showReasonModal}
        onClose={() => {
          setShowReasonModal(false);
          setPendingUpdate(null);
        }}
        onConfirm={confirmUpdate}
        title="Confirm AI Setting Change"
        description="Please provide a reason for this AI configuration change. This will be logged in the audit trail."
        actionLabel="Update Setting"
      />
    </div>
  );
};

