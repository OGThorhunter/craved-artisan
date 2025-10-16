import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GitBranch, Calendar, User, Settings, Shield, AlertTriangle } from 'lucide-react';
import Card from '../ui/Card';
import { Badge } from '../ui/Badge';
import Button from '../ui/Button';
import FeatureFlagsTable from './FeatureFlagsTable';
import ConfirmActionDialog from './ConfirmActionDialog';

export default function DeploysConfigView() {
  const [maintenanceDialog, setMaintenanceDialog] = useState<{
    open: boolean;
    type: string;
    enabled: boolean;
  }>({ open: false, type: '', enabled: false });

  const queryClient = useQueryClient();

  // Fetch current deployment
  const { data: deployment } = useQuery({
    queryKey: ['admin', 'ops', 'deployment'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ops/deployment/current');
      if (!response.ok) throw new Error('Failed to fetch deployment');
      const result = await response.json();
      return result.data;
    }
  });

  // Fetch env config
  const { data: envConfig } = useQuery({
    queryKey: ['admin', 'ops', 'config'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ops/config/env');
      if (!response.ok) throw new Error('Failed to fetch config');
      const result = await response.json();
      return result.data;
    }
  });

  // Fetch maintenance status
  const { data: maintenanceStatus } = useQuery({
    queryKey: ['admin', 'ops', 'maintenance'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ops/maintenance/status');
      if (!response.ok) throw new Error('Failed to fetch maintenance status');
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 10000
  });

  // Fetch feature flags
  const { data: flags } = useQuery({
    queryKey: ['admin', 'ops', 'feature-flags'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ops/feature-flags');
      if (!response.ok) throw new Error('Failed to fetch feature flags');
      const result = await response.json();
      return result.data;
    }
  });

  // Maintenance toggle mutation
  const maintenanceMutation = useMutation({
    mutationFn: async ({ type, enabled, reason }: { type: string; enabled: boolean; reason: string }) => {
      const response = await fetch('/api/admin/ops/maintenance/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, enabled, reason })
      });
      if (!response.ok) throw new Error('Failed to toggle maintenance mode');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ops', 'maintenance'] });
      setMaintenanceDialog({ open: false, type: '', enabled: false });
    }
  });

  const handleMaintenanceToggle = (type: string, enabled: boolean) => {
    setMaintenanceDialog({ open: true, type, enabled });
  };

  const confirmMaintenanceToggle = (reason?: string) => {
    if (!reason) return;
    maintenanceMutation.mutate({
      type: maintenanceDialog.type,
      enabled: maintenanceDialog.enabled,
      reason
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Build */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Current Deployment</h3>
        <Card className="p-6">
          {deployment && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-[#4b4b4b]" />
                  <div>
                    <p className="text-sm text-[#4b4b4b]">Git SHA</p>
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {deployment.gitSha.substring(0, 7)}
                    </code>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-[#4b4b4b]" />
                  <div>
                    <p className="text-sm text-[#4b4b4b]">Branch</p>
                    <Badge variant="secondary">{deployment.gitBranch}</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[#4b4b4b]" />
                  <div>
                    <p className="text-sm text-[#4b4b4b]">Author</p>
                    <p className="text-sm font-medium text-[#2b2b2b]">{deployment.gitAuthor}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#4b4b4b]" />
                  <div>
                    <p className="text-sm text-[#4b4b4b]">Deployed</p>
                    <p className="text-sm font-medium text-[#2b2b2b]">
                      {new Date(deployment.deployedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Environment Config */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Environment Configuration</h3>
        <Card className="p-6">
          {envConfig && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(envConfig).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 border border-[#7F232E]/10 rounded-lg">
                  <span className="text-sm font-medium text-[#2b2b2b]">{key}</span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded text-[#4b4b4b]">
                    {String(value)}
                  </code>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Maintenance Mode Controls */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Maintenance Mode</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-[#4b4b4b]" />
              <h4 className="font-medium text-[#2b2b2b]">Global Read-Only</h4>
            </div>
            <p className="text-sm text-[#4b4b4b] mb-4">
              Block all mutations system-wide. Admins can bypass.
            </p>
            <Button
              variant={maintenanceStatus?.globalReadonly ? 'destructive' : 'secondary'}
              onClick={() => handleMaintenanceToggle('GLOBAL_READONLY', !maintenanceStatus?.globalReadonly)}
              className="w-full"
            >
              {maintenanceStatus?.globalReadonly ? 'Disable' : 'Enable'}
            </Button>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="h-5 w-5 text-[#4b4b4b]" />
              <h4 className="font-medium text-[#2b2b2b]">Vendor Read-Only</h4>
            </div>
            <p className="text-sm text-[#4b4b4b] mb-4">
              Block vendor mutations only. Customers unaffected.
            </p>
            <Button
              variant={maintenanceStatus?.vendorReadonly ? 'destructive' : 'secondary'}
              onClick={() => handleMaintenanceToggle('VENDOR_READONLY', !maintenanceStatus?.vendorReadonly)}
              className="w-full"
            >
              {maintenanceStatus?.vendorReadonly ? 'Disable' : 'Enable'}
            </Button>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-5 w-5 text-[#4b4b4b]" />
              <h4 className="font-medium text-[#2b2b2b]">Queue Drain</h4>
            </div>
            <p className="text-sm text-[#4b4b4b] mb-4">
              Stop accepting new jobs. Process existing queue.
            </p>
            <Button
              variant={maintenanceStatus?.queueDrain ? 'destructive' : 'secondary'}
              onClick={() => handleMaintenanceToggle('QUEUE_DRAIN', !maintenanceStatus?.queueDrain)}
              className="w-full"
            >
              {maintenanceStatus?.queueDrain ? 'Disable' : 'Enable'}
            </Button>
          </Card>
        </div>
      </div>

      {/* Feature Flags */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Feature Flags</h3>
        <FeatureFlagsTable flags={flags || []} />
      </div>

      {/* Maintenance Confirmation Dialog */}
      <ConfirmActionDialog
        isOpen={maintenanceDialog.open}
        onClose={() => setMaintenanceDialog({ open: false, type: '', enabled: false })}
        onConfirm={confirmMaintenanceToggle}
        title={`${maintenanceDialog.enabled ? 'Enable' : 'Disable'} ${maintenanceDialog.type}`}
        description={`This will ${maintenanceDialog.enabled ? 'enable' : 'disable'} maintenance mode. ${
          maintenanceDialog.enabled ? 'Users will see a banner and writes will be blocked.' : 'Normal operations will resume.'
        }`}
        actionLabel={maintenanceDialog.enabled ? 'Enable Maintenance' : 'Disable Maintenance'}
        requireReason={true}
        requireTypedConfirmation={maintenanceDialog.enabled}
        confirmationPhrase="ENABLE MAINTENANCE"
        isDangerous={maintenanceDialog.enabled}
        isLoading={maintenanceMutation.isPending}
      />
    </div>
  );
}

