import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Lock, Key, Clock } from 'lucide-react';
import { SettingsCard } from './SettingsCard';
import { ReasonModal } from './ReasonModal';

interface AuthSecuritySettingsProps {
  settings: any[];
}

export const AuthSecuritySettings: React.FC<AuthSecuritySettingsProps> = ({ settings }) => {
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
      {/* Session Settings */}
      <SettingsCard
        title="Session Management"
        description="Configure session expiration and security"
        icon={<Clock className="h-5 w-5 text-[#7F232E]" />}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="session-expiration" className="text-sm font-medium text-[#2b2b2b] mb-1 block">
              Session Expiration (minutes)
            </label>
            <input
              id="session-expiration"
              type="number"
              min="30"
              max="10080"
              value={getSetting('auth.session_expiration_minutes') || 1440}
              onChange={(e) => handleUpdate('auth.session_expiration_minutes', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
            />
            <p className="text-xs text-[#4b4b4b] mt-1">Default: 1440 (24 hours)</p>
          </div>

          <div>
            <label htmlFor="login-rate-limit" className="text-sm font-medium text-[#2b2b2b] mb-1 block">
              Login Rate Limit (per minute)
            </label>
            <input
              id="login-rate-limit"
              type="number"
              min="1"
              max="20"
              value={getSetting('auth.login_rate_limit') || 5}
              onChange={(e) => handleUpdate('auth.login_rate_limit', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
            />
            <p className="text-xs text-[#4b4b4b] mt-1">Max login attempts per minute</p>
          </div>
        </div>
      </SettingsCard>

      {/* MFA Settings */}
      <SettingsCard
        title="Multi-Factor Authentication"
        description="Configure MFA requirements by role"
        icon={<Shield className="h-5 w-5 text-[#7F232E]" />}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-[#2b2b2b]">Enforce MFA for Admins</label>
              <p className="text-xs text-[#4b4b4b]">Require all admin users to enable MFA</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={getSetting('auth.mfa_enforce_admins') || false}
                onChange={(e) => handleUpdate('auth.mfa_enforce_admins', e.target.checked)}
                className="sr-only peer"
                aria-label="Enforce MFA for Admins"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7F232E]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7F232E]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-[#2b2b2b]">Enforce MFA for Vendors</label>
              <p className="text-xs text-[#4b4b4b]">Require all vendor users to enable MFA</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={getSetting('auth.mfa_enforce_vendors') || false}
                onChange={(e) => handleUpdate('auth.mfa_enforce_vendors', e.target.checked)}
                className="sr-only peer"
                aria-label="Enforce MFA for Vendors"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7F232E]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7F232E]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-[#2b2b2b]">Enforce MFA for Customers</label>
              <p className="text-xs text-[#4b4b4b]">Require all customer users to enable MFA</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={getSetting('auth.mfa_enforce_customers') || false}
                onChange={(e) => handleUpdate('auth.mfa_enforce_customers', e.target.checked)}
                className="sr-only peer"
                aria-label="Enforce MFA for Customers"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7F232E]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7F232E]"></div>
            </label>
          </div>
        </div>
      </SettingsCard>

      {/* Password Policy */}
      <SettingsCard
        title="Password Policy"
        description="Configure password requirements and expiration"
        icon={<Lock className="h-5 w-5 text-[#7F232E]" />}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="password-min-length" className="text-sm font-medium text-[#2b2b2b] mb-1 block">
              Minimum Password Length
            </label>
            <input
              id="password-min-length"
              type="number"
              min="6"
              max="32"
              value={getSetting('auth.password_min_length') || 8}
              onChange={(e) => handleUpdate('auth.password_min_length', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
            />
          </div>

          <div>
            <label htmlFor="password-expiry" className="text-sm font-medium text-[#2b2b2b] mb-1 block">
              Password Expiry (days)
            </label>
            <input
              id="password-expiry"
              type="number"
              min="0"
              max="365"
              value={getSetting('auth.password_expiry_days') || 0}
              onChange={(e) => handleUpdate('auth.password_expiry_days', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
            />
            <p className="text-xs text-[#4b4b4b] mt-1">0 = never expires</p>
          </div>

          <div>
            <label htmlFor="account-lockout" className="text-sm font-medium text-[#2b2b2b] mb-1 block">
              Account Lockout Threshold
            </label>
            <input
              id="account-lockout"
              type="number"
              min="3"
              max="10"
              value={getSetting('auth.account_lockout_threshold') || 5}
              onChange={(e) => handleUpdate('auth.account_lockout_threshold', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
            />
            <p className="text-xs text-[#4b4b4b] mt-1">Failed login attempts before lockout</p>
          </div>
        </div>
      </SettingsCard>

      {/* CORS Settings */}
      <SettingsCard
        title="CORS Configuration"
        description="Configure allowed origins for cross-origin requests"
        icon={<Key className="h-5 w-5 text-[#7F232E]" />}
      >
        <div>
          <label htmlFor="cors-origins" className="text-sm font-medium text-[#2b2b2b] mb-1 block">
            Allowed Origins
          </label>
          <textarea
            id="cors-origins"
            rows={4}
            value={Array.isArray(getSetting('auth.cors_origins')) 
              ? getSetting('auth.cors_origins').join('\n') 
              : ''}
            onChange={(e) => {
              const origins = e.target.value.split('\n').filter(o => o.trim());
              handleUpdate('auth.cors_origins', origins);
            }}
            placeholder="http://localhost:5173&#10;https://yourdomain.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30 font-mono text-sm"
          />
          <p className="text-xs text-[#4b4b4b] mt-1">One origin per line</p>
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
        title="Confirm Security Setting Change"
        description="Please provide a reason for this security configuration change. This will be logged in the audit trail."
        actionLabel="Update Setting"
      />
    </div>
  );
};

