import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Globe, Mail, Clock, DollarSign, Code } from 'lucide-react';
import { SettingsCard } from './SettingsCard';
import { ReasonModal } from './ReasonModal';
import Button from '../../ui/Button';
import { Badge } from '../../ui/Badge';

interface PlatformIdentitySettingsProps {
  settings: any[];
}

export const PlatformIdentitySettings: React.FC<PlatformIdentitySettingsProps> = ({ settings }) => {
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{ key: string; value: any } | null>(null);
  const queryClient = useQueryClient();

  // Get current deployment info
  const { data: deploymentInfo } = useQuery({
    queryKey: ['admin', 'deployment', 'current'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ops/deployment/current', {
        credentials: 'include'
      });
      if (!response.ok) return null;
      const result = await response.json();
      return result.data;
    }
  });

  // Update setting mutation
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
      {/* Basic Information */}
      <SettingsCard
        title="Basic Information"
        description="Core platform identity and branding"
        icon={<Globe className="h-5 w-5 text-[#7F232E]" />}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="platform-name" className="text-sm font-medium text-[#2b2b2b] mb-1 block">
              Platform Name
            </label>
            <input
              id="platform-name"
              type="text"
              value={getSetting('platform.name') || ''}
              onChange={(e) => handleUpdate('platform.name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
            />
          </div>

          <div>
            <label htmlFor="platform-tagline" className="text-sm font-medium text-[#2b2b2b] mb-1 block">
              Tagline
            </label>
            <input
              id="platform-tagline"
              type="text"
              value={getSetting('platform.tagline') || ''}
              onChange={(e) => handleUpdate('platform.tagline', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
            />
          </div>
        </div>
      </SettingsCard>

      {/* Contact Information */}
      <SettingsCard
        title="Contact Information"
        description="Primary contact details for platform communications"
        icon={<Mail className="h-5 w-5 text-[#7F232E]" />}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="contact-email" className="text-sm font-medium text-[#2b2b2b] mb-1 block">
              Contact Email
            </label>
            <input
              id="contact-email"
              type="email"
              value={getSetting('platform.contact_email') || ''}
              onChange={(e) => handleUpdate('platform.contact_email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
            />
          </div>
        </div>
      </SettingsCard>

      {/* Localization */}
      <SettingsCard
        title="Localization"
        description="Regional and language settings"
        icon={<Clock className="h-5 w-5 text-[#7F232E]" />}
      >
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="platform-timezone" className="text-sm font-medium text-[#2b2b2b] mb-1 block">
              Timezone
            </label>
            <select
              id="platform-timezone"
              value={getSetting('platform.timezone') || 'America/New_York'}
              onChange={(e) => handleUpdate('platform.timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="UTC">UTC</option>
            </select>
          </div>

          <div>
            <label htmlFor="platform-currency" className="text-sm font-medium text-[#2b2b2b] mb-1 block">
              Currency
            </label>
            <select
              id="platform-currency"
              value={getSetting('platform.currency') || 'USD'}
              onChange={(e) => handleUpdate('platform.currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD (C$)</option>
            </select>
          </div>

          <div>
            <label htmlFor="platform-locale" className="text-sm font-medium text-[#2b2b2b] mb-1 block">
              Locale
            </label>
            <select
              id="platform-locale"
              value={getSetting('platform.locale') || 'en'}
              onChange={(e) => handleUpdate('platform.locale', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
        </div>
      </SettingsCard>

      {/* Environment Info */}
      <SettingsCard
        title="Environment Information"
        description="Current deployment and build information (read-only)"
        icon={<Code className="h-5 w-5 text-[#7F232E]" />}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-[#2b2b2b] mb-1 block">
              Environment
            </label>
            <div className="flex items-center gap-2">
              <Badge variant={
                getSetting('platform.environment') === 'production' ? 'success' :
                getSetting('platform.environment') === 'staging' ? 'warning' :
                'secondary'
              }>
                {getSetting('platform.environment') || 'development'}
              </Badge>
            </div>
          </div>

          {deploymentInfo && (
            <>
              <div>
                <label className="text-sm font-medium text-[#2b2b2b] mb-1 block">
                  Git SHA
                </label>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {deploymentInfo.gitSha?.slice(0, 8) || 'N/A'}
                </code>
              </div>

              <div>
                <label className="text-sm font-medium text-[#2b2b2b] mb-1 block">
                  Branch
                </label>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {deploymentInfo.gitBranch || 'N/A'}
                </code>
              </div>

              <div>
                <label className="text-sm font-medium text-[#2b2b2b] mb-1 block">
                  Deployed At
                </label>
                <span className="text-sm text-[#4b4b4b]">
                  {new Date(deploymentInfo.deployedAt).toLocaleString()}
                </span>
              </div>
            </>
          )}
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
        title="Confirm Setting Change"
        description="Please provide a reason for this configuration change. This will be logged in the audit trail."
        actionLabel="Update Setting"
      />
    </div>
  );
};

