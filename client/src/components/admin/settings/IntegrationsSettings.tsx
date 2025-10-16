import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreditCard,
  Mail,
  MessageSquare,
  Database,
  Cloud,
  CheckCircle,
  AlertCircle,
  PlayCircle
} from 'lucide-react';
import { SettingsCard } from './SettingsCard';
import { StatusIndicator } from './StatusIndicator';
import { MaskedInput } from './MaskedInput';
import Button from '../../ui/Button';
import { Badge } from '../../ui/Badge';

export const IntegrationsSettings: React.FC = () => {
  const [testingService, setTestingService] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch integration statuses
  const { data: statuses, isLoading } = useQuery({
    queryKey: ['admin', 'integrations', 'status'],
    queryFn: async () => {
      const response = await fetch('/api/admin/settings/integrations/status', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch integration statuses');
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Get S3 status
  const { data: s3Status } = useQuery({
    queryKey: ['admin', 'integrations', 's3', 'status'],
    queryFn: async () => {
      const response = await fetch('/api/admin/settings/integrations/s3/status', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch S3 status');
      const result = await response.json();
      return result.data;
    }
  });

  // Test integration mutation
  const testMutation = useMutation({
    mutationFn: async (service: string) => {
      const response = await fetch(`/api/admin/settings/integrations/${service}/test`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Test failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'integrations', 'status'] });
      setTestingService(null);
    },
    onError: () => {
      setTestingService(null);
    }
  });

  const handleTest = (service: string) => {
    setTestingService(service);
    testMutation.mutate(service);
  };

  const getStatus = (serviceName: string) => {
    return statuses?.find((s: any) => s.service.toLowerCase() === serviceName.toLowerCase());
  };

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName.toLowerCase()) {
      case 'stripe':
        return <CreditCard className="h-5 w-5 text-[#7F232E]" />;
      case 'sendgrid':
        return <Mail className="h-5 w-5 text-[#7F232E]" />;
      case 'twilio':
        return <MessageSquare className="h-5 w-5 text-[#7F232E]" />;
      case 'redis':
        return <Database className="h-5 w-5 text-[#7F232E]" />;
      case 'database':
        return <Database className="h-5 w-5 text-[#7F232E]" />;
      case 's3':
        return <Cloud className="h-5 w-5 text-[#7F232E]" />;
      default:
        return <CheckCircle className="h-5 w-5 text-[#7F232E]" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7F232E] mx-auto mb-4"></div>
          <p className="text-[#4b4b4b]">Loading integration statuses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stripe */}
      <SettingsCard
        title="Stripe"
        description="Payment processing and Connect integration"
        icon={getServiceIcon('stripe')}
      >
        <div className="space-y-4">
          <StatusIndicator
            status={getStatus('stripe')?.status || 'UNKNOWN'}
            label="Connection Status"
            message={getStatus('stripe')?.message}
          />

          <MaskedInput
            value={process.env.VITE_STRIPE_PUBLISHABLE_KEY || ''}
            label="Publishable Key"
            canReveal={false}
          />

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => handleTest('stripe')}
              disabled={testingService === 'stripe'}
              className="flex items-center gap-2"
            >
              <PlayCircle className="h-4 w-4" />
              {testingService === 'stripe' ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>

          {getStatus('stripe')?.details && (
            <div className="text-sm text-[#4b4b4b] bg-gray-50 p-3 rounded-lg">
              <p><strong>Available Balance:</strong> {JSON.stringify(getStatus('stripe')?.details.available)}</p>
              <p><strong>Pending:</strong> {JSON.stringify(getStatus('stripe')?.details.pending)}</p>
            </div>
          )}
        </div>
      </SettingsCard>

      {/* SendGrid */}
      <SettingsCard
        title="SendGrid"
        description="Email delivery service"
        icon={getServiceIcon('sendgrid')}
      >
        <div className="space-y-4">
          <StatusIndicator
            status={getStatus('sendgrid')?.status || 'UNKNOWN'}
            label="Connection Status"
            message={getStatus('sendgrid')?.message}
          />

          <MaskedInput
            value={getStatus('sendgrid')?.details?.keyMasked || 'Not configured'}
            label="API Key"
            canReveal={false}
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Coming Soon:</strong> Full SendGrid management including template editing, sender verification, and delivery analytics.
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Twilio */}
      <SettingsCard
        title="Twilio"
        description="SMS notifications and alerts"
        icon={getServiceIcon('twilio')}
      >
        <div className="space-y-4">
          <StatusIndicator
            status={getStatus('twilio')?.status || 'UNKNOWN'}
            label="Connection Status"
            message={getStatus('twilio')?.message}
          />

          {getStatus('twilio')?.details?.phone && (
            <div>
              <label className="text-sm font-medium text-[#2b2b2b] mb-1 block">
                Twilio Phone Number
              </label>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                {getStatus('twilio').details.phone}
              </code>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Coming Soon:</strong> SMS delivery logs, phone number management, and messaging analytics.
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Redis */}
      <SettingsCard
        title="Redis"
        description="Cache and session storage"
        icon={getServiceIcon('redis')}
      >
        <div className="space-y-4">
          <StatusIndicator
            status={getStatus('redis')?.status || 'UNKNOWN'}
            label="Connection Status"
            message={getStatus('redis')?.message}
          />

          {getStatus('redis')?.details && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-[#2b2b2b] mb-1 block">
                  Latency
                </label>
                <span className="text-sm text-[#4b4b4b]">
                  {getStatus('redis').details.latency}
                </span>
              </div>

              <div>
                <label className="text-sm font-medium text-[#2b2b2b] mb-1 block">
                  Memory Used
                </label>
                <span className="text-sm text-[#4b4b4b]">
                  {getStatus('redis').details.memoryUsed}
                </span>
              </div>

              <div>
                <label className="text-sm font-medium text-[#2b2b2b] mb-1 block">
                  Hit Rate
                </label>
                <span className="text-sm text-[#4b4b4b]">
                  {getStatus('redis').details.hitRate}
                </span>
              </div>
            </div>
          )}
        </div>
      </SettingsCard>

      {/* Database */}
      <SettingsCard
        title="Database"
        description="PostgreSQL/SQLite database connection"
        icon={getServiceIcon('database')}
      >
        <div className="space-y-4">
          <StatusIndicator
            status={getStatus('database')?.status || 'UNKNOWN'}
            label="Connection Status"
            message={getStatus('database')?.message}
          />

          {getStatus('database')?.details && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-[#2b2b2b] mb-1 block">
                  Type
                </label>
                <Badge variant="secondary">
                  {getStatus('database').details.type}
                </Badge>
              </div>

              <div>
                <label className="text-sm font-medium text-[#2b2b2b] mb-1 block">
                  Tables
                </label>
                <span className="text-sm text-[#4b4b4b]">
                  {getStatus('database').details.tables}
                </span>
              </div>

              <div>
                <label className="text-sm font-medium text-[#2b2b2b] mb-1 block">
                  Latency
                </label>
                <span className="text-sm text-[#4b4b4b]">
                  {getStatus('database').details.latency}
                </span>
              </div>
            </div>
          )}
        </div>
      </SettingsCard>

      {/* S3 */}
      <SettingsCard
        title="Amazon S3"
        description="File storage for compliance documents"
        icon={getServiceIcon('s3')}
      >
        <div className="space-y-4">
          <StatusIndicator
            status={getStatus('s3')?.status || 'UNKNOWN'}
            label="Connection Status"
            message={getStatus('s3')?.message}
          />

          {s3Status && !s3Status.configured && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> {s3Status.warning}
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Configure AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET, and AWS_REGION environment variables to enable file uploads.
              </p>
            </div>
          )}

          {getStatus('s3')?.details && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#2b2b2b] mb-1 block">
                  Bucket
                </label>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {getStatus('s3').details.bucket}
                </code>
              </div>

              <div>
                <label className="text-sm font-medium text-[#2b2b2b] mb-1 block">
                  Region
                </label>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {getStatus('s3').details.region}
                </code>
              </div>
            </div>
          )}
        </div>
      </SettingsCard>

      {/* TaxJar */}
      <SettingsCard
        title="TaxJar"
        description="Automated sales tax calculation"
        icon={<AlertCircle className="h-5 w-5 text-[#7F232E]" />}
      >
        <div className="space-y-4">
          <StatusIndicator
            status="WARN"
            label="Integration Status"
            message="Coming Soon - Not yet integrated"
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Coming Soon:</strong> TaxJar integration for automated sales tax calculation and nexus management.
            </p>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
};

