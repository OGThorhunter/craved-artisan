import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Wrench, AlertTriangle, Trash2, Database } from 'lucide-react';
import { SettingsCard } from './SettingsCard';
import { ReasonModal } from './ReasonModal';
import { ConfirmationDialog } from './ConfirmationDialog';
import Button from '../../ui/Button';
import { Badge } from '../../ui/Badge';

interface MaintenanceSettingsProps {
  settings: any[];
}

export const MaintenanceSettings: React.FC<MaintenanceSettingsProps> = ({ settings }) => {
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{ key: string; value: any } | null>(null);
  const [selectedNamespace, setSelectedNamespace] = useState('');
  const queryClient = useQueryClient();

  // Fetch maintenance status
  const { data: maintenanceStatus } = useQuery({
    queryKey: ['admin', 'ops', 'maintenance', 'status'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ops/maintenance/status', {
        credentials: 'include'
      });
      if (!response.ok) return null;
      const result = await response.json();
      return result.data;
    }
  });

  // Fetch cache info
  const { data: cacheInfo } = useQuery({
    queryKey: ['admin', 'ops', 'cache'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ops/cache', {
        credentials: 'include'
      });
      if (!response.ok) return null;
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
      queryClient.invalidateQueries({ queryKey: ['admin', 'ops', 'maintenance'] });
    }
  });

  const clearCacheMutation = useMutation({
    mutationFn: async ({ namespace, reason }: { namespace: string; reason: string }) => {
      const response = await fetch('/api/admin/settings/clear-cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ namespace, reason })
      });
      if (!response.ok) throw new Error('Failed to clear cache');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ops', 'cache'] });
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

  const handleClearCache = (namespace: string) => {
    setSelectedNamespace(namespace);
    setShowClearCacheDialog(true);
  };

  const confirmClearCache = (reason: string) => {
    clearCacheMutation.mutate({
      namespace: selectedNamespace,
      reason
    });
  };

  return (
    <div className="space-y-6">
      {/* Maintenance Mode */}
      <SettingsCard
        title="Maintenance Mode"
        description="Control platform availability and read-only modes"
        icon={<Wrench className="h-5 w-5 text-[#7F232E]" />}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium text-[#2b2b2b]">Global Read-Only Mode</label>
              <p className="text-xs text-[#4b4b4b]">Entire platform in read-only mode</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getSetting('maintenance.global_readonly') ? 'destructive' : 'success'}>
                {getSetting('maintenance.global_readonly') ? 'ACTIVE' : 'Inactive'}
              </Badge>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={getSetting('maintenance.global_readonly') || false}
                  onChange={(e) => handleUpdate('maintenance.global_readonly', e.target.checked)}
                  className="sr-only peer"
                  aria-label="Global Read-Only Mode"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7F232E]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium text-[#2b2b2b]">Vendor Read-Only Mode</label>
              <p className="text-xs text-[#4b4b4b]">Vendor dashboards in read-only mode</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getSetting('maintenance.vendor_readonly') ? 'warning' : 'success'}>
                {getSetting('maintenance.vendor_readonly') ? 'ACTIVE' : 'Inactive'}
              </Badge>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={getSetting('maintenance.vendor_readonly') || false}
                  onChange={(e) => handleUpdate('maintenance.vendor_readonly', e.target.checked)}
                  className="sr-only peer"
                  aria-label="Vendor Read-Only Mode"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7F232E]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium text-[#2b2b2b]">Queue Drain Mode</label>
              <p className="text-xs text-[#4b4b4b]">Stop accepting new queue jobs</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getSetting('maintenance.queue_drain') ? 'warning' : 'success'}>
                {getSetting('maintenance.queue_drain') ? 'DRAINING' : 'Normal'}
              </Badge>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={getSetting('maintenance.queue_drain') || false}
                  onChange={(e) => handleUpdate('maintenance.queue_drain', e.target.checked)}
                  className="sr-only peer"
                  aria-label="Queue Drain Mode"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7F232E]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
              </label>
            </div>
          </div>

          {(getSetting('maintenance.global_readonly') || getSetting('maintenance.vendor_readonly') || getSetting('maintenance.queue_drain')) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> One or more maintenance modes are active. This may impact platform functionality.
              </p>
            </div>
          )}
        </div>
      </SettingsCard>

      {/* Cache Management */}
      <SettingsCard
        title="Cache Management"
        description="View and manage Redis cache namespaces"
        icon={<Database className="h-5 w-5 text-[#7F232E]" />}
      >
        {cacheInfo?.stats && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-[#4b4b4b] mb-1">Memory Used</p>
              <p className="text-lg font-semibold text-[#2b2b2b]">
                {cacheInfo.stats.usedMemoryPercent?.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-[#4b4b4b] mb-1">Hit Rate</p>
              <p className="text-lg font-semibold text-[#2b2b2b]">
                {cacheInfo.stats.hitRate?.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-[#4b4b4b] mb-1">Evicted Keys</p>
              <p className="text-lg font-semibold text-[#2b2b2b]">
                {cacheInfo.stats.evictedKeys || 0}
              </p>
            </div>
          </div>
        )}

        {cacheInfo?.namespaces && cacheInfo.namespaces.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#2b2b2b] mb-2">Cache Namespaces</p>
            {cacheInfo.namespaces.map((ns: any) => (
              <div key={ns.namespace} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <span className="text-sm text-[#2b2b2b] font-mono">{ns.namespace}</span>
                  {ns.keyCount && (
                    <span className="text-xs text-[#4b4b4b] ml-2">({ns.keyCount} keys)</span>
                  )}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleClearCache(ns.namespace)}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Clearing cache will temporarily impact performance as data is reloaded. Use with caution.
          </p>
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
        title="Confirm Maintenance Setting Change"
        description="Please provide a reason for this maintenance configuration change. This will be logged in the audit trail."
        actionLabel="Update Setting"
      />

      {/* Clear Cache Confirmation with Reason */}
      <ReasonModal
        isOpen={showClearCacheDialog}
        onClose={() => {
          setShowClearCacheDialog(false);
          setSelectedNamespace('');
        }}
        onConfirm={(reason) => {
          confirmClearCache(reason);
          setShowClearCacheDialog(false);
          setSelectedNamespace('');
        }}
        title="Confirm Cache Clear"
        description={`You are about to clear the "${selectedNamespace}" cache namespace. This action will be audited. Please provide a reason.`}
        actionLabel="Clear Cache"
      />
    </div>
  );
};

