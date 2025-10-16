import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Mail, MessageSquare, Send } from 'lucide-react';
import { SettingsCard } from './SettingsCard';
import { ReasonModal } from './ReasonModal';
import { MaskedInput } from './MaskedInput';
import Button from '../../ui/Button';

interface NotificationsSettingsProps {
  settings: any[];
}

export const NotificationsSettings: React.FC<NotificationsSettingsProps> = ({ settings }) => {
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{ key: string; value: any } | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [testPhone, setTestPhone] = useState('');
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

  const testNotificationMutation = useMutation({
    mutationFn: async ({ type, recipient }: { type: 'EMAIL' | 'SMS'; recipient: string }) => {
      const response = await fetch('/api/admin/settings/test-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type, recipient })
      });
      if (!response.ok) throw new Error('Failed to send test notification');
      return response.json();
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

  const handleTestEmail = () => {
    if (testEmail) {
      testNotificationMutation.mutate({ type: 'EMAIL', recipient: testEmail });
    }
  };

  const handleTestSMS = () => {
    if (testPhone) {
      testNotificationMutation.mutate({ type: 'SMS', recipient: testPhone });
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Settings */}
      <SettingsCard
        title="Email Configuration"
        description="Configure email sender and SendGrid settings"
        icon={<Mail className="h-5 w-5 text-[#7F232E]" />}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="email-sender" className="text-sm font-medium text-[#2b2b2b] mb-1 block">
                Sender Email Address
              </label>
              <input
                id="email-sender"
                type="email"
                value={getSetting('notifications.email_sender') || ''}
                onChange={(e) => handleUpdate('notifications.email_sender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
              />
            </div>

            <div>
              <label htmlFor="email-sender-name" className="text-sm font-medium text-[#2b2b2b] mb-1 block">
                Sender Name
              </label>
              <input
                id="email-sender-name"
                type="text"
                value={getSetting('notifications.email_sender_name') || ''}
                onChange={(e) => handleUpdate('notifications.email_sender_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
              />
            </div>
          </div>

          <MaskedInput
            value={process.env.SENDGRID_API_KEY || 'Not configured'}
            label="SendGrid API Key (from environment)"
            canReveal={false}
          />

          <div className="pt-4 border-t">
            <label htmlFor="test-email" className="text-sm font-medium text-[#2b2b2b] mb-1 block">
              Test Email Delivery
            </label>
            <div className="flex gap-2">
              <input
                id="test-email"
                type="email"
                placeholder="recipient@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
              />
              <Button
                variant="primary"
                onClick={handleTestEmail}
                disabled={!testEmail || testNotificationMutation.isPending}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {testNotificationMutation.isPending ? 'Sending...' : 'Send Test'}
              </Button>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* SMS Settings */}
      <SettingsCard
        title="SMS Configuration"
        description="Configure Twilio SMS notifications"
        icon={<MessageSquare className="h-5 w-5 text-[#7F232E]" />}
      >
        <div className="space-y-4">
          <MaskedInput
            value={process.env.TWILIO_PHONE || 'Not configured'}
            label="Twilio Phone Number (from environment)"
            canReveal={false}
          />

          <div className="pt-4 border-t">
            <label htmlFor="test-sms" className="text-sm font-medium text-[#2b2b2b] mb-1 block">
              Test SMS Delivery
            </label>
            <div className="flex gap-2">
              <input
                id="test-sms"
                type="tel"
                placeholder="+1234567890"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
              />
              <Button
                variant="primary"
                onClick={handleTestSMS}
                disabled={!testPhone || testNotificationMutation.isPending}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {testNotificationMutation.isPending ? 'Sending...' : 'Send Test'}
              </Button>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Notification Preferences */}
      <SettingsCard
        title="Notification Settings"
        description="Configure system-wide notification behavior"
        icon={<Bell className="h-5 w-5 text-[#7F232E]" />}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-[#2b2b2b]">Daily Digest Emails</label>
              <p className="text-xs text-[#4b4b4b]">Send daily summary emails to users</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={getSetting('notifications.daily_digest_enabled') !== false}
                onChange={(e) => handleUpdate('notifications.daily_digest_enabled', e.target.checked)}
                className="sr-only peer"
                aria-label="Daily Digest Emails"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7F232E]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7F232E]"></div>
            </label>
          </div>

          <div>
            <label htmlFor="error-alert-recipients" className="text-sm font-medium text-[#2b2b2b] mb-1 block">
              Error Alert Recipients
            </label>
            <textarea
              id="error-alert-recipients"
              rows={3}
              value={Array.isArray(getSetting('notifications.error_alert_recipients'))
                ? getSetting('notifications.error_alert_recipients').join('\n')
                : ''}
              onChange={(e) => {
                const recipients = e.target.value.split('\n').filter(r => r.trim());
                handleUpdate('notifications.error_alert_recipients', recipients);
              }}
              placeholder="ops@cravedartisan.com&#10;dev@cravedartisan.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30 text-sm"
            />
            <p className="text-xs text-[#4b4b4b] mt-1">One email per line</p>
          </div>
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
        title="Confirm Notification Setting Change"
        description="Please provide a reason for this notification configuration change. This will be logged in the audit trail."
        actionLabel="Update Setting"
      />
    </div>
  );
};

